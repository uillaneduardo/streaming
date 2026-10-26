const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const base='http://localhost:8088';
let cookie='',csrf='';
async function call(path,method='GET',body){
  const headers={'Accept':'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(cookie)headers['Cookie']=cookie;
  if(method!=='GET'&&csrf)headers['x-csrf-token']=csrf;
  const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.json()}catch{data={}};
  return {code:response.status,data,setCookie:response.headers.get('set-cookie')};
}
(async()=>{
  assert.equal((await call('/api/v1/studio/bootstrap')).code,401);
  const login=await call('/api/v1/auth/login','POST',{email:process.env.CI_LOGIN_EMAIL,password:process.env.CI_LOGIN_PASSWORD});
  assert.equal(login.code,200);
  cookie=login.setCookie.split(';')[0];csrf=login.data.csrfToken;
  const administrator=await call('/api/v1/studio/bootstrap');
  assert.equal(administrator.code,200);assert.equal(administrator.data.series.length,5);

  const team=await call('/api/v1/studio/teams','POST',{name:'Teste CI Equipe Nova',description:'Equipe criada na API'});
  assert.equal(team.code,201,'Create team');
  const teamId=team.data.id;
  const newPass=randomBytes(24).toString('hex');
  const member=await call('/api/v1/studio/members','POST',{
    name:'Integrante QA',email:'qa-team@example.test',password:newPass,teamId,role:'publisher'
  });
  assert.equal(member.code,201,'Create member account and membership');
  assert.equal((await call('/api/v1/studio/members/'+member.data.id,'PUT',{name:'Integrante QA Atualizado',teamId,role:'publisher'})).code,200,'Edit member');
  assert.equal((await call('/api/v1/studio/teams/'+teamId,'PUT',{name:'Equipe Atualizada',description:'Atualização persistente'})).code,200,'Edit team');
  const title='CenaLivre Série CI '+randomBytes(4).toString('hex');
  const series=await call('/api/v1/studio/series','POST',{
    title,category:'Ficção científica',summary:'Teste de produção',poster:'assets/orbital-poster.svg',
    banner:'assets/orbital-banner.svg',teamIds:[teamId],featured:false,visibility:'public'
  });
  assert.equal(series.code,201,'Create series');
  const sid=series.data.id;
  const season=await call('/api/v1/studio/seasons','POST',{seriesId:sid,number:1,title:'Primeira temporada',status:'published'});
  assert.equal(season.code,201,'Create season');
  assert.equal((await call('/api/v1/studio/seasons/'+season.data.id,'PUT',
    {seriesId:sid,number:1,title:'Temporada Atualizada'})).code,200,'Edit season');
  const releaseAt=new Date(Date.now()-86400000).toISOString();
  const episode=await call('/api/v1/studio/episodes','POST',{
    seasonId:season.data.id,number:1,title:'Episódio piloto',summary:'Teste com YouTube',
    youtube:'https://youtu.be/dQw4w9WgXcQ',thumbnail:'assets/episode-01.svg',
    releaseAt,duration:22,status:'published'
  });
  assert.equal(episode.code,201,'Create YouTube episode');
  const episodeId=episode.data.id;
  assert.equal((await call('/api/v1/studio/episodes/'+episodeId,'PUT',{
    seasonId:season.data.id,number:1,title:'Episódio publicado',summary:'Edição da descrição',
    youtube:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',thumbnail:'assets/episode-02.svg',
    releaseAt,duration:22,status:'published'
  })).code,200,'Edit episode');
  const watch=await call('/api/v1/public/episodes/'+episodeId);
  assert.equal(watch.code,200,'Published video public');
  assert.equal(watch.data.youtube,'dQw4w9WgXcQ','Stored YouTube ID');
  const invalid=await call('/api/v1/studio/episodes','POST',{
    seasonId:season.data.id,number:2,title:'Vídeo inválido',summary:'',
    youtube:'https://malicious.example/watch?v=dQw4w9WgXcQ',thumbnail:'assets/episode-01.svg',
    releaseAt,duration:22,status:'published'
  });
  assert.equal(invalid.code,400,'Reject foreign video hosts');
  const future=await call('/api/v1/studio/episodes','POST',{
    seasonId:season.data.id,number:2,title:'Próxima estreia',summary:'',
    youtube:'dQw4w9WgXcQ',thumbnail:'assets/episode-01.svg',
    releaseAt:new Date(Date.now()+86400000).toISOString(),duration:22,status:'scheduled'
  });
  assert.equal(future.code,201);
  const futurePublic=await call('/api/v1/public/episodes/'+future.data.id);
  assert.equal(futurePublic.code,200);
  assert.equal(futurePublic.data.youtube,null,'Embargo must hide video ID');

  const bulk=(resource,action,ids,status)=>
    call('/api/v1/studio/bulk','POST',{resource,action,ids,...(status?{status}:{})});
  // A season gates all of its public episodes while the editor retains metadata.
  assert.equal((await bulk('seasons','set_status',[season.data.id],'draft')).code,200,'Make season draft');
  assert.equal((await call('/api/v1/public/episodes/'+episodeId)).code,404,'Draft season hides video');
  let seasonState=await call('/api/v1/studio/bootstrap');
  assert.equal(seasonState.data.seasons.find(t=>t.id===season.data.id).status,'draft','Studio retains draft season');
  assert.equal((await bulk('seasons','set_status',[season.data.id],'published')).code,200,'Republish season');
  assert.equal((await call('/api/v1/public/episodes/'+episodeId)).code,200,'Republished season restores video');
  const groupedDraft=await bulk('episodes','set_status',[episodeId,future.data.id],'draft');
  assert.equal(groupedDraft.code,200,'Atomic multi-episode draft');
  assert.equal(groupedDraft.data.count,2);
  assert.equal((await call('/api/v1/public/episodes/'+episodeId)).code,404,'Draft video hidden');
  assert.equal((await bulk('episodes','set_status',[episodeId],'published')).code,200,'Publish episode');
  assert.equal((await bulk('episodes','set_status',[future.data.id],'scheduled')).code,200,'Schedule episode');
  assert.equal((await call('/api/v1/public/episodes/'+future.data.id)).data.youtube,null,'Future embargo retained');
  assert.equal((await bulk('series','set_status',[sid],'draft')).code,200,'Make series draft');
  assert.equal((await call('/api/v1/public/series/'+series.data.slug)).code,404,'Draft series hidden');
  assert.equal((await bulk('series','set_status',[sid],'public')).code,200,'Publish series');
  assert.equal((await call('/api/v1/public/episodes/'+episodeId)).code,200,'Restored series visible');
  assert.equal((await bulk('episodes','set_status',[episodeId],'unknown')).code,400,'Reject illegal status');
  assert.equal((await bulk('episodes','delete',[episodeId,episodeId])).code,400,'Reject duplicated ids');
  assert.equal((await bulk('episodes','delete',Array.from({length:101},(_,i)=>'id'+i))).code,400,'Enforce selection limit');

  assert.equal((await call('/api/v1/studio/settings','PUT',{
    siteName:'CenaLivre CI',siteDescription:'Testado',contactEmail:'ci@example.test',autoplay:true
  })).code,200,'Update settings');
  const settings=await call('/api/v1/studio/settings');
  assert.equal(settings.code,200);
  assert.equal(settings.data.siteName,'CenaLivre CI','Persist settings');
  const refresh=await call('/api/v1/studio/bootstrap');
  assert(refresh.data.series.some(x=>x.id===sid),'Series persisted');
  assert(refresh.data.episodes.some(x=>x.id===episodeId),'Episode persisted');

  // Persistent media library: policy, upload, tags, image access, reference safety and deletion.
  const policy=await call('/api/v1/studio/media/settings');
  assert.equal(policy.code,200);
  assert.equal((await call('/api/v1/studio/media/settings','PUT',
    {maxFileMb:5,maxFiles:120,allowedTypes:['png','jpeg']})).code,200,'Set upload policy');
  const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
  async function putImage(p,method,body,headers={}){
    const response=await fetch('http://localhost:8088'+p,{
      method,body,headers:{Cookie:cookie,'x-csrf-token':csrf,'Content-Type':'application/octet-stream',...headers}});
    const data=await response.json().catch(()=>({}));
    return {status:response.status,data};
  }
  // A real PNG larger than nginx's previous 1 MB default: upload and download through the proxy.
  const zlib=require('node:zlib');
  function chunk(label,payload){
    const name=Buffer.from(label),body=Buffer.concat([name,payload]),out=Buffer.alloc(4);
    out.writeUInt32BE(payload.length);
    let crc=0xffffffff;
    for(const byte of body){
      crc^=byte;
      for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
    }
    const checksum=Buffer.alloc(4);checksum.writeUInt32BE((crc^0xffffffff)>>>0);
    return Buffer.concat([out,body,checksum]);
  }
  const width=1024,height=512,rgba=randomBytes(width*height*4);
  const scanlines=[];
  for(let row=0;row<height;row++){
    scanlines.push(Buffer.from([0]),rgba.subarray(row*width*4,(row+1)*width*4));
  }
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
  ihdr[8]=8;ihdr[9]=6;
  const largePng=Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.concat(scanlines),{level:1})),
    chunk('IEND',Buffer.alloc(0))
  ]);
  assert(largePng.length>1024*1024,'Large fixture must exceed the old nginx body limit');
  const big=await putImage('/api/v1/studio/media/upload','POST',largePng,{
    'x-media-name':'banner-real-grande.png','x-media-kind':'banner','x-media-tags':'banner,teste'
  });
  assert.equal(big.status,201,'2 MB PNG must pass through Nginx and persist to storage');
  const stored=await fetch('http://localhost:8088/api/v1/media/files/'+big.data.id,{headers:{Cookie:cookie}});
  assert.equal(stored.status,200,'Large media must be readable from Docker volume');
  const persisted=Buffer.from(await stored.arrayBuffer());
  assert(persisted.equals(largePng),'Media round-trip must retain every uploaded byte');
  assert.equal((await call('/api/v1/studio/media/'+big.data.id,'DELETE')).code,200,'Large media clean-up');

  const up=await putImage('/api/v1/studio/media/upload','POST',bytes,
    {'x-media-name':encodeURIComponent('Capa da série.png'),'x-media-kind':'poster',
     'x-media-tags':encodeURIComponent('ficção, destaque')});
  assert.equal(up.status,201,'Upload PNG');
  const mediaId=up.data.id;
  assert.equal((await call('/api/v1/studio/media')).data.assets[0].kind,'poster');
  assert.equal((await call('/api/v1/studio/media/'+mediaId,'PATCH',
    {name:'Capa atualizada',kind:'banner',tags:['destaque','home']})).code,200,'Update media');
  const fileResponse=await fetch('http://localhost:8088/api/v1/media/files/'+mediaId,{headers:{Cookie:cookie}});
  assert.equal(fileResponse.status,200,'Read media');
  assert.equal(fileResponse.headers.get('content-type'),'image/png');
  const replace=await putImage('/api/v1/studio/media/'+mediaId+'/file','PUT',bytes);
  assert.equal(replace.status,200,'Replace media');
  const bad=await putImage('/api/v1/studio/media/upload','POST',Buffer.from('<svg onload=alert(1)>'),
    {'x-media-name':'evil.svg','x-media-kind':'icon'});
  assert.equal(bad.status,415,'Reject SVG uploads');
  assert.equal((await call('/api/v1/studio/series/'+sid,'PUT',{
    title,category:'Ficção científica',summary:'Testando referências',poster:up.data.url,
    banner:'assets/orbital-banner.svg',featured:false
  })).code,200,'Use uploaded poster in series');
  const bootstrapWithArtwork=await call('/api/v1/public/bootstrap');
  assert.equal(bootstrapWithArtwork.code,200);
  assert.equal(bootstrapWithArtwork.data.series.find(x=>x.id===sid).poster,up.data.url,
    'Artwork chosen in Studio is used by portal cards');
  assert.equal(bootstrapWithArtwork.data.series.find(x=>x.id===sid).banner,'assets/orbital-banner.svg',
    'Portal maintains horizontal banner independent of poster');
  assert.equal((await call('/api/v1/studio/media/'+mediaId,'DELETE')).code,409,'Prevent deletion of referenced asset');
  assert.equal((await fetch('http://localhost:8088/api/v1/media/files/'+mediaId)).status,200,
    'Published series media is public');
  assert.equal((await call('/api/v1/studio/series/'+sid,'PUT',{
    title,category:'Ficção científica',summary:'Restoring original art',poster:'assets/orbital-poster.svg',
    banner:'assets/orbital-banner.svg',featured:false
  })).code,200);
  assert.equal((await call('/api/v1/studio/media/'+mediaId,'DELETE')).code,200,'Delete unlinked media');
  assert.equal((await fetch('http://localhost:8088/api/v1/media/files/'+mediaId)).status,404);
  assert.equal((await call('/api/v1/studio/media/settings','PUT',
    {maxFileMb:99,maxFiles:120,allowedTypes:['png']})).code,400,'Reject excessive size setting');

  const banner=await call('/api/v1/studio/banners','POST',{
    title:'Banner do catálogo',subtitle:'Campanha de exemplo',image:'assets/orbital-banner.svg',
    mobileImage:'',target:sid,order:3,startAt:null,endAt:null,active:true
  });
  assert.equal(banner.code,201,'Create banner');
  assert.equal((await call('/api/v1/studio/banners/'+banner.data.id,'PUT',{
    title:'Banner atualizado',subtitle:'Campanha atualizada',image:'assets/mares-banner.svg',
    mobileImage:'',target:sid,order:4,startAt:null,endAt:null,active:true
  })).code,200,'Edit banner');
  assert.equal((await call('/api/v1/studio/settings','PUT',{
    siteName:'CenaLivre com identidade',siteDescription:'Testando logo e ícone',
    contactEmail:'ci@example.test',autoplay:false,
    logoUrl:'assets/orbital-poster.svg',iconUrl:'assets/episode-01.svg'
  })).code,200,'Save branding');
  const publicBranding=await call('/api/v1/public/bootstrap');
  assert.equal(publicBranding.data.branding.logoUrl,'assets/orbital-poster.svg');



  // CMS layout: create, edit, visibility, bulk updates and stable persisted ordering.
  const sectionsBefore=(await call('/api/v1/studio/bootstrap')).data.homeSections;
  assert(sectionsBefore.length>=4,'Seeded home sections available');
  const createdSection=await call('/api/v1/studio/sections','POST',{
    title:'Coleção QA',kind:'featured',active:false
  });
  assert.equal(createdSection.code,201,'Create section');
  const sidSection=createdSection.data.id;
  assert.equal((await call('/api/v1/studio/sections/'+sidSection,'PUT',{
    title:'Coleção revisada',kind:'latest',active:false
  })).code,200,'Edit section');
  const homeBatch=(resource,action,ids,active)=>
    call('/api/v1/studio/editorial/bulk','POST',{
      resource,action,ids,...(action==='set_active'?{active}:{})
    });
  assert.equal((await homeBatch('sections','set_active',[sidSection],true)).code,200,'Show section in batch');
  const publicSection=await call('/api/v1/public/bootstrap');
  assert(publicSection.data.homeSections.some(x=>x.id===sidSection),'Published section on portal');
  const sectionIds=(await call('/api/v1/studio/bootstrap')).data.homeSections.map(x=>x.id);
  const newOrder=sectionIds.slice().reverse();
  assert.equal((await call('/api/v1/studio/sections/order','PUT',{ids:newOrder})).code,200,'Reorder CMS');
  assert.deepEqual((await call('/api/v1/studio/bootstrap')).data.homeSections.map(x=>x.id),newOrder,'Order persisted');
  assert.equal((await call('/api/v1/studio/sections/order','PUT',{ids:[sidSection]})).code,409,'Refuse partial ordering');
  assert.equal((await homeBatch('sections','set_active',[sidSection,'missing-section'],false)).code,404,'Reject unknown section in bulk');
  assert.equal((await call('/api/v1/studio/bootstrap')).data.homeSections.find(x=>x.id===sidSection).active,true,'No partial updates');
  assert.equal((await homeBatch('sections','set_active',[sidSection],false)).code,200,'Hide section');
  assert.equal((await call('/api/v1/public/bootstrap')).data.homeSections.some(x=>x.id===sidSection),false,'Hidden section leaves portal');
  assert.equal((await homeBatch('sections','delete',[sidSection])).code,200,'Delete section in batch');
  assert.equal((await call('/api/v1/studio/sections/'+sidSection,'DELETE')).code,404,'Deleted section no longer exists');
  assert.equal((await call('/api/v1/studio/sections','POST',{title:'Tipo inválido',kind:'unsafe',active:true})).code,400,'Reject invalid section kind');

  // Banner publishing and deleting are server persisted and atomic.
  const anotherBanner=await call('/api/v1/studio/banners','POST',{
    title:'Banner secundário QA',subtitle:'Capa',image:'assets/atlas-banner.svg',
    mobileImage:'',target:sid,order:7,startAt:null,endAt:null,active:true
  });
  assert.equal(anotherBanner.code,201,'Create second banner');
  assert.equal((await homeBatch('banners','set_active',[banner.data.id,anotherBanner.data.id],false)).code,200,
    'Disable multiple banners');
  assert.equal((await call('/api/v1/public/bootstrap')).data.banners.some(x=>x.id===banner.data.id),false,
    'Inactive banner not in portal');
  assert.equal((await homeBatch('banners','set_active',[banner.data.id,'missing-banner'],true)).code,404,
    'No partial banner mutation');
  assert.equal((await call('/api/v1/studio/bootstrap')).data.banners.find(x=>x.id===banner.data.id).active,false,
    'Banner remains disabled after failed batch');
  assert.equal((await homeBatch('banners','set_active',[banner.data.id],true)).code,200,'Enable campaign');
  assert.equal((await call('/api/v1/public/bootstrap')).data.banners.some(x=>x.id===banner.data.id),true,
    'Enabled campaign appears');
  assert.equal((await homeBatch('banners','delete',[banner.data.id,anotherBanner.data.id])).code,200,
    'Delete both campaigns');
  assert.equal((await call('/api/v1/studio/banners/'+banner.data.id,'DELETE')).code,404,'Deleted banner not found');

  // Calendar: date shifts are atomic and never bypass permissions or date windows.
  const rescheduled=new Date(Date.now()+3*86400000).toISOString();
  const endWindow=new Date(Date.now()+8*86400000).toISOString();
  assert.equal((await call('/api/v1/studio/calendar/reschedule','POST',{
    ids:[episodeId,future.data.id],releaseAt:rescheduled,endAt:endWindow
  })).code,200,'Reschedule multiple episodes');
  const scheduledAgain=await call('/api/v1/studio/bootstrap');
  assert(scheduledAgain.data.episodes.filter(x=>[episodeId,future.data.id].includes(x.id)).every(x=>
    Math.floor(new Date(x.releaseAt).getTime()/1000)===Math.floor(new Date(rescheduled).getTime()/1000)),'Dates persisted to second precision');
  assert.equal((await call('/api/v1/public/episodes/'+episodeId)).data.youtube,null,
    'Future reschedule preserves embargo');
  assert.equal((await call('/api/v1/studio/calendar/reschedule','POST',{
    ids:[episodeId,future.data.id],releaseAt:endWindow,endAt:rescheduled
  })).code,400,'Reject inverted time window');
  assert.equal((await call('/api/v1/studio/calendar/reschedule','POST',{
    ids:[episodeId,'unknown-episode'],releaseAt:rescheduled,endAt:endWindow
  })).code,404,'Reject entire batch when one episode is missing');

  // Editorial deletion is explicit and refuses to cascade productions or episodes.
  assert.equal((await call('/api/v1/studio/series/'+sid,'DELETE')).code,409,'Do not delete series with seasons');
  assert.equal((await call('/api/v1/studio/seasons/'+season.data.id,'DELETE')).code,409,'Do not delete season with episodes');
  const tempTitle='Teste de remoção '+randomBytes(4).toString('hex');
  const created=await call('/api/v1/studio/series','POST',{
    title:tempTitle,category:'Teste',summary:'Remoção em ordem',poster:'assets/orbital-poster.svg',
    banner:'assets/orbital-banner.svg',teamIds:[teamId],visibility:'draft'
  });
  assert.equal(created.code,201,'Create removable series');
  const createdSeason=await call('/api/v1/studio/seasons','POST',{seriesId:created.data.id,number:1,title:'Temporada teste'});
  assert.equal(createdSeason.code,201,'Create removable season');
  const createdEpisode=await call('/api/v1/studio/episodes','POST',{
    seasonId:createdSeason.data.id,number:1,title:'Episódio teste',summary:'',
    youtube:'',thumbnail:'assets/episode-01.svg',releaseAt:null,duration:20,status:'draft'
  });
  assert.equal(createdEpisode.code,201,'Create removable episode');

  const other=await call('/api/v1/studio/series','POST',{
    title:'Vazio para teste '+randomBytes(4).toString('hex'),category:'Teste',summary:'Validação atômica',
    poster:'assets/orbital-poster.svg',banner:'assets/orbital-banner.svg',teamIds:[teamId],visibility:'draft'
  });
  assert.equal(other.code,201,'Create second removable series');
  assert.equal((await bulk('series','delete',[created.data.id,other.data.id])).code,409,'Batch refuses dependencies');
  assert.equal((await call('/api/v1/studio/bootstrap')).data.series.some(x=>x.id===other.data.id),true,'Failure did not partially delete');
  const missingSchedule=await bulk('episodes','set_status',[createdEpisode.data.id,episodeId],'published');
  assert.equal(missingSchedule.code,409,'Batch rejects episode without release date');
  assert.equal((await call('/api/v1/studio/bootstrap')).data.episodes.find(x=>x.id===createdEpisode.data.id).status,'draft','Failure did not partially publish');
  const secondDraft=await call('/api/v1/studio/episodes','POST',{
    seasonId:createdSeason.data.id,number:2,title:'Outro episódio',summary:'',
    youtube:'',thumbnail:'assets/episode-01.svg',releaseAt:null,duration:10,status:'draft'
  });
  assert.equal(secondDraft.code,201,'Second removable episode');
  assert.equal((await bulk('episodes','delete',[createdEpisode.data.id,secondDraft.data.id])).code,200,'Delete multiple episodes');
  assert.equal((await bulk('seasons','delete',[createdSeason.data.id])).code,200,'Remove season in batch');
  assert.equal((await bulk('series','delete',[created.data.id,other.data.id])).code,200,'Remove both series atomically');
  assert.equal((await call('/api/v1/studio/bulk','POST',{resource:'series',action:'delete',ids:[other.data.id]})).code,404,'No repeated deletion');

  const currentSeries=await call('/api/v1/studio/bootstrap');
  assert.equal(currentSeries.data.series.some(x=>x.id===created.data.id),false,'No deleted series in Studio');
  const publicAfterDelete=await call('/api/v1/public/bootstrap');
  assert.equal(publicAfterDelete.data.series.some(x=>x.id===created.data.id),false,'No deleted series in portal');

  const editorPassword=randomBytes(24).toString('hex');
  const user=await call('/api/v1/studio/users','POST',{email:'integration-editor@example.test',name:'Integration Editor',password:editorPassword});
  assert.equal(user.code,201);
  assert.equal((await call('/api/v1/studio/teams/t1/members','PUT',{email:'integration-editor@example.test',role:'editor'})).code,200);
  assert.equal((await call('/api/v1/studio/series/s1/grants','PUT',{teamId:'t1',userId:user.data.id,permission:'edit'})).code,200);
  const ownerCookie=cookie,ownerCsrf=csrf;
  const editorLogin=await call('/api/v1/auth/login','POST',{email:'integration-editor@example.test',password:editorPassword});
  assert.equal(editorLogin.code,200);
  cookie=editorLogin.setCookie.split(';')[0];csrf=editorLogin.data.csrfToken;
  const scoped=await call('/api/v1/studio/bootstrap');
  assert.equal(scoped.code,200);assert.deepEqual(scoped.data.series.map(s=>s.id),['s1']);
  const form={title:'Além da Órbita',category:'Ficção científica',summary:'Texto atualizado na integração',poster:'assets/orbital-poster.svg',banner:'assets/orbital-banner.svg'};
  assert.equal((await call('/api/v1/studio/series/s1','PUT',form)).code,200);
  const editorCsrf=csrf;csrf='';
  assert.equal((await call('/api/v1/studio/episodes/e1','DELETE')).code,403,'CSRF required for deletes');
  assert.equal((await call('/api/v1/studio/editorial/bulk','POST',{
    resource:'sections',action:'delete',ids:['hs1']
  })).code,403,'CSRF required for CMS changes');

  assert.equal((await bulk('episodes','set_status',['e1'],'draft')).code,403,'CSRF required for bulk');


  assert.equal((await call('/api/v1/studio/series/s1','PUT',form)).code,403);
  csrf=editorCsrf;
  assert.equal((await call('/api/v1/studio/series/s3','PUT',form)).code,403);
  assert.equal((await call('/api/v1/studio/series/s3','DELETE')).code,403,"Cannot delete another team's series");
  assert.equal((await call('/api/v1/studio/editorial/bulk','POST',{
    resource:'sections',action:'set_active',ids:['hs1'],active:false
  })).code,403,'Non-admin cannot hide CMS sections');
  assert.equal((await call('/api/v1/studio/sections','POST',{
    title:'Negada',kind:'all',active:true
  })).code,403,'Non-admin cannot create CMS sections');
  assert.equal((await call('/api/v1/studio/calendar/reschedule','POST',{
    ids:['e1'],releaseAt:new Date(Date.now()+86400000).toISOString(),endAt:null
  })).code,403,'Editor cannot reschedule a published episode');

  assert.equal((await bulk('series','set_status',['s3'],'draft')).code,403,'Cannot modify another team');
  assert.equal((await bulk('series','set_status',['s1'],'public')).code,403,'Editor grant cannot publish');
  assert.equal((await bulk('series','delete',['s3'])).code,403,'Cannot bulk delete outside team');

  assert.equal((await call('/api/v1/studio/episodes/e1','DELETE')).code,403,'Editor cannot delete published episode without publisher permission');

  assert.equal((await call('/api/v1/studio/series/s1','PUT',{...form,featured:true})).code,403);
  assert.equal((await call('/api/v1/auth/logout','POST')).code,200);
  assert.equal((await call('/api/v1/studio/bootstrap')).code,401);
  cookie=ownerCookie;csrf=ownerCsrf;
  assert.equal((await call('/api/v1/studio/teams/t1/members','PUT',{email:'integration-editor@example.test',role:'viewer'})).code,200);
  const again=await call('/api/v1/auth/login','POST',{email:'integration-editor@example.test',password:editorPassword});
  assert.equal(again.code,200);cookie=again.setCookie.split(';')[0];csrf=again.data.csrfToken;
  assert.deepEqual((await call('/api/v1/studio/bootstrap')).data.series,[]);
  assert.equal((await call('/api/v1/studio/series/s1','PUT',form)).code,403);
  console.log('Authentication, role isolation, grants and revocation: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
