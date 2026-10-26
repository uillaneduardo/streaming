import Fastify from "fastify";
import type { RowDataPacket } from "mysql2";
import { pool } from "./db.js";
import {registerAuth} from "./auth.js";
import {registerStudio} from "./studio.js";
import {registerStudioManagement} from "./studio-management.js";
import {registerStudioBulk} from "./studio-bulk.js";
import {registerMedia} from "./media.js";
import { publicEpisodeState, sanitizedYoutubeId } from "./domain/release.js";

const app = Fastify({ logger: true, trustProxy: true, bodyLimit:1024*1024 });
registerAuth(app);
registerStudio(app);
registerStudioManagement(app);
registerStudioBulk(app);
registerMedia(app);
type Row = RowDataPacket & Record<string, unknown>;
const records = async (sql:string):Promise<Row[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(sql);
  return rows as Row[];
};
const iso=(value:unknown):string=>typeof value === "string" && value ? value.replace(" ","T")+"Z" : "";
const message=(error:unknown)=> error instanceof Error ? error.message : "unknown";
app.get("/api/v1/health",async (_request,reply)=>{
  try { await pool.query("SELECT 1"); return {status:"ok",service:"cenalivre-api"}; }
  catch (err) { app.log.error(err);return reply.code(503).send({status:"unavailable"}); }
});
app.get("/api/v1/public/bootstrap",async (_request,reply)=>{
  const [seriesRows,links,seasons,episodeRows,bannerRows,sectionRows,brandRows] = await Promise.all([
    records("SELECT id,title,slug,category,summary,poster,banner,featured FROM series WHERE visibility = 'public' ORDER BY title"),
    records("SELECT series_id,team_id FROM series_teams"),
    records("SELECT se.id,se.series_id,se.number,se.title FROM seasons se JOIN series s ON s.id=se.series_id WHERE s.visibility='public' AND se.status='published' ORDER BY se.number"),
    records("SELECT e.id,e.season_id,e.number,e.title,e.summary,e.youtube_id,e.thumbnail,e.release_at,e.end_at,e.status,e.duration FROM episodes e JOIN seasons se ON se.id=e.season_id JOIN series s ON s.id=se.series_id WHERE s.visibility='public' AND se.status='published' ORDER BY e.number"),
    records("SELECT id,title,subtitle,image,mobile_image,target_series_id,start_at,end_at,active,display_order FROM banners ORDER BY display_order"),
    records("SELECT id,title,kind,active FROM home_sections ORDER BY display_order"),
    records("SELECT site_name,site_description,logo_url,icon_url FROM settings WHERE id=1")
  ]);
  const now=new Date();
  const series=seriesRows.map(s=>({
    id:s.id,title:s.title,slug:s.slug,category:s.category,summary:s.summary,
    poster:s.poster,banner:s.banner,featured:Boolean(s.featured),
    teamIds:links.filter(l=>l.series_id===s.id).map(l=>l.team_id)
  }));
  const episodes=episodeRows.flatMap(e=>{
    const state=publicEpisodeState({
      status:e.status as "draft"|"scheduled"|"published"|"suspended",
      releaseAt:iso(e.release_at)||null,endAt:iso(e.end_at)||null
    },now);
    if(state==="hidden")return [];
    return [{
      id:e.id,seasonId:e.season_id,number:e.number,title:e.title,summary:e.summary,
      youtube:state==="available" ? (sanitizedYoutubeId(e.youtube_id)??"") : "",
      thumbnail:e.thumbnail,releaseAt:iso(e.release_at),endAt:iso(e.end_at),
      status:state==="upcoming"?"scheduled":"published",duration:e.duration,
      availability:state
    }];
  });
  const banners=bannerRows.filter(b=>Boolean(b.active)&&(!b.start_at||new Date(iso(b.start_at))<=now)&&(!b.end_at||new Date(iso(b.end_at))>now)).map(b=>({
    id:b.id,title:b.title,subtitle:b.subtitle,image:b.image,mobileImage:b.mobile_image||"",
    target:b.target_series_id,startAt:iso(b.start_at),endAt:iso(b.end_at),active:true,order:b.display_order
  }));
  reply.header("Cache-Control","public, max-age=30");
  return {
    branding:brandRows.length?{siteName:brandRows[0].site_name,siteDescription:brandRows[0].site_description,logoUrl:brandRows[0].logo_url||"",iconUrl:brandRows[0].icon_url||""}:null,
    series,
    seasons:seasons.map(s=>({id:s.id,seriesId:s.series_id,number:s.number,title:s.title})),
    episodes,banners,
    homeSections:sectionRows.filter(s=>Boolean(s.active)).map(s=>({id:s.id,title:s.title,kind:s.kind,active:true}))
  };
});
app.get<{Params:{slug:string}}>("/api/v1/public/series/:slug",async (request,reply)=>{
  const [rows]=await pool.execute<RowDataPacket[]>("SELECT id,title,slug,category,summary,poster,banner,featured FROM series WHERE slug=? AND visibility='public' LIMIT 1",[request.params.slug]);
  return rows.length ? rows[0] : reply.code(404).send({error:"not_found"});
});
app.get<{Params:{id:string}}>("/api/v1/public/episodes/:id",async (request,reply)=>{
  const [rows]=await pool.execute<RowDataPacket[]>(`SELECT e.id,e.title,e.summary,e.youtube_id,e.release_at,e.end_at,e.status FROM episodes e
    JOIN seasons se ON se.id=e.season_id JOIN series s ON s.id=se.series_id
    WHERE e.id=? AND s.visibility='public' AND se.status='published' LIMIT 1`,[request.params.id]);
  if(!rows.length)return reply.code(404).send({error:"not_found"});
  const e=rows[0] as Row;
  const state=publicEpisodeState({status:e.status as "draft"|"scheduled"|"published"|"suspended",releaseAt:iso(e.release_at),endAt:iso(e.end_at)});
  if(state==="hidden")return reply.code(404).send({error:"not_found"});
  return {id:e.id,title:e.title,summary:e.summary,availability:state,releaseAt:iso(e.release_at),endAt:iso(e.end_at),youtube:state==="available"?sanitizedYoutubeId(e.youtube_id):null};
});
app.setErrorHandler((error,request,reply)=>{
  if(error.validation) return reply.code(400).send({error:"bad_request"});
  app.log.error({err:error,path:request.url},"API error");
  reply.code(500).send({error:"internal_error"});
});
const close=async()=>{await app.close();await pool.end();};
process.on("SIGTERM",()=>{void close();});
process.on("SIGINT",()=>{void close();});
try {await app.listen({port:Number(process.env.PORT??3000),host:"0.0.0.0"});}catch(error){app.log.error(message(error));process.exit(1);}
