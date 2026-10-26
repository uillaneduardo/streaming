import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor} from "./auth.js";
import {seriesPermission} from "./studio.js";

type BulkResource="series"|"seasons"|"episodes";
type BulkAction="delete"|"set_status";
type Row=RowDataPacket&Record<string,any>;
const validId=(value:unknown):value is string=>typeof value==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(value);
const allowedStatuses:Record<BulkResource,string[]>={
  series:["draft","public","suspended"],
  seasons:["draft","published","suspended"],
  episodes:["draft","scheduled","published","suspended"]
};
const errors=(reply:FastifyReply,status:number,code:string,id?:string)=>
  reply.code(status).send({error:code,...(id?{id}:{})});
const typeTable:Record<BulkResource,string>={series:"series",seasons:"seasons",episodes:"episodes"};
const idMarkers=(ids:string[])=>ids.map(()=>"?").join(",");
const audit=async(con:any,actorId:string,action:string,resource:BulkResource,id:string)=>
  con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
    [randomUUID(),actorId,action,resource==="seasons"?"season":resource==="episodes"?"episode":"series",id]);

/**
 * Every requested ID must pass the same authorization and dependency rules before any mutation.
 * All writes and audit events commit in one transaction; partial bulk operations are not possible.
 */
export function registerStudioBulk(app:FastifyInstance){
  app.post<{Body:{resource?:unknown;action?:unknown;ids?:unknown;status?:unknown}}>(
    "/api/v1/studio/bulk",async(req,reply)=>{
      const user=await requireActor(req,reply,true);if(!user)return;
      const resource=req.body?.resource,action=req.body?.action,requested=req.body?.ids;
      if(!["series","seasons","episodes"].includes(String(resource))||
        !["delete","set_status"].includes(String(action))||
        !Array.isArray(requested)||requested.length<1||requested.length>100||
        requested.some(id=>!validId(id))||new Set(requested).size!==requested.length)
        return errors(reply,400,"invalid_bulk_request");
      const kind=resource as BulkResource,operation=action as BulkAction;
      const nextStatus=req.body?.status;
      if(operation==="set_status"&&!allowedStatuses[kind].includes(String(nextStatus)))
        return errors(reply,400,"invalid_status");
      if(operation==="delete"&&nextStatus!==undefined)return errors(reply,400,"invalid_bulk_request");

      // Deterministic lock order avoids deadlocks in concurrent bulk requests.
      const ids=(requested as string[]).slice().sort();
      const con=await pool.getConnection();
      try{
        await con.beginTransaction();
        const columns=kind==="series"?"id,visibility AS status,id AS seriesId":
          kind==="seasons"?"id,status,series_id AS seriesId":
          "e.id,e.status,e.release_at AS releaseAt,se.series_id AS seriesId";
        const table=kind==="episodes"?
          "episodes e JOIN seasons se ON se.id=e.season_id":typeTable[kind];
        const idColumn=kind==="episodes"?"e.id":"id";
        const [all]=await con.execute<RowDataPacket[]>(
          "SELECT "+columns+" FROM "+table+" WHERE "+idColumn+
          " IN ("+idMarkers(ids)+") ORDER BY "+idColumn+" FOR UPDATE",ids);
        const rows=all as Row[];
        if(rows.length!==ids.length)
          return await rollback(reply,con,404,"item_not_found");
        for(const row of rows){
          const sid=String(row.seriesId);
          if(!await seriesPermission(user,sid,"edit"))
            return await rollback(reply,con,403,"forbidden",String(row.id));
          // Publishing or retracting public material needs publication permission.
          const publishState=kind==="series"?"public":"published";
          const wasPublished=String(row.status)===publishState;
          const becomingPublished=nextStatus===publishState;
          const mustPublish=kind==="series"&&operation==="set_status"||
            (operation==="delete"&&wasPublished)||
            (operation==="set_status"&&(wasPublished||becomingPublished));
          if(mustPublish&&!await seriesPermission(user,sid,"publish"))
            return await rollback(reply,con,403,"publish_denied",String(row.id));
          if(kind==="episodes"&&operation==="set_status"&&
            (nextStatus==="published"||nextStatus==="scheduled")&&!row.releaseAt)
            return await rollback(reply,con,409,"episode_missing_release_date",String(row.id));
        }
        if(operation==="delete"){
          if(kind==="series"){
            const [seasonDeps]=await con.execute<RowDataPacket[]>(
              "SELECT series_id FROM seasons WHERE series_id IN ("+idMarkers(ids)+") LIMIT 1",ids);
            if(seasonDeps.length)return await rollback(reply,con,409,"series_has_seasons",String((seasonDeps as Row[])[0].series_id));
            const [bannerDeps]=await con.execute<RowDataPacket[]>(
              "SELECT target_series_id FROM banners WHERE target_series_id IN ("+idMarkers(ids)+") LIMIT 1",ids);
            if(bannerDeps.length)return await rollback(reply,con,409,"series_has_banners",String((bannerDeps as Row[])[0].target_series_id));
            await con.execute("DELETE FROM series_grants WHERE series_id IN ("+idMarkers(ids)+")",ids);
            await con.execute("DELETE FROM series_teams WHERE series_id IN ("+idMarkers(ids)+")",ids);
          }else if(kind==="seasons"){
            const [episodeDeps]=await con.execute<RowDataPacket[]>(
              "SELECT season_id FROM episodes WHERE season_id IN ("+idMarkers(ids)+") LIMIT 1",ids);
            if(episodeDeps.length)return await rollback(reply,con,409,"season_has_episodes",String((episodeDeps as Row[])[0].season_id));
          }
          await con.execute("DELETE FROM "+typeTable[kind]+" WHERE id IN ("+idMarkers(ids)+")",ids);
        }else{
          const field=kind==="series"?"visibility":"status";
          await con.execute("UPDATE "+typeTable[kind]+" SET "+field+"=? WHERE id IN ("+idMarkers(ids)+")",
            [nextStatus,...ids]);
        }
        for(const id of ids)
          await audit(con,user.id,operation==="delete"?
            kind+".deleted":kind+".status.updated",kind,id);
        await con.commit();
        return {ok:true,resource:kind,action:operation,count:ids.length,
          ...(operation==="set_status"?{status:nextStatus}:{})};
      }catch(error){
        await con.rollback();
        throw error;
      }finally{con.release();}
    });
}

async function rollback(reply:FastifyReply,con:any,status:number,code:string,id?:string){
  await con.rollback();
  return errors(reply,status,code,id);
}
