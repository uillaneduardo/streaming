
(()=>{'use strict';
const img=(seed,w=900,h=550)=>`assets/episode-${String((Array.from(String(seed)).reduce((n,c)=>n+c.charCodeAt(0),0)%14)+1).padStart(2,'0')}.svg`;
const artwork={orbital:{poster:'assets/orbital-poster.svg',banner:'assets/orbital-banner.svg'},atlas:{poster:'assets/atlas-poster.svg',banner:'assets/atlas-banner.svg'},mares:{poster:'assets/mares-poster.svg',banner:'assets/mares-banner.svg'},lendas:{poster:'assets/lendas-poster.svg',banner:'assets/lendas-banner.svg'},cidade:{poster:'assets/cidade-poster.svg',banner:'assets/cidade-banner.svg'}};
const now=()=>new Date().toISOString();const past=d=>new Date(Date.now()-d*864e5).toISOString().slice(0,16);const future=d=>new Date(Date.now()+d*864e5).toISOString().slice(0,16);const initial=()=>({teams:[{id:'t1',name:'Coletivo Aurora',description:'Narrativas e documentários'},{id:'t2',name:'Núcleo Prisma',description:'Tecnologia e ciência'},{id:'t3',name:'Maré Criativa',description:'Natureza e aventura'}],members:[{id:'m1',name:'Marina Costa',email:'marina@exemplo.test',teamId:'t1',role:'Gestora'},{id:'m2',name:'Caio Almeida',email:'caio@exemplo.test',teamId:'t1',role:'Editor'},{id:'m3',name:'Ana Ribeiro',email:'ana@exemplo.test',teamId:'t2',role:'Gestora'},{id:'m4',name:'Bruno Lima',email:'bruno@exemplo.test',teamId:'t3',role:'Publicador'}],series:[{id:'s1',title:'Além da Órbita',slug:'alem-da-orbita',category:'Ficção científica',summary:'Em uma missão de exploração, uma tripulação descobre sinais que podem mudar tudo o que sabemos sobre o universo.',teamIds:['t1','t2'],poster:artwork.orbital.poster,banner:artwork.orbital.banner,featured:true},{id:'s2',title:'Código Aberto',slug:'codigo-aberto',category:'Tecnologia',summary:'Histórias de pessoas que transformam ideias em tecnologias capazes de alterar nosso cotidiano.',teamIds:['t2'],poster:artwork.atlas.poster,banner:artwork.atlas.banner,featured:false},{id:'s3',title:'Marés do Brasil',slug:'mares-do-brasil',category:'Documentário',summary:'Uma jornada por comunidades costeiras, paisagens e histórias que vivem ao ritmo do oceano.',teamIds:['t3'],poster:artwork.mares.poster,banner:artwork.mares.banner,featured:false},{id:'s4',title:'Lendas de Ontem',slug:'lendas-de-ontem',category:'Suspense',summary:'Contos populares reinventados em narrativas contemporâneas de mistério.',teamIds:['t1'],poster:artwork.lendas.poster,banner:artwork.lendas.banner,featured:false},{id:'s5',title:'Cidade Invisível',slug:'cidade-invisivel',category:'Drama',summary:'Retratos íntimos de histórias e encontros que acontecem enquanto a cidade dorme.',teamIds:['t1'],poster:artwork.cidade.poster,banner:artwork.cidade.banner,featured:false}],seasons:[{id:'se1',seriesId:'s1',number:1,title:'Primeiros sinais'},{id:'se2',seriesId:'s1',number:2,title:'Além do silêncio'},{id:'se3',seriesId:'s2',number:1,title:'As ideias'},{id:'se4',seriesId:'s3',number:1,title:'Costa viva'},{id:'se5',seriesId:'s4',number:1,title:'Mitos urbanos'},{id:'se6',seriesId:'s5',number:1,title:'Noite adentro'}],episodes:[{id:'e1',seasonId:'se1',number:1,title:'O chamado',summary:'A primeira mensagem chega à estação orbital.',youtube:'',thumbnail:artwork.orbital.banner,releaseAt:past(12),endAt:'',status:'published',duration:24},{id:'e2',seasonId:'se1',number:2,title:'O sinal',summary:'Uma anomalia muda o rumo da expedição.',youtube:'',thumbnail:img('starscape-orbit',1100,650),releaseAt:past(5),endAt:'',status:'published',duration:28},{id:'e3',seasonId:'se1',number:3,title:'Primeiro contato',summary:'A tripulação tenta decifrar uma origem desconhecida.',youtube:'',thumbnail:img('nebula-discovery',1100,650),releaseAt:future(3),endAt:'',status:'scheduled',duration:31},{id:'e4',seasonId:'se1',number:4,title:'Horizonte de eventos',summary:'Uma escolha pode mudar para sempre a missão.',youtube:'',thumbnail:img('cosmic-event',1100,650),releaseAt:future(10),endAt:'',status:'scheduled',duration:27},{id:'e5',seasonId:'se2',number:1,title:'O retorno',summary:'Novos caminhos se abrem.',youtube:'',thumbnail:img('orbit-return',1100,650),releaseAt:future(18),endAt:'',status:'scheduled',duration:33},{id:'e6',seasonId:'se3',number:1,title:'Quem escreve o futuro?',summary:'Conversas sobre criação, pesquisa e inovação.',youtube:'',thumbnail:artwork.atlas.banner,releaseAt:past(8),endAt:'',status:'published',duration:19},{id:'e7',seasonId:'se3',number:2,title:'Os bastidores da internet',summary:'Uma viagem pelas redes que conectam pessoas.',youtube:'',thumbnail:img('network-tech',1100,650),releaseAt:future(6),endAt:'',status:'scheduled',duration:22},{id:'e8',seasonId:'se4',number:1,title:'Onde a maré começa',summary:'Pessoas e paisagens que contam histórias do litoral.',youtube:'',thumbnail:artwork.mares.banner,releaseAt:past(16),endAt:'',status:'published',duration:29},{id:'e9',seasonId:'se5',number:1,title:'O último visitante',summary:'Uma história que ninguém conseguiu explicar.',youtube:'',thumbnail:artwork.lendas.banner,releaseAt:past(3),endAt:'',status:'published',duration:18},{id:'e10',seasonId:'se6',number:1,title:'Depois das luzes',summary:'A cidade revela sua outra face.',youtube:'',thumbnail:artwork.cidade.banner,releaseAt:future(9),endAt:'',status:'scheduled',duration:26}],banners:[{id:'b1',title:'Nova temporada: Além da Órbita',subtitle:'Explore novos mundos na nossa série em destaque.',image:artwork.orbital.banner,mobileImage:'',target:'s1',startAt:past(5),endAt:'',active:true,order:1},{id:'b2',title:'Marés do Brasil',subtitle:'Histórias reais à beira do oceano.',image:artwork.mares.banner,mobileImage:'',target:'s3',startAt:future(4),endAt:'',active:true,order:2}],homeSections:[{id:'hs1',title:'Em destaque',kind:'featured',active:true},{id:'hs2',title:'Últimos lançamentos',kind:'latest',active:true},{id:'hs3',title:'Próximas estreias',kind:'upcoming',active:true},{id:'hs4',title:'Todas as séries',kind:'all',active:true}],media:[],preferences:{siteName:'CenaLivre',siteDescription:'Histórias independentes, para todos.',autoplay:false},saved:[]});
let db;try{db=JSON.parse(localStorage.getItem('cenalivre-mvp-v2'))||initial()}catch{db=initial()}const defaults=initial();for(const old of db.series||[]){const fresh=defaults.series.find(x=>x.id===old.id);if(fresh){if((old.poster||'').includes('unsplash.com'))old.poster=fresh.poster;if((old.banner||'').includes('unsplash.com'))old.banner=fresh.banner;}}for(const old of db.episodes||[]){const fresh=defaults.episodes.find(x=>x.id===old.id);if(fresh&&/(unsplash.com|picsum.photos)/.test(old.thumbnail||''))old.thumbnail=fresh.thumbnail;}for(const old of db.banners||[]){const fresh=defaults.banners.find(x=>x.id===old.id);if(fresh&&/(unsplash.com|picsum.photos)/.test(old.image||''))old.image=fresh.image;}const save=()=>{try{localStorage.setItem('cenalivre-mvp-v2',JSON.stringify(db))}catch{toast('Armazenamento local cheio. Use imagens por URL.')}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const id=p=>p+Math.random().toString(36).slice(2,9);const date=s=>s?new Date(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}):'Sem data';const dt=s=>s?new Date(s).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Sem data';const by=(col,id)=>db[col].find(x=>x.id===id);const seasons=sid=>db.seasons.filter(x=>x.seriesId===sid).sort((a,b)=>a.number-b.number);const eps=seid=>db.episodes.filter(x=>x.seasonId===seid).sort((a,b)=>a.number-b.number);const seriesForEpisode=e=>by('series',by('seasons',e.seasonId)?.seriesId);const state=e=>{if(e.status==='draft')return 'Rascunho';if(e.status==='suspended')return 'Suspenso';if(e.releaseAt&&new Date(e.releaseAt)>new Date())return 'Em breve';if(e.endAt&&new Date(e.endAt)<=new Date())return 'Encerrado';return 'Disponível'};const playable=e=>state(e)==='Disponível';const epOrder=sid=>seasons(sid).flatMap(se=>eps(se.id));const heroImg=u=>`url("${String(u||'').replace(/["\\]/g,'')}")`;const ytId=u=>{const s=String(u||'').trim();if(/^[A-Za-z0-9_-]{11}$/.test(s))return s;try{const x=new URL(s);if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(x.hostname))return'';if(x.hostname==='youtu.be')return x.pathname.slice(1).split('/')[0];if(x.pathname.startsWith('/embed/')||x.pathname.startsWith('/shorts/'))return x.pathname.split('/')[2];return x.searchParams.get('v')||''}catch{return''}};

const hosted=location.protocol==='http:'||location.protocol==='https:';
let publicData=hosted?initial():db;
let publicLoadState=hosted?'loading':'ready';
let publicLoadError='';
let frontendVersion='checking';
const localDemo=db;
let studioData=null,studioUser=null,csrfToken='';
async function apiRequest(url,options={}){
  const write=!!options.method && !['GET','HEAD'].includes(options.method.toUpperCase());
  const headers={'Accept':'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(write&&csrfToken?{'x-csrf-token':csrfToken}:{}),...(options.headers||{})};
  const response=await fetch(url,{...options,headers,credentials:'same-origin'});
  let result;try{result=await response.json()}catch{result={error:'invalid_response'}}
  if(!response.ok)throw new Error(response.status===403?'Acesso negado: verifique suas permissões.':response.status===401?'Sessão expirada. Entre novamente.':result.error||'Falha na requisição.');
  return result;
}
async function fetchStudioData(){
  const payload=await apiRequest('/api/v1/studio/bootstrap');
  let settings=initial().preferences;
  if(studioUser?.isAdmin){
    try{settings=await apiRequest('/api/v1/studio/settings')}catch(error){console.warn('Configurações indisponíveis',error)}
  }
  studioData={...initial(),...payload,preferences:settings,saved:[]};
  await fetchMedia();
  render();
}
async function loadSession(){
  try{
    const data=await apiRequest('/api/v1/auth/session');
    studioUser=data.user;csrfToken=data.csrfToken;
    await fetchStudioData();
  }catch{
    studioUser=null;csrfToken='';studioData=null;render();
  }
}
async function loginStudio(form){
  const email=form.elements.email.value,password=form.elements.password.value;
  const button=form.querySelector('[type="submit"]');if(button)button.disabled=true;
  try{
    const data=await apiRequest('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    studioUser=data.user;csrfToken=data.csrfToken;await fetchStudioData();
    nav('/studio/dashboard');
    toast('Acesso ao Studio autorizado.');
  }catch(error){toast(error.message||'Não foi possível entrar.');if(button)button.disabled=false;}
}
async function logoutStudio(){
  try{await apiRequest('/api/v1/auth/logout',{method:'POST'});}
  catch{toast('Não foi possível revogar a sessão. Tente novamente.');return;}
  studioUser=null;csrfToken='';studioData=null;nav('/');render();
}
function studioLogin(){
  return publicNav()+'<main class="container" style="max-width:520px;margin:60px auto 120px"><div class="auth-panel form-surface-light"><h1>Entrar no Studio</h1><p class="muted">Acesse seu painel de produção.</p><form id="studio-login" class="stack">'+
    '<div class="field"><label>E-mail</label><input class="input" type="email" name="email" autocomplete="username" required></div>'+
    '<div class="field"><label>Senha</label><input class="input" type="password" name="password" autocomplete="current-password" required></div>'+
    '<button class="btn primary" type="submit">Entrar</button></form></div></main>';
}

const datetimeLocal=value=>{
  if(!value)return '';
  const d=new Date(value);
  if(!Number.isFinite(d.getTime()))return String(value).slice(0,16);
  const offset=d.getTimezoneOffset()*60000;
  return new Date(d.getTime()-offset).toISOString().slice(0,16);
};
const isoFromInput=value=>value?new Date(value).toISOString():null;
async function refreshPublicCatalog(){
  try{
    const result=await apiRequest('/api/v1/public/bootstrap');
    for(const key of ['series','seasons','episodes','banners','homeSections'])if(Array.isArray(result[key]))publicData[key]=result[key];
  }catch(error){console.warn('Catálogo não atualizado',error)}
}
async function saveRemoteEntity(form){
  const type=form.dataset.form,id=form.dataset.id;
  const f=new FormData(form),pick=n=>String(f.get(n)||'').trim();
  const method=id?'PUT':'POST';
  let path='',payload={};
  try{
    if(type==='series'){
      path='/api/v1/studio/series'+(id?'/'+encodeURIComponent(id):'');
      payload={title:pick('title'),category:pick('category'),summary:pick('summary'),
        poster:pick('poster'),banner:pick('banner')};
      if(studioUser?.isAdmin)payload.featured=f.has('featured');
      if(!id)payload.teamIds=f.getAll('teamIds');
      if(!id)payload.visibility=studioUser?.isAdmin?pick('visibility')||'draft':'draft';
      if(!id&&!payload.teamIds.length){toast('Escolha ao menos uma equipe responsável.');return;}
    }else if(type==='teams'){
      path='/api/v1/studio/teams'+(id?'/'+encodeURIComponent(id):'');
      payload={name:pick('name'),description:pick('description')};
    }else if(type==='members'){
      path='/api/v1/studio/members'+(id?'/'+encodeURIComponent(id):'');
      payload={name:pick('name'),teamId:pick('teamId'),role:pick('role')};
      if(!id){payload.email=pick('email');payload.password=pick('password')}
    }else if(type==='banners'){
      path='/api/v1/studio/banners'+(id?'/'+encodeURIComponent(id):'');
      payload={title:pick('title'),subtitle:pick('subtitle'),image:pick('image'),
        mobileImage:pick('mobileImage'),target:pick('target'),order:Number(pick('order')||1),
        startAt:isoFromInput(pick('startAt')),endAt:isoFromInput(pick('endAt')),active:f.has('active')};
      if(payload.startAt&&payload.endAt&&payload.endAt<=payload.startAt){toast('O fim da campanha precisa ser posterior ao início.');return;}
    }else if(type==='seasons'){
      path='/api/v1/studio/seasons'+(id?'/'+encodeURIComponent(id):'');
      payload={seriesId:pick('seriesId'),number:Number(pick('number')),title:pick('title'),status:pick('status')||'draft'};
    }else if(type==='episodes'){
      path='/api/v1/studio/episodes'+(id?'/'+encodeURIComponent(id):'');
      const release=pick('releaseAt'),end=pick('endAt');
      if(end&&release&&new Date(end)<=new Date(release)){toast('O fim precisa ser posterior à estreia.');return;}
      payload={seasonId:pick('seasonId')||(id?by('episodes',id)?.seasonId:''),number:Number(pick('number')),title:pick('title'),
        summary:pick('summary'),duration:Number(pick('duration')||20),youtube:pick('youtube'),
        thumbnail:pick('thumbnail'),releaseAt:isoFromInput(release),endAt:isoFromInput(end),status:pick('status')};
    }else{toast('Esta opção ainda não está disponível.');return}
    const btn=form.querySelector('[type="submit"]');if(btn)btn.disabled=true;
    await apiRequest(path,{method,body:JSON.stringify(payload)});
    if(type==='series'&&id&&studioUser?.isAdmin&&pick('visibility')&&
       pick('visibility')!==by('series',id)?.visibility){
      await apiRequest('/api/v1/studio/series/'+encodeURIComponent(id)+'/visibility',
        {method:'POST',body:JSON.stringify({visibility:pick('visibility')})});
    }
    await fetchStudioData();
    if(type==='series'||type==='seasons'||type==='episodes'||type==='banners')await refreshPublicCatalog();
    document.getElementById('modal-root').innerHTML='';
    render();toast('Alterações salvas.');
  }catch(error){toast(error.message||'Não foi possível salvar.');const btn=form.querySelector('[type="submit"]');if(btn)btn.disabled=false;}
}
async function saveRemoteSettings(form){
  if(!studioUser?.isAdmin){toast('Somente o administrador pode editar configurações.');return;}
  const f=new FormData(form);
  const payload={siteName:String(f.get('siteName')||'').trim(),
    siteDescription:String(f.get('siteDescription')||''),
    contactEmail:String(f.get('contactEmail')||'').trim(),autoplay:f.has('autoplay'),
    logoUrl:String(f.get('logoUrl')||'').trim(),iconUrl:String(f.get('iconUrl')||'').trim()};
  try{
    await apiRequest('/api/v1/studio/settings',{method:'PUT',body:JSON.stringify(payload)});
    await fetchStudioData();await refreshPublicCatalog();toast('Configurações salvas.');
  }catch(error){toast(error.message||'Não foi possível atualizar configurações.')}
}


const mediaCategories=[{id:'poster',title:'Pôster'},{id:'banner',title:'Banner'},{id:'thumbnail',title:'Thumbnail'},{id:'icon',title:'Ícone'},{id:'logo',title:'Logotipo'},{id:'other',title:'Outros'}];
let mediaData={assets:[],settings:{maxFileMb:8,maxFiles:500,allowedTypes:['png','jpeg','webp','gif']}};
let mediaSearch='',mediaFilter='all',mediaTagFilter='';
let mediaPickerField=null,mediaPickerKind='all';
async function fetchMedia(){
 if(!hosted||!studioUser)return;
 try{mediaData=await apiRequest('/api/v1/studio/media');}
 catch(error){console.warn('Biblioteca indisponível',error);}
}
const mediaName=k=>mediaCategories.find(x=>x.id===k)?.title||'Outros';
const mediaTags=s=>String(s||'').split(/[,;\n]/).map(t=>t.trim().toLowerCase()).filter(Boolean);
const mediaFilterItems=(items,search,kind,tag)=>items.filter(a=>
  (kind==='all'||a.kind===kind)&&(!tag||a.tags.includes(tag))&&
  (!search||[a.name,a.originalName,a.kind,...a.tags].join(' ').toLowerCase().includes(search.toLowerCase())));
const mediaCard=(a,picker=false)=>'<article class="media-card"><div class="media-image media-tile">'+
 '<img src="'+esc(a.url)+'" alt="'+esc(a.name)+'" loading="lazy">'+
 (picker?'':'<div class="media-tile-overlay" aria-label="Ações da mídia">'+
 '<button class="media-overlay-action" type="button" data-action="media-edit" data-id="'+esc(a.id)+'" title="Editar '+esc(a.name)+'" aria-label="Editar '+esc(a.name)+'">✎</button>'+
 '<button class="media-overlay-action danger" type="button" data-action="media-delete" data-id="'+esc(a.id)+'" title="Excluir '+esc(a.name)+'" aria-label="Excluir '+esc(a.name)+'">×</button></div>')+'</div>'+
 '<strong title="'+esc(a.name)+'">'+esc(a.name)+'</strong>'+
 '<div class="media-meta">'+mediaName(a.kind)+' · '+(a.size/1048576).toFixed(2)+' MB</div>'+
 '<div class="media-tags">'+a.tags.map(t=>'<span class="media-tag">'+esc(t)+'</span>').join('')+'</div>'+
 '<div class="media-actions">'+(picker?
 '<button type="button" class="btn small primary" data-action="media-pick" data-id="'+esc(a.id)+'">Selecionar</button>':
 '<button type="button" class="btn small" data-action="media-edit" data-id="'+esc(a.id)+'">Editar</button>'+
 '<button type="button" class="btn small" data-action="media-copy" data-id="'+esc(a.id)+'">Copiar URL</button>'+
 '<button type="button" class="btn small" data-action="media-download" data-id="'+esc(a.id)+'">Baixar</button>')+'</div></article>';
function openMediaPicker(field,kind){
 mediaPickerField=field;mediaPickerKind=kind||'all';
 let root=document.getElementById('media-picker-root');
 if(!root){root=document.createElement('div');root.id='media-picker-root';document.body.append(root)}
 root.innerHTML='<div class="media-picker-backdrop" data-action="media-picker-close">'+
 '<div class="media-picker-panel form-surface-light" role="dialog" aria-modal="true" aria-label="Escolher mídia">'+
 '<div class="row between"><h2>Escolher mídia</h2><button class="btn small" data-action="media-picker-close">✕</button></div>'+
 '<p class="muted">Selecione uma imagem já enviada ou envie um novo arquivo.</p>'+
 '<div class="media-toolbar"><input class="input" id="media-picker-search" placeholder="Pesquisar por nome ou tag">'+
 '<select class="select" id="media-picker-kind">'+
 '<option value="all">Todos os tipos</option>'+mediaCategories.map(c=>'<option value="'+c.id+'" '+(c.id===mediaPickerKind?'selected':'')+'>'+c.title+'</option>').join('')+
 '</select><label class="btn primary media-file-btn">+ Enviar imagem<input type="file" id="media-picker-file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label></div>'+
 '<div class="media-grid" id="media-picker-grid"></div>'+
 '<p id="media-picker-feedback" class="muted tiny"></p></div></div>';
 updateMediaPicker();
}
function updateMediaPicker(){
 const root=document.getElementById('media-picker-grid');if(!root)return;
 const query=document.getElementById('media-picker-search')?.value||'';
 const kind=document.getElementById('media-picker-kind')?.value||'all';
 const items=mediaFilterItems(mediaData.assets,query,kind,'');
 root.innerHTML=items.length?items.map(a=>mediaCard(a,true)).join(''):'<p class="muted">Nenhuma mídia encontrada. Envie uma imagem para começar.</p>';
}
function closeMediaPicker(){document.getElementById('media-picker-root')?.remove();mediaPickerField=null}
function mediaField(label,name,value='',kind='other'){
 const picture=value?'<img src="'+esc(value)+'" alt="Mídia selecionada">':'<span class="media-empty-icon" aria-hidden="true">▧</span>';
 return '<div class="field media-field" data-media-kind="'+esc(kind)+'"><label>'+esc(label)+'</label>'+
  '<div class="media-inline-card"><button type="button" class="media-inline-thumb" data-action="media-choose" data-field="'+esc(name)+'" data-kind="'+esc(kind)+'" aria-label="Escolher '+esc(label)+' da Biblioteca">'+picture+'</button>'+
  '<div class="media-inline-controls"><div class="media-inline-buttons">'+
  '<button type="button" class="btn small" data-action="media-choose" data-field="'+esc(name)+'" data-kind="'+esc(kind)+'">▧ Escolher mídia</button>'+
  '<label class="btn small media-inline-upload-btn">↑ Enviar imagem<input type="file" class="media-inline-file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Enviar '+esc(label)+'"></label>'+
  '<button type="button" class="btn small media-inline-clear" data-action="media-clear" data-field="'+esc(name)+'" aria-label="Limpar seleção" '+(value?'':'hidden')+'>×</button>'+'</div>'+
  '<small class="media-inline-hint">Escolha uma imagem existente ou envie outra.</small></div></div>'+
  '<div class="media-inline-status" role="status" aria-live="polite"></div>'+
  '<progress class="media-inline-progress" max="100" value="0" hidden></progress>'+
  '<details class="media-manual-url"><summary>Inserir URL manualmente</summary><input class="input" name="'+esc(name)+'" value="'+esc(value)+'" placeholder="/api/v1/media/files/... ou URL HTTPS" autocomplete="off"></details></div>';
}
function assignMediaToField(field,url){
 const input=Array.from(document.querySelectorAll('#modal-root [name],#settings-form [name]')).find(x=>x.name===field);
 if(!input)return false;
 input.value=url;input.dispatchEvent(new Event('input',{bubbles:true}));
 return true;
}
function mediaUploadTeam(field){
 if(studioUser?.isAdmin)return '';
 const input=Array.from(document.querySelectorAll('#modal-root [name],#settings-form [name]')).find(x=>x.name===field);
 const form=input?.closest('form');
 let ids=[];
 if(form?.dataset.form==='series'){
  ids=Array.from(form.querySelectorAll('[name="teamIds"]:checked')).map(x=>x.value);
  if(!ids.length){const existing=db.series.find(x=>x.id===form.dataset.id);ids=existing?.teamIds||[];}
 }else if(form?.dataset.form==='episodes'){
  const seasonId=form.querySelector('[name="seasonId"]')?.value||db.episodes.find(x=>x.id===form.dataset.id)?.seasonId;
  const season=db.seasons.find(x=>x.id===seasonId);
  ids=db.series.find(x=>x.id===season?.seriesId)?.teamIds||[];
 }else if(form?.dataset.form==='banners'){
  ids=db.series.find(x=>x.id===form.querySelector('[name="target"]')?.value)?.teamIds||[];
 }
 return ids.find(id=>db.teams.some(t=>t.id===id))||db.teams[0]?.id||'';
}
function updateInlineMediaField(field,url){
 const input=Array.from(document.querySelectorAll('#modal-root [name],#settings-form [name]')).find(x=>x.name===field);
 if(!input)return;
 const card=input.closest('.media-field');if(!card)return;
 const thumb=card.querySelector('.media-inline-thumb');
 if(thumb)thumb.innerHTML=url?'<img src="'+esc(url)+'" alt="Mídia selecionada">':'<span class="media-empty-icon" aria-hidden="true">▧</span>';
 const clear=card.querySelector('.media-inline-clear');
 if(clear)clear.hidden=!url;
 const status=card.querySelector('.media-inline-status');
 if(status&&!card.classList.contains('uploading'))status.textContent=url?'Imagem selecionada.':'';
}
function uploadProgressRequest(file,{name,kind,teamId,tags},onProgress,method='POST',endpoint='/api/v1/studio/media/upload'){
 return new Promise((resolve,reject)=>{
  const valid=['png','jpg','jpeg','webp','gif'];
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  if(!valid.includes(ext))return reject(new Error('Formato não permitido. Use PNG, JPEG, WebP ou GIF.'));
  if(!mediaData.settings.allowedTypes.includes(ext==='jpg'?'jpeg':ext))return reject(new Error('Formato desativado em Configurações → Uploads.'));
  if(!file.size||file.size>mediaData.settings.maxFileMb*1048576)return reject(new Error('O arquivo excede o tamanho permitido.'));
  const xhr=new XMLHttpRequest();
  xhr.open(method,endpoint);xhr.withCredentials=true;xhr.timeout=180000;
  xhr.setRequestHeader('Content-Type','application/octet-stream');
  xhr.setRequestHeader('x-csrf-token',csrfToken);
  if(method==='POST'){
   xhr.setRequestHeader('x-media-name',encodeURIComponent(name||file.name).slice(0,500));
   xhr.setRequestHeader('x-media-kind',kind||'other');
   xhr.setRequestHeader('x-media-team',teamId||'');
   xhr.setRequestHeader('x-media-tags',encodeURIComponent(tags||'').slice(0,1000));
  }
  xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress?.(Math.round(e.loaded*100/e.total))};
  xhr.onerror=()=>reject(new Error('Não foi possível enviar a imagem. Verifique sua conexão.'));
  xhr.ontimeout=()=>reject(new Error('O upload excedeu o tempo de espera.'));
  xhr.onload=()=>{
   let result;try{result=JSON.parse(xhr.responseText)}catch{result={}}
   if(xhr.status>=200&&xhr.status<300)return resolve(result);
   const errors={request_entity_too_large:'Arquivo acima do limite de envio.',
    file_too_large:'Arquivo acima do limite configurado.',unsupported_file_format:'Formato de arquivo não permitido.',
    media_limit_reached:'Capacidade da Biblioteca atingida.',forbidden:'Sua equipe não tem autorização.',
    unauthorized:'Sessão expirada, entre novamente.',csrf_required:'Sessão inválida, recarregue o Studio.'};
   reject(new Error(errors[result.error]||result.error||'Falha ao enviar imagem (HTTP '+xhr.status+').'));
  };
  xhr.send(file);
 });
}
async function uploadInlineMedia(input){
 const file=input.files?.[0];if(!file)return;
 const card=input.closest('.media-field');const status=card?.querySelector('.media-inline-status');
 const progress=card?.querySelector('.media-inline-progress');
 const manual=card?.querySelector('.media-manual-url input');
 const thumb=card?.querySelector('.media-inline-thumb');
 const original=manual?.value||'';const oldPreview=thumb?.innerHTML;
 const localURL=URL.createObjectURL(file);
 if(thumb)thumb.innerHTML='<img src="'+localURL+'" alt="Prévia antes do upload">';
 card?.classList.add('uploading');if(progress){progress.hidden=false;progress.value=0;}
 if(status)status.textContent='Preparando '+file.name+'...';
 input.disabled=true;
 try{
  const result=await uploadProgressRequest(file,{name:file.name,kind:card?.dataset.mediaKind||'other',
   teamId:mediaUploadTeam(manual?.name||''),tags:''},
   percent=>{if(progress)progress.value=percent;if(status)status.textContent='Enviando '+file.name+' · '+percent+'%';});
  if(!result?.url)throw new Error('Não foi possível concluir o envio da imagem.');
  await fetchMedia();
  assignMediaToField(manual?.name||'',result.url);
  if(status)status.textContent='✓ Upload concluído: '+file.name;
  if(progress)progress.value=100;
  toast('Imagem enviada e selecionada.');
 }catch(error){
  if(thumb)thumb.innerHTML=oldPreview||'';
  if(manual)manual.value=original;
  if(status)status.textContent='Falha: '+error.message;
  card?.classList.add('upload-error');toast(error.message);
 }finally{
  URL.revokeObjectURL(localURL);
  card?.classList.remove('uploading');input.disabled=false;input.value='';
  if(progress)progress.hidden=true;
 }
}
function mediaUploadModal(){
 const kinds=mediaCategories.map(c=>'<option value="'+c.id+'">'+c.title+'</option>').join('');
 const teams=studioUser?.isAdmin?'<div class="field"><label>Equipe proprietária</label><select class="select" name="teamId"><option value="">Biblioteca global</option>'+
 db.teams.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select></div>':
 '<div class="field"><label>Equipe proprietária</label><select class="select" name="teamId">'+db.teams.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select></div>';
 modal('Enviar mídia','<form id="media-upload-form" class="stack">'+
 '<label class="media-drop"><span>Arraste imagens aqui ou clique para selecionar</span><small>PNG, JPEG, WebP ou GIF · Limite: '+mediaData.settings.maxFileMb+' MB</small>'+
 '<input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple required></label>'+
 '<div id="media-upload-preview" class="media-preview">Prévia da imagem aparecerá aqui</div>'+
 '<progress class="media-batch-progress" max="100" value="0" hidden></progress><p class="muted tiny" id="media-batch-status" role="status" aria-live="polite"></p>'+
 '<div class="field"><label>Nome personalizado (opcional em envio único)</label><input class="input" name="name" placeholder="Use o nome do arquivo se deixar vazio"></div>'+
 '<div class="field"><label>Categoria</label><select name="kind" class="select">'+kinds+'</select></div>'+
 '<div class="field"><label>Tags (separadas por vírgula)</label><input class="input" name="tags" placeholder="destaque, série, temporada"></div>'+
 teams+'<div class="row between"><button class="btn" data-action="close-modal" type="button">Cancelar</button>'+
 '<button class="btn primary" type="submit">Enviar arquivo</button></div></form>');
}
async function mediaUpload(file,{name,kind,teamId,tags},onProgress){
 const result=await uploadProgressRequest(file,{name,kind,teamId,tags},onProgress);
 await fetchMedia();
 return result;
}
async function uploadFromPicker(file){
 if(!file)return;
 const team=mediaUploadTeam(mediaPickerField||'');
 const msg=document.getElementById('media-picker-feedback');
 if(msg)msg.textContent='Enviando '+file.name+'...';
 try{
  const result=await mediaUpload(file,{name:file.name,kind:mediaPickerKind==='all'?'other':mediaPickerKind,teamId:team,tags:''},percent=>{if(msg)msg.textContent='Enviando '+file.name+' · '+percent+'%';});
  if(!result)return;
  if(mediaPickerField){
   assignMediaToField(mediaPickerField,result.url);
   closeMediaPicker();
  }else{updateMediaPicker()}
  toast('Imagem adicionada à Biblioteca.');
 }catch(error){if(msg)msg.textContent=error.message;toast(error.message)}
}
async function submitMediaUpload(form){
 const fd=new FormData(form),files=[...form.elements.file.files];
 if(!files.length){toast('Selecione pelo menos uma imagem.');return}
 if(files.length>10){toast('Envie até 10 imagens por vez.');return}
 const btn=form.querySelector('[type="submit"]');if(btn)btn.disabled=true;
 let sent=0,failed=[];
 for(const file of files){
  try{
   const bar=document.querySelector('#media-upload-form .media-batch-progress');
   if(bar)bar.hidden=false;
   const result=await mediaUpload(file,{name:files.length===1?(String(fd.get('name')||'')||file.name):file.name,
    kind:String(fd.get('kind')||'other'),teamId:String(fd.get('teamId')||''),
    tags:String(fd.get('tags')||'')},percent=>{
      const bar=document.querySelector('#media-upload-form .media-batch-progress');
      const message=document.getElementById('media-batch-status');
      if(bar)bar.value=(sent*100+percent)/files.length;
      if(message)message.textContent='Enviando '+file.name+' · '+percent+'% ('+(sent+1)+'/'+files.length+')';
    });
   if(result)sent++;else failed.push(file.name);
  }catch(error){failed.push(file.name+': '+error.message)}
  const preview=document.getElementById('media-upload-preview');
  if(preview)preview.textContent='Enviados '+sent+' de '+files.length+' arquivos.';
 }
 if(sent){
  document.getElementById('modal-root').innerHTML='';
  render();toast(sent+' imagem(ns) enviada(s).');
 }
 if(failed.length)toast('Falha em '+failed.length+' arquivo(s): '+failed[0]);
 if(btn)btn.disabled=false;
}
function editMedia(id){
 const a=mediaData.assets.find(x=>x.id===id);if(!a)return;
 modal('Editar mídia','<form id="media-edit-form" data-id="'+esc(a.id)+'" class="stack">'+
 '<div class="media-edit-preview"><img src="'+esc(a.url)+'" alt="'+esc(a.name)+'"></div>'+
 '<div class="field"><label>Nome</label><input class="input" name="name" value="'+esc(a.name)+'" required></div>'+
 '<div class="field"><label>Categoria</label><select class="select" name="kind">'+mediaCategories.map(c=>
 '<option value="'+c.id+'" '+(c.id===a.kind?'selected':'')+'>'+c.title+'</option>').join('')+'</select></div>'+
 '<div class="field"><label>Tags separadas por vírgula</label><input class="input" name="tags" value="'+esc(a.tags.join(', '))+'"></div>'+
 '<div class="field"><label>Substituir arquivo (opcional)</label><input class="input" name="replacement" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small class="muted">Mantém o mesmo vínculo nas séries e episódios.</small></div>'+
 '<p id="media-replace-status" class="muted tiny" role="status" aria-live="polite"></p>'+ '<div class="row between"><button type="button" class="btn" data-action="close-modal">Cancelar</button>'+
 '<button type="submit" class="btn primary">Salvar mídia</button></div></form>');
}
async function updateMedia(form){
 const fd=new FormData(form),id=form.dataset.id;
 try{
  await apiRequest('/api/v1/studio/media/'+encodeURIComponent(id),
   {method:'PATCH',body:JSON.stringify({name:String(fd.get('name')||''),kind:String(fd.get('kind')||'other'),tags:mediaTags(fd.get('tags'))})});
  const replacement=fd.get('replacement');
  if(replacement instanceof File && replacement.size){
    if(replacement.size>mediaData.settings.maxFileMb*1024*1024)throw new Error('Arquivo maior que o limite configurado.');
    const message=document.getElementById('media-replace-status');
    await uploadProgressRequest(replacement,{name:replacement.name,kind:String(fd.get('kind')||'other'),teamId:'',tags:''},
      percent=>{if(message)message.textContent='Substituindo arquivo · '+percent+'%';},
      'PUT','/api/v1/studio/media/'+encodeURIComponent(id)+'/file');
  }
  await fetchMedia();document.getElementById('modal-root').innerHTML='';render();toast('Mídia atualizada.');
 }catch(error){toast(error.message)}
}
async function deleteMedia(id){
 if(!confirm('Excluir esta mídia permanentemente? Arquivos utilizados em séries ou episódios não podem ser removidos.'))return;
 try{await apiRequest('/api/v1/studio/media/'+encodeURIComponent(id),{method:'DELETE'});
  await fetchMedia();render();toast('Mídia excluída.')}
 catch(error){toast(error.message==='media_in_use'?'Essa imagem está vinculada a um conteúdo. Substitua antes de excluir.':error.message)}
}
function refreshMediaResults(){
 const target=document.getElementById('media-library-grid');if(!target)return;
 const data=mediaFilterItems(mediaData.assets,mediaSearch,mediaFilter,mediaTagFilter);
 target.innerHTML=data.length?data.map(a=>mediaCard(a)).join(''):
 '<div class="empty">Nenhuma mídia encontrada para os filtros escolhidos.</div>';
 const count=document.getElementById('media-library-count');if(count)count.textContent=data.length+' arquivo(s)';
}

let catalogView=localStorage.getItem('cenalivre-catalog-view')==='list'?'list':'grid';let homeView='grid';
let route={},filterCategory='Todas',searchTerm='',studioSection='';const nav=(path)=>{location.hash=path;window.scrollTo(0,0)};const parse=()=>{let p=location.hash.slice(1)||'/';route={path:p,parts:p.split('/').filter(Boolean),studio:p.startsWith('/studio')};if(!p.startsWith('/assistir/'))activeVideo=null};let activeVideo=null;
function toast(msg){const el=document.getElementById('toast-root');el.innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>{if(el)el.innerHTML=''},3000)}
function publicNav(){return `<header class="public-nav"><a class="brand" href="#/">${db.preferences?.logoUrl?`<img class="site-logo" src="${esc(db.preferences.logoUrl)}" alt="${esc(db.preferences.siteName||"CenaLivre")}">`:"CENA<em>LIVRE</em>"}</a><a class="nav-link ${route.path==='/'?'active':''}" href="#/">Início</a><a class="nav-link ${route.path.startsWith('/explorar')?'active':''}" href="#/explorar">Explorar</a><a class="nav-link" href="#/explorar?cat=Documentário">Documentários</a><div class="nav-fill"></div><button class="btn ghost small" data-action="go-studio">◧ &nbsp; Studio</button></header>`}
function poster(s){return `<a href="#/serie/${esc(s.id)}" class="poster-card"><div class="poster-img" style="background-image:${heroImg(s.poster)}"><span class="tag">${esc(s.category)}</span></div><div class="poster-title">${esc(s.title)}</div><div class="poster-sub">${seasons(s.id).length} temporada(s) · ${epOrder(s.id).length} episódio(s)</div><p class="poster-description">${esc(s.summary)}</p></a>`}
function cardGrid(items){return items.length?`<div class="grid-cards ${catalogView==='list'?'list-cards':''}">${items.map(poster).join('')}</div>`:`<div class="empty">Nenhuma produção encontrada.</div>`}
function viewSwitch(){return `<div class="view-switch" role="group" aria-label="Modo de visualização"><button class="view-option ${catalogView==='grid'?'selected':''}" data-action="catalog-view" data-view="grid" aria-pressed="${catalogView==='grid'}" title="Visualização em grade">▦ <span>Grade</span></button><button class="view-option ${catalogView==='list'?'selected':''}" data-action="catalog-view" data-view="list" aria-pressed="${catalogView==='list'}" title="Visualização em lista">☷ <span>Lista</span></button></div>`}
function bannerActive(b){return b.active&&(!b.startAt||new Date(b.startAt)<=new Date())&&(!b.endAt||new Date(b.endAt)>new Date())}
function homeSwitch(){return `<div class="view-switch" role="group" aria-label="Visualização da página inicial"><button class="view-option ${homeView==='grid'?'selected':''}" data-action="home-view" data-view="grid" aria-pressed="${homeView==='grid'}" title="Exibir em grade">▦ <span>Grade</span></button><button class="view-option ${homeView==='list'?'selected':''}" data-action="home-view" data-view="list" aria-pressed="${homeView==='list'}" title="Exibir em lista">☷ <span>Lista</span></button></div>`}
function homePosters(items){return items.length?`<div class="grid-cards ${homeView==='list'?'list-cards':''}">${items.map(poster).join('')}</div>`:`<div class="empty">Nenhuma produção encontrada.</div>`}
function homeEpisodes(items){return items.length?`<div class="home-episodes ${homeView==='list'?'home-episodes-list':''}">${items.map(e=>{const s=seriesForEpisode(e),se=by('seasons',e.seasonId),available=playable(e);return `<button class="home-episode" data-action="${available?'watch':'go-series'}" data-id="${available?e.id:s?.id}"><img loading="lazy" src="${esc(e.thumbnail)}" alt="Thumbnail de ${esc(e.title)}"><div class="home-episode-body"><span class="muted tiny">${esc(s?.title||'Série')} · T${se?.number}:E${e.number}</span><strong>${esc(e.title)}</strong><p>${esc(e.summary)}</p><span class="tiny">${available?'▶ Assistir agora':'◷ Estreia '+dt(e.releaseAt)}</span></div></button>`}).join('')}</div>`:`<div class="empty">Nenhum episódio nesta seção.</div>`}
function home(){let b=[...db.banners].sort((a,z)=>a.order-z.order).find(bannerActive),s=by('series',b?.target)||db.series.find(x=>x.featured)||db.series[0];const featured=s||db.series[0];let out=`<div class="container"><section class="hero" style="--hero-image:${heroImg(b?.image||featured.banner)}"><div class="hero-content"><div class="eyebrow">✦ Histórias independentes</div><h1>${esc(b?.title||featured.title)}</h1><p>${esc(b?.subtitle||featured.summary)}</p><div class="actions"><button class="btn primary" data-action="go-series" data-id="${esc(featured.id)}">▶ &nbsp; Conhecer série</button><a href="#/explorar" class="btn">Explorar catálogo →</a></div></div></section><div class="row between home-viewbar"><span class="muted tiny">Visualização das seções</span>${homeSwitch()}</div>`;for(const section of db.homeSections.filter(x=>x.active)){let title=section.title;if(section.kind==='featured'){out+=`<div class="section-head"><h2>${esc(title)}</h2></div>${homePosters(db.series.filter(s=>s.featured))}`;}else if(section.kind==='all'){out+=`<div class="section-head"><h2>${esc(title)}</h2><a href="#/explorar" class="muted tiny">Ver todas →</a></div>${homePosters(db.series)}`;}else if(section.kind==='latest'){let e=db.episodes.filter(playable).sort((a,b)=>new Date(b.releaseAt)-new Date(a.releaseAt)).slice(0,4);out+=`<div class="section-head"><h2>${esc(title)}</h2></div>${homeEpisodes(e)}`;}else if(section.kind==='upcoming'){const e=db.episodes.filter(x=>state(x)==='Em breve').sort((a,b)=>new Date(a.releaseAt)-new Date(b.releaseAt)).slice(0,4);out+=`<div class="section-head"><h2>${esc(title)}</h2></div>${homeEpisodes(e)}`;}}return out+'</div>'}
function explore(){let p=new URLSearchParams(route.path.split('?')[1]||''),cat=p.get('cat');if(cat&&!searchTerm)filterCategory=cat;const cats=['Todas',...new Set(db.series.map(x=>x.category))];let list=db.series.filter(x=>(filterCategory==='Todas'||x.category===filterCategory)&&`${x.title} ${x.summary} ${x.category}`.toLowerCase().includes(searchTerm.toLowerCase()));return `<div class="container"><div class="section-head" style="margin-top:14px"><div><div class="eyebrow">Catálogo aberto</div><h1 style="font-size:36px;margin:8px 0">Explore as séries</h1><p class="muted">Produções originais e independentes, gratuitas para assistir.</p></div></div><div class="row" style="margin:25px 0"><input id="public-search" class="input searchbar" placeholder="Buscar séries, histórias ou categorias..." value="${esc(searchTerm)}"></div><div class="pillset" style="margin-bottom:25px">${cats.map(c=>`<button class="pill ${filterCategory===c?'active':''}" data-action="filter-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="row between" style="margin:12px 0 20px"><span class="muted tiny">${list.length} série(s)</span>${viewSwitch()}</div><div id="explore-results">${cardGrid(list)}</div></div>`}
function epPublicRow(e){const s=seriesForEpisode(e),se=by('seasons',e.seasonId),available=playable(e);return `<button class="episode-row" data-action="${available?'watch':'go-series'}" data-id="${available?e.id:s?.id}"><img class="episode-img" loading="lazy" src="${esc(e.thumbnail)}" alt=""><div class="episode-meta"><strong>${esc(s?.title||'Série')} · T${se?.number}:E${e.number} — ${esc(e.title)}</strong><p>${esc(e.summary)}</p><span class="muted tiny">${e.duration||'?'} min · ${available?'Disponível agora':state(e)==='Em breve'?'Estreia '+dt(e.releaseAt):state(e)}</span></div><span class="tag">${available?'▶ Assistir':state(e)}</span></button>`}
function seriesPage(sid){const s=by('series',sid);if(!s)return missing();const list=seasons(sid),defaultSe=list[0],currentSe=list.find(x=>x.id===studioSection)||defaultSe;return `<div class="container"><a class="muted tiny" href="#/explorar">← Voltar ao catálogo</a><div class="series-hero"><img class="series-poster" src="${esc(s.poster)}" alt="Pôster de ${esc(s.title)}"><div><div class="eyebrow">${esc(s.category)} · Produção original</div><h1>${esc(s.title)}</h1><p>${esc(s.summary)}</p><div class="row" style="flex-wrap:wrap"><span class="tag">${list.length} temporada(s)</span><span class="tag">${epOrder(sid).length} episódio(s)</span><span class="tag">Gratuito</span></div><div class="actions"><button class="btn primary" data-action="watch" data-id="${esc(epOrder(sid).find(playable)?.id||'')}" ${epOrder(sid).some(playable)?'':'disabled'}>▶ Assistir primeiro disponível</button><button class="btn" data-action="fav" data-id="${esc(sid)}">${db.saved.includes(sid)?'✓ Na minha lista':'＋ Minha lista'}</button></div></div></div><div class="section-head"><h2>Episódios</h2><select id="public-season" class="select" style="max-width:230px">${list.map(x=>`<option value="${x.id}" ${x.id===currentSe?.id?'selected':''}>Temporada ${x.number} — ${esc(x.title)}</option>`).join('')}</select></div><div class="episode-list">${(currentSe?eps(currentSe.id):[]).map(epPublicRow).join('')}</div></div>`}
// YouTube IFrame API: play/pause can be controlled externally. Quality, audio and captions
// stay in the native YouTube menu, because they are not exposed as full track selectors.
let ytApiPromise=null,ytPlayer=null,ytMountedEpisode='';
function ensureYouTubeAPI(){
 if(window.YT&&window.YT.Player)return Promise.resolve(window.YT);
 if(ytApiPromise)return ytApiPromise;
 ytApiPromise=new Promise((resolve,reject)=>{
   const prior=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=()=>{if(typeof prior==='function')prior();resolve(window.YT)};
   const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
   script.onerror=()=>reject(new Error('Não foi possível carregar o player do YouTube.'));
   document.head.appendChild(script);
 });
 return ytApiPromise;
}
function playerButtonState(isPlaying){
 const control=document.querySelector('[data-action="player-toggle"]');
 if(!control)return;
 control.textContent=isPlaying?'❚❚ Pausar':'▶ Reproduzir';
 control.setAttribute('aria-label',isPlaying?'Pausar vídeo':'Reproduzir vídeo');
}
function destroyYouTubePlayer(){
 if(ytPlayer&&typeof ytPlayer.destroy==='function'){try{ytPlayer.destroy()}catch{}}
 ytPlayer=null;ytMountedEpisode='';
}
async function mountYouTubePlayer(episodeId,videoId){
 if(!document.getElementById('cenalivre-youtube')||ytMountedEpisode===episodeId)return;
 ytMountedEpisode=episodeId;
 try{
  const YT=await ensureYouTubeAPI();
  if(!document.getElementById('cenalivre-youtube')||!location.hash.includes('/assistir/'+episodeId))return;
  ytPlayer=new YT.Player('cenalivre-youtube',{
   videoId:videoId,
   playerVars:{autoplay:1,controls:1,playsinline:1,rel:0,iv_load_policy:3,hl:'pt-BR',origin:location.origin},
   events:{
    onReady:()=>playerButtonState(false),
    onStateChange:event=>playerButtonState(event.data===YT.PlayerState.PLAYING),
    onError:()=>{const hint=document.getElementById('player-hint');if(hint)hint.textContent='Este vídeo não pôde ser reproduzido aqui. Confira se a incorporação está permitida no YouTube.'}
   }
  });
 }catch(error){
  const hint=document.getElementById('player-hint');if(hint)hint.textContent=error.message;
  ytMountedEpisode='';
 }
}
function toggleYouTubePlayback(){
 if(!ytPlayer||typeof ytPlayer.getPlayerState!=='function'){toast('Aguarde o carregamento do vídeo.');return}
 const state=ytPlayer.getPlayerState();
 if(state===window.YT.PlayerState.PLAYING)ytPlayer.pauseVideo();
 else ytPlayer.playVideo();
}
function watchPage(eid){
 const e=by('episodes',eid);if(!e)return missing();
 const series=seriesForEpisode(e);if(!series)return missing();
 const seq=epOrder(series.id),index=seq.findIndex(x=>x.id===eid);
 const prev=[...seq.slice(0,index)].reverse().find(playable),next=seq.slice(index+1).find(playable);
 const season=by('seasons',e.seasonId),ready=playable(e),idVideo=ytId(e.youtube);
 const started=activeVideo===eid&&idVideo&&ready;
 return `<div class="container watch-layout"><div class="row between" style="margin-bottom:17px">
 <a class="muted tiny" href="#/serie/${series.id}">← ${esc(series.title)}</a>
 <span class="muted tiny">Temporada ${season.number} · Episódio ${e.number}</span></div>
 <div class="player">${started?'<div id="cenalivre-youtube" class="youtube-frame"></div>':
 `<div class="player-placeholder" style="background-image:${heroImg(e.thumbnail)}">
 <button class="btn primary" data-action="play-video" data-id="${esc(e.id)}" ${!ready?'disabled':''}>
 ${ready?'▶ '+(idVideo?'Assistir episódio':'Vídeo indisponível'):'🔒 '+state(e)}</button></div>`}</div>
 ${started?`<div class="player-minimal-bar"><button type="button" class="btn small" data-action="player-toggle" aria-label="Reproduzir ou pausar vídeo">▶ Reproduzir</button>
 <span class="muted tiny" id="player-hint">Qualidade, áudio e legendas: use ⚙ nos controles do vídeo, quando disponíveis.</span></div>`:''}
 ${!idVideo&&ready?'<div class="notice" style="margin-top:12px">Este episódio ainda não possui um vídeo do YouTube válido.</div>':''}
 <div class="section-head"><div><div class="eyebrow">T${season.number}:E${e.number} · ${e.duration||'?'} min</div>
 <h2 style="margin-top:7px">${esc(e.title)}</h2></div></div>
 <p class="muted" style="line-height:1.7">${esc(e.summary)}</p>
 <div class="controls"><button class="btn" data-action="watch" data-id="${prev?.id||''}" ${prev?'':'disabled'}>← Episódio anterior</button>
 <button class="btn primary" data-action="watch" data-id="${next?.id||''}" ${next?'':'disabled'}>Próximo episódio →</button></div>
 <div class="section-head"><h2>Todos os episódios de ${esc(series.title)}</h2></div>
 <div class="episode-list">${seq.map(epPublicRow).join('')}</div></div>`;
}
function missing(){return `<div class="container"><h1>Conteúdo não encontrado</h1><a class="btn" href="#/">Voltar ao início</a></div>`}
const sideItems=[['dashboard','▦','Visão geral'],['series','▤','Séries'],['seasons','▥','Temporadas'],['episodes','▷','Episódios'],['media','▧','Biblioteca de mídia'],['schedule','◷','Calendário editorial'],['homepage','◈','CMS da página inicial'],['teams','♧','Equipes e permissões'],['settings','⚙','Configurações']];function side(){return `<aside class="sidebar" id="sidebar"><div class="row between"><div class="brand">CENA<em>LIVRE</em><div class="muted tiny" style="letter-spacing:0;font-weight:500">Studio</div></div><button class="btn small mobile-side-close" data-action="toggle-side">✕</button></div><div class="sidebar-label">Operação editorial</div>${sideItems.map(([p,ic,t])=>`<button data-action="route" data-path="/studio/${p}" class="side-link ${route.parts[1]===p?'active':''}"><span style="font-size:17px;width:21px">${ic}</span>${t}</button>`).join('')}<div class="sidebar-label">Plataforma</div><button class="side-link" data-action="route" data-path="/">↗ &nbsp; Visitar portal</button><button class="side-link" data-action="${hosted?'logout':'reset'}">${hosted?'⇥ &nbsp; Sair do Studio':'↻ &nbsp; Restaurar dados'}</button></aside>`}
function studioFrame(content){return `<div class="admin">${side()}<div class="admin-main"><div class="admin-top"><button class="btn small mobile-menu" data-action="toggle-side">☰</button><strong style="font-size:13px">Studio</strong><div style="flex:1"></div><button class="btn small" data-action="route" data-path="/">Ver portal ↗</button></div><main class="admin-content">${content}</main></div></div>`}
function pageHead(title,subtitle,actions=''){return `<div class="pagehead"><div><h1>${title}</h1>${subtitle?'<p>'+subtitle+'</p>':''}</div><div class="row">${actions}</div></div>`}
function stat(n,label){return `<div class="panel"><div class="stat-label">${label}</div><div class="stat-value">${n}</div></div>`}
function dashboard(){const coming=db.episodes.filter(x=>state(x)==='Em breve').sort((a,b)=>new Date(a.releaseAt)-new Date(b.releaseAt));return pageHead('Visão geral','Acompanhe o catálogo e os próximos lançamentos.',`<button class="btn primary" data-action="create-series">+ Nova série</button>`)+`<div class="stat-grid">${stat(db.series.length,'Séries cadastradas')}${stat(db.episodes.length,'Episódios')}${stat(coming.length,'Estreias programadas')}${stat(db.teams.length,'Equipes')}</div><div class="two-column"><section class="panel"><h2>Próximas estreias</h2>${coming.length?coming.slice(0,6).map(x=>`<div class="schedule-line"><div class="smallcaps" style="color:#b25d4d">${dt(x.releaseAt)}</div><strong>${esc(seriesForEpisode(x)?.title)} · ${esc(x.title)}</strong><div class="muted tiny">T${by('seasons',x.seasonId)?.number}:E${x.number}</div></div>`).join(''):'<p class="muted">Nenhuma estreia agendada.</p>'}<button class="btn small" data-action="route" data-path="/studio/schedule">Abrir calendário</button></section><section class="panel"><h2>Produções em destaque</h2>${db.series.slice(0,4).map(s=>`<div class="item-card"><img src="${esc(s.banner)}" alt=""><div class="item-info"><h3>${esc(s.title)}</h3><p>${esc(s.category)} · ${epOrder(s.id).length} episódio(s)</p></div><button class="btn small" data-action="edit-series" data-id="${s.id}">Editar</button></div>`).join('')}</section></div>`}

const catalogFilters={
 series:{query:'',category:'all',visibility:'all'},
 seasons:{query:'',seriesId:'all',status:'all'},
 episodes:{query:'',seriesId:'all',status:'all'}
};
const catalogSelection={series:new Set(),seasons:new Set(),episodes:new Set()};
const catalogStatuses={
 series:[{id:'draft',name:'Rascunho'},{id:'public',name:'Publicado'},{id:'suspended',name:'Suspenso'}],
 seasons:[{id:'draft',name:'Rascunho'},{id:'published',name:'Publicado'},{id:'suspended',name:'Suspenso'}],
 episodes:[{id:'draft',name:'Rascunho'},{id:'scheduled',name:'Agendado'},{id:'published',name:'Publicado'},{id:'suspended',name:'Suspenso'}]
};
function bulkSelectionCount(type){return catalogSelection[type]?.size||0}
function bulkOptions(type){
 return '<option value="">Selecione uma ação</option>'+
  catalogStatuses[type].map(x=>'<option value="status:'+x.id+'">Marcar como '+x.name.toLowerCase()+'</option>').join('')+
  '<option value="delete">Excluir selecionados</option>';
}
function bulkToolbar(type){
 return '<div class="catalog-bulk-bar" data-bulk-type="'+type+'">'+
 '<span class="catalog-bulk-count" data-bulk-count="'+type+'">0 selecionados</span>'+
 '<select class="select" data-bulk-action="'+type+'" aria-label="Ação em lote" disabled>'+bulkOptions(type)+'</select>'+
 '<button class="btn primary small" type="button" data-action="bulk-apply" data-type="'+type+'" disabled>Aplicar</button>'+
 '<button class="btn small" type="button" data-action="bulk-clear" data-type="'+type+'" disabled>Limpar seleção</button></div>';
}
function syncCatalogSelection(type){
 const selection=catalogSelection[type];if(!selection)return;
 const visible=catalogItems(type).map(x=>x.id);
 const header=document.querySelector('[data-bulk-select-all="'+type+'"]');
 const selectedVisible=visible.filter(id=>selection.has(id)).length;
 if(header){header.checked=!!visible.length&&selectedVisible===visible.length;header.indeterminate=selectedVisible>0&&selectedVisible<visible.length;header.disabled=!visible.length}
 const count=document.querySelector('[data-bulk-count="'+type+'"]');
 if(count)count.textContent=selection.size+' selecionado'+(selection.size===1?'':'s');
 const select=document.querySelector('[data-bulk-action="'+type+'"]');
 if(select)select.disabled=!selection.size;
 const apply=document.querySelector('[data-action="bulk-apply"][data-type="'+type+'"]');
 if(apply)apply.disabled=!selection.size||!select?.value;
 const clear=document.querySelector('[data-action="bulk-clear"][data-type="'+type+'"]');
 if(clear)clear.disabled=!selection.size;
 const bar=document.querySelector('[data-bulk-type="'+type+'"]');
 if(bar)bar.classList.toggle('has-selection',selection.size>0);
}
function catalogCheckbox(type,id,label){
 return '<label class="catalog-checkbox"><input type="checkbox" data-bulk-row="'+type+'" value="'+esc(id)+'" '+
  (catalogSelection[type].has(id)?'checked':'')+' aria-label="Selecionar '+esc(label)+'"></label>';
}
function catalogMatches(value,query){
 return String(value||'').toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'));
}
function catalogItems(type){
 const filter=catalogFilters[type];
 if(type==='series'){
  return [...db.series].filter(s=>
   (filter.category==='all'||s.category===filter.category)&&
   (filter.visibility==='all'||(s.visibility||'draft')===filter.visibility)&&
   catalogMatches([s.title,s.category,s.summary,s.teamIds.map(id=>by('teams',id)?.name).join(' ')].join(' '),filter.query)
  ).sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
 }
 if(type==='seasons'){
  return [...db.seasons].filter(s=>(filter.seriesId==='all'||s.seriesId===filter.seriesId)&&
   (filter.status==='all'||(s.status||'published')===filter.status)&&
   catalogMatches([s.title,s.number,by('series',s.seriesId)?.title].join(' '),filter.query)
  ).sort((a,b)=>String(by('series',a.seriesId)?.title||'').localeCompare(String(by('series',b.seriesId)?.title||''),'pt-BR')||a.number-b.number);
 }
 return [...db.episodes].filter(e=>{
  const parent=by('seasons',e.seasonId),production=parent&&by('series',parent.seriesId);
  return (filter.seriesId==='all'||parent?.seriesId===filter.seriesId)&&
   (filter.status==='all'||e.status===filter.status)&&
   catalogMatches([e.title,e.number,e.summary,production?.title,parent?.title].join(' '),filter.query);
 }).sort((a,b)=>{
  const aSeason=by('seasons',a.seasonId),bSeason=by('seasons',b.seasonId);
  return String(by('series',aSeason?.seriesId)?.title||'').localeCompare(String(by('series',bSeason?.seriesId)?.title||''),'pt-BR')||
   Number(aSeason?.number||0)-Number(bSeason?.number||0)||a.number-b.number;
 });
}
const catalogSelect=(label,key,options,chosen)=>
 '<label class="catalog-filter"><span>'+esc(label)+'</span><select class="select" data-catalog-filter="'+key+'">'+
 options.map(o=>'<option value="'+esc(o.id)+'" '+(o.id===chosen?'selected':'')+'>'+esc(o.name||o.title)+'</option>').join('')+
 '</select></label>';
function catalogToolbar(type){
 const filter=catalogFilters[type];
 const categories=[...new Set(db.series.map(s=>s.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const categoryOptions=[{id:'all',name:'Todas as categorias'},...categories.map(v=>({id:v,name:v}))];
 const seriesOptions=[{id:'all',name:'Todas as séries'},...db.series.map(s=>({id:s.id,name:s.title})).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))];
 const statusOptions=[{id:'all',name:'Todos os estados'},...[
  ['draft','Rascunho'],['scheduled','Agendado'],['published','Publicado'],['suspended','Suspenso']
 ].map(([id,name])=>({id,name}))];
 const visibilityOptions=[{id:'all',name:'Todas as visibilidades'},{id:'draft',name:'Rascunho'},
  {id:'public',name:'Pública'},{id:'suspended',name:'Suspensa'}];
 return '<div class="catalog-toolbar" data-catalog-type="'+type+'">'+
  '<label class="catalog-search"><span>Pesquisar</span><input class="input" type="search" data-catalog-search="'+type+'" placeholder="'+
   (type==='series'?'Buscar por título, categoria ou equipe':type==='seasons'?'Buscar temporada ou série':'Buscar episódio, série ou temporada')+
   '" value="'+esc(filter.query)+'" autocomplete="off"></label>'+
  (type==='series'?catalogSelect('Categoria','category',categoryOptions,filter.category)+catalogSelect('Visibilidade','visibility',visibilityOptions,filter.visibility):
   type==='seasons'?catalogSelect('Série','seriesId',seriesOptions,filter.seriesId)+
    catalogSelect('Estado','status',[{id:'all',name:'Todos os estados'},...catalogStatuses.seasons],filter.status):
    catalogSelect('Série','seriesId',seriesOptions,filter.seriesId)+catalogSelect('Estado','status',statusOptions,filter.status))+
  '<button class="btn small catalog-clear" data-action="catalog-clear" data-type="'+type+'" type="button">Limpar filtros</button></div>';
}
function catalogEmpty(type){
 const filter=catalogFilters[type],filtered=filter.query||Object.entries(filter).some(([key,value])=>key!=='query'&&value!=='all');
 const messages={series:'Nenhuma série cadastrada.',seasons:'Nenhuma temporada cadastrada.',episodes:'Nenhum episódio cadastrado.'};
 const create={series:'create-series',seasons:'create-season',episodes:'create-episode'};
 return '<tr><td colspan="6"><div class="catalog-empty"><strong>'+
 (filtered?'Nenhum resultado encontrado.':messages[type])+'</strong>'+
 '<p>'+(filtered?'Altere os filtros ou faça uma nova busca.':'Comece criando um novo conteúdo.')+'</p>'+
 (filtered?'<button type="button" class="btn small" data-action="catalog-clear" data-type="'+type+'">Limpar filtros</button>':
 '<button type="button" class="btn small primary" data-action="'+create[type]+'">Criar agora</button>')+
 '</div></td></tr>';
}
function catalogRows(type){
 const items=catalogItems(type);
 if(!items.length)return catalogEmpty(type);
 if(type==='series')return items.map(s=>{
  const count=db.seasons.filter(t=>t.seriesId===s.id).length;
  const epCount=db.episodes.filter(e=>by('seasons',e.seasonId)?.seriesId===s.id).length;
  const visibility=s.visibility||'draft';
  const badge=visibility==='public'?'Pública':visibility==='suspended'?'Suspensa':'Rascunho';
  return '<tr><td>'+catalogCheckbox(type,s.id,s.title)+'</td><td><div class="catalog-title"><img src="'+esc(s.poster||'')+'" alt="" loading="lazy">'+
   '<div><strong>'+esc(s.title)+'</strong><div class="muted tiny">'+esc(s.category)+'</div></div></div></td>'+
   '<td><span class="badge '+(visibility==='public'?'green':visibility==='suspended'?'orange':'blue')+'">'+badge+'</span></td>'+
   '<td class="catalog-wrap">'+esc((s.teamIds||[]).map(id=>by('teams',id)?.name).filter(Boolean).join(', ')||'Sem equipe')+'</td>'+
   '<td><button class="btn small catalog-count" data-action="catalog-to-seasons" data-id="'+esc(s.id)+'">'+count+' temp. · '+epCount+' ep.</button></td>'+
   '<td class="catalog-row-actions"><button class="btn small" data-action="edit-series" data-id="'+esc(s.id)+'">Editar</button>'+
   '<button class="btn small catalog-delete" data-action="delete-series" data-id="'+esc(s.id)+'">Excluir</button></td></tr>';
 }).join('');
 if(type==='seasons')return items.map(season=>{
  const production=by('series',season.seriesId),number=db.episodes.filter(e=>e.seasonId===season.id).length;
  return '<tr><td>'+catalogCheckbox(type,season.id,season.title)+'</td><td><strong>'+esc(production?.title||'Série indisponível')+'</strong></td>'+
   '<td><span class="catalog-number">'+season.number+'</span></td>'+
   '<td><div><strong>'+esc(season.title)+'</strong><div class="catalog-status-text">'+
   ((season.status||'published')==='published'?'Publicado':season.status==='suspended'?'Suspenso':'Rascunho')+'</div></div></td>'+
   '<td><button class="btn small catalog-count" data-action="catalog-to-episodes" data-id="'+esc(season.seriesId)+'">'+number+' episódios</button></td>'+
   '<td class="catalog-row-actions"><button class="btn small" data-action="edit-season" data-id="'+esc(season.id)+'">Editar</button>'+
   '<button class="btn small catalog-delete" data-action="delete-season" data-id="'+esc(season.id)+'">Excluir</button></td></tr>';
 }).join('');
 return items.map(e=>{
  const season=by('seasons',e.seasonId),production=seriesForEpisode(e);
  const stateLabel=e.status==='published'?'Publicado':e.status==='scheduled'?'Agendado':e.status==='suspended'?'Suspenso':'Rascunho';
  return '<tr><td>'+catalogCheckbox(type,e.id,e.title)+'</td><td><div class="catalog-title"><img src="'+esc(e.thumbnail||'')+'" alt="" loading="lazy">'+
   '<div><strong>'+esc(e.title)+'</strong><div class="muted tiny">T'+(season?.number||'?')+':E'+e.number+'</div></div></div></td>'+
   '<td class="catalog-wrap">'+esc(production?.title||'Série indisponível')+'</td>'+
   '<td><span class="badge '+(e.status==='published'?'green':e.status==='scheduled'?'orange':'blue')+'">'+stateLabel+'</span></td>'+
   '<td>'+esc(e.releaseAt?dt(e.releaseAt):'Sem data')+'</td>'+
   '<td class="catalog-row-actions"><button class="btn small" data-action="edit-episode" data-id="'+esc(e.id)+'">Editar</button>'+
   '<button class="btn small catalog-delete" data-action="delete-episode" data-id="'+esc(e.id)+'">Excluir</button></td></tr>';
 }).join('');
}
function refreshCatalogTable(type){
 const table=document.querySelector('[data-catalog-table="'+type+'"]');
 if(!table)return;
 const tbody=table.querySelector('tbody');
 if(tbody)tbody.innerHTML=catalogRows(type);
 const count=document.querySelector('[data-catalog-count="'+type+'"]');
 if(count)count.textContent=catalogItems(type).length+' de '+
  (type==='series'?db.series:type==='seasons'?db.seasons:db.episodes).length+' itens';
 syncCatalogSelection(type);
}
function catalogPage(type){
 const titles={series:'Séries',seasons:'Temporadas',episodes:'Episódios'};
 const createLabels={series:'Nova série',seasons:'Nova temporada',episodes:'Novo episódio'};
 const createActions={series:'create-series',seasons:'create-season',episodes:'create-episode'};
 const columns={series:['Série','Visibilidade','Equipes','Conteúdo','Ações'],
  seasons:['Série','Nº','Temporada','Episódios','Ações'],
  episodes:['Episódio','Série','Estado','Estreia','Ações']};
 return pageHead(titles[type],'', '<button class="btn primary" data-action="'+createActions[type]+'">+ '+createLabels[type]+'</button>')+
 '<section class="panel catalog-manager">'+catalogToolbar(type)+bulkToolbar(type)+
 '<div class="row between catalog-results"><span data-catalog-count="'+type+'">'+catalogItems(type).length+' de '+
 (type==='series'?db.series:type==='seasons'?db.seasons:db.episodes).length+' itens</span></div>'+
 '<div class="catalog-table-scroll"><table class="data-table catalog-table" data-catalog-table="'+type+'"><thead><tr>'+
 '<th class="catalog-checkbox-column"><label class="catalog-checkbox"><input type="checkbox" data-bulk-select-all="'+type+'" aria-label="Selecionar todos os itens filtrados" '+(catalogItems(type).length?'':'disabled')+'></label></th>'+
 columns[type].map(c=>'<th>'+c+'</th>').join('')+
 '</tr></thead><tbody>'+catalogRows(type)+'</tbody></table></div></section>';
}
function seriesAdmin(){return catalogPage('series')}
function seasonsAdmin(){return catalogPage('seasons')}
function episodesAdmin(){return catalogPage('episodes')}
function mediaAdmin(){
 const allTags=[...new Set(mediaData.assets.flatMap(a=>a.tags))].sort();
 return pageHead('Biblioteca de mídia','Organize, encontre e reutilize suas imagens.',
 '<button class="btn primary" data-action="media-upload-open">+ Enviar imagem</button>')+
 '<div class="panel"><div class="row between"><div><h2>Arquivos armazenados</h2><p class="muted tiny">Busque imagens por nome, categoria ou tag.</p></div>'+
 '<span class="badge" id="media-library-count">'+mediaData.assets.length+' arquivo(s)</span></div>'+
 '<div class="media-toolbar"><input class="input" id="media-search" placeholder="Buscar nome, arquivo ou tag" value="'+esc(mediaSearch)+'">'+
 '<select class="select" id="media-kind-filter"><option value="all">Todas as categorias</option>'+mediaCategories.map(c=>
 '<option value="'+c.id+'" '+(mediaFilter===c.id?'selected':'')+'>'+c.title+'</option>').join('')+'</select>'+
 '<select class="select" id="media-tag-filter"><option value="">Todas as tags</option>'+allTags.map(t=>
 '<option value="'+esc(t)+'" '+(mediaTagFilter===t?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>'+
 '<div class="media-grid" id="media-library-grid">'+(mediaData.assets.length?mediaData.assets.map(a=>mediaCard(a)).join(''):
 '<div class="empty">Nenhuma mídia enviada. Clique em “Enviar imagem” para começar.</div>')+'</div></div>'+
 '<div class="catalog-storage-hint">Formatos permitidos: '+esc(mediaData.settings.allowedTypes.join(', ').toUpperCase())+
 '. Tamanho máximo: '+mediaData.settings.maxFileMb+' MB por arquivo. Até '+mediaData.settings.maxFiles+
 ' imagens. Ajuste os limites em Configurações → Uploads.</div>';
}
function scheduleAdmin(){const es=[...db.episodes].filter(e=>e.releaseAt).sort((a,b)=>new Date(a.releaseAt)-new Date(b.releaseAt));return pageHead('Calendário editorial','Controle as janelas de publicação de cada episódio.')+`<div class="panel"><h2>Linha do tempo de lançamentos</h2>${es.map(e=>`<div class="schedule-line"><div class="smallcaps">${dt(e.releaseAt)}</div><div class="row between"><div><strong>${esc(seriesForEpisode(e)?.title)} — ${esc(e.title)}</strong><div class="tiny muted">${state(e)}${e.endAt?' · expira '+dt(e.endAt):' · sem expiração'}</div></div><button class="btn small" data-action="edit-episode" data-id="${e.id}">Editar datas</button></div></div>`).join('')}</div>`}
function homepageAdmin(){return pageHead('CMS da página inicial','Gerencie a vitrine, campanhas e ordem das seções.',`<button class="btn primary" data-action="create-banner">+ Novo banner</button>`)+`<div class="panel"><h2>Banners e campanhas</h2><div class="stack">${db.banners.map(b=>`<div class="item-card"><img class="banner-thumb" src="${esc(b.image)}" alt=""><div class="item-info"><h3>${esc(b.title)}</h3><p>${bannerActive(b)?'No ar':b.active?'Programado ou encerrado':'Inativo'} · ${b.startAt?dt(b.startAt):'Início imediato'} · ${b.endAt?dt(b.endAt):'Sem término'}</p></div><button class="btn small" data-action="edit-banner" data-id="${b.id}">Editar</button></div>`).join('')}</div></div><div class="panel"><h2>Seções do portal</h2><p class="muted tiny">Altere a ordem e visibilidade dos blocos da página inicial.</p><div class="stack">${db.homeSections.map((s,i)=>`<div class="item-card"><div class="item-info"><h3>${esc(s.title)}</h3><p>${esc(s.kind)}</p></div><label class="tiny"><input type="checkbox" data-action="toggle-section" data-id="${s.id}" ${s.active?'checked':''}> Visível</label><button class="btn small" data-action="move-section" data-id="${s.id}" data-dir="-1" ${i===0?'disabled':''}>↑</button><button class="btn small" data-action="move-section" data-id="${s.id}" data-dir="1" ${i===db.homeSections.length-1?'disabled':''}>↓</button></div>`).join('')}</div></div>`}
function teamsAdmin(){return pageHead('Equipes e permissões','Colaboradores, papéis e responsabilidade pelas produções.',`<button class="btn" data-action="create-team">+ Equipe</button><button class="btn primary" data-action="create-member">+ Integrante</button>`)+`<div class="two-column"><div class="panel"><h2>Equipes</h2><div class="stack">${db.teams.map(t=>`<div class="item-card"><div class="item-info"><h3>${esc(t.name)}</h3><p>${db.members.filter(m=>m.teamId===t.id).length} integrante(s) · ${db.series.filter(s=>s.teamIds.includes(t.id)).length} produção(ões)</p></div><button class="btn small" data-action="edit-team" data-id="${t.id}">Editar</button></div>`).join('')}</div></div><div class="panel"><h2>Integrantes</h2><table class="data-table"><thead><tr><th>Nome</th><th>Equipe</th><th>Papel</th><th></th></tr></thead><tbody>${db.members.map(m=>`<tr><td>${esc(m.name)}<div class="tiny muted">${esc(m.email)}</div></td><td>${esc(by('teams',m.teamId)?.name)}</td><td><span class="badge">${esc(m.role)}</span></td><td><button class="btn small" data-action="edit-member" data-id="${m.id}">Editar</button></td></tr>`).join('')}</tbody></table></div></div><div class="notice">Gerencie integrantes e seus papéis na equipe.</div>`}
function settingsAdmin(){return pageHead('Configurações','')+`<nav class="settings-nav" aria-label="Categorias das configurações"><button class="btn small" data-action="settings-jump" data-target="settings-identidade" type="button">Identidade</button><button class="btn small" data-action="settings-jump" data-target="settings-marca" type="button">Marca</button><button class="btn small" data-action="settings-jump" data-target="settings-reproducao" type="button">Reprodução</button><button class="btn small" data-action="settings-jump" data-target="settings-uploads" type="button">Uploads</button><button class="btn small" data-action="settings-jump" data-target="settings-seguranca" type="button">Segurança</button></nav><section class="panel form-surface-light settings-panel" id="settings-identidade"><div class="settings-section-head"><div><h2>Identidade e portal</h2><p>Dados públicos, imagens da marca e comportamento da reprodução.</p></div></div><form id="settings-form" class="stack"><fieldset class="settings-category"><legend>Identidade da plataforma</legend><div class="field"><label>Nome da plataforma</label><input class="input" name="siteName" value="${esc(db.preferences.siteName)}" required></div><div class="field"><label>Descrição pública</label><textarea class="textarea" name="siteDescription">${esc(db.preferences.siteDescription)}</textarea></div><div class="field"><label>E-mail de contato institucional</label><input class="input" name="contactEmail" type="email" value="${esc(db.preferences.contactEmail||'')}" placeholder="contato@exemplo.com"></div></fieldset><fieldset class="settings-category" id="settings-marca"><legend>Marca · logotipo e ícone</legend>${mediaField('Logotipo','logoUrl',db.preferences.logoUrl||'','logo')}${mediaField('Ícone / favicon','iconUrl',db.preferences.iconUrl||'','icon')}</fieldset><fieldset class="settings-category" id="settings-reproducao"><legend>Reprodução</legend><label class="row tiny"><input type="checkbox" name="autoplay" ${db.preferences.autoplay?'checked':''}> Sugerir reprodução automática do próximo episódio</label></fieldset><div><button class="btn primary" type="submit" ${hosted&&!studioUser?.isAdmin?'disabled':''}>Salvar configurações</button></div></form></section><section class="panel form-surface-light settings-panel" id="settings-uploads"><div class="settings-section-head"><div><h2>Biblioteca de Mídia e uploads</h2><p>Defina os formatos e limites dos arquivos enviados.</p></div></div><form id="upload-settings-form" class="stack"><div class="form-grid"><div class="field"><label>Tamanho máximo por arquivo (1 a 20 MB)</label><input class="input" type="number" name="maxFileMb" min="1" max="20" value="${mediaData.settings.maxFileMb}" required></div><div class="field"><label>Quantidade máxima de imagens (1 a 2000)</label><input class="input" type="number" name="maxFiles" min="1" max="2000" value="${mediaData.settings.maxFiles}" required></div></div><div class="field"><label>Formatos permitidos</label><div class="pillset">${['png','jpeg','webp','gif'].map(t=>`<label class="pill"><input type="checkbox" name="allowedTypes" value="${t}" ${mediaData.settings.allowedTypes.includes(t)?'checked':''}> ${t.toUpperCase()}</label>`).join('')}</div></div><p class="muted tiny">Escolha os formatos e limites permitidos para novos envios. Os arquivos existentes serão mantidos.</p><div><button class="btn primary" type="submit" ${!studioUser?.isAdmin?'disabled':''}>Salvar limites de upload</button></div></form></section><section class="panel settings-panel" id="settings-seguranca"><h2>Ambiente e segurança</h2><p class="muted">O acesso às funções administrativas segue as permissões de cada usuário.</p></section>`}
function studioPage(){const page=route.parts[1]||'dashboard';return studioFrame(({dashboard,series:seriesAdmin,seasons:seasonsAdmin,episodes:episodesAdmin,media:mediaAdmin,schedule:scheduleAdmin,homepage:homepageAdmin,teams:teamsAdmin,settings:settingsAdmin}[page]||dashboard)())}
function render(){parse();
db=route.studio?(hosted?(studioData||publicData):localDemo):publicData;
document.title=`CenaLivre — ${route.studio?'Studio':'Séries gratuitas'}`;
if(!route.studio&&db.preferences?.iconUrl){
  let icon=document.querySelector('link[rel="icon"]');
  if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon)}
  icon.href=db.preferences.iconUrl;
}
const root=document.getElementById('app');
if(hosted&&!route.studio&&publicLoadState!=='ready'){
 const failure=publicLoadState==='error';
 root.innerHTML=publicNav()+'<main class="container public-loading">'+
  '<h1>'+(failure?'Não foi possível carregar o catálogo':'Carregando catálogo...')+'</h1>'+
  '<p class="muted">'+(failure?'Não foi possível carregar as séries. Tente novamente.':'Aguarde um instante.')+'</p>'+
  (failure?'<button class="btn primary" data-action="retry-public">Tentar novamente</button>':'<div class="loading-track"></div>')+
  '</main>';
 return;
}
if(route.studio){
  if(hosted&&!studioUser){root.innerHTML=studioLogin();return}
  if(hosted&&!studioData){root.innerHTML=publicNav()+'<main class="container"><p>Carregando Studio...</p></main>';return}
  root.innerHTML=studioPage();
  if(['series','seasons','episodes'].includes(route.parts[1]))syncCatalogSelection(route.parts[1]);
  return
}let content=route.path==='/'?home():route.parts[0]==='explorar'?explore():route.parts[0]==='serie'?seriesPage(route.parts[1]):route.parts[0]==='assistir'?watchPage(route.parts[1]):route.parts[0]==='entrar'?'<main class="container"><button class="btn primary" data-action="go-studio">Entrar no Studio</button></main>':missing();root.innerHTML=publicNav()+content+`<footer class="footer">CenaLivre · Séries independentes</footer>`;
if(route.parts[0]==='assistir'&&activeVideo===route.parts[1]){
 const episode=by('episodes',route.parts[1]);
 const video=episode&&playable(episode)?ytId(episode.youtube):null;
 if(video){destroyYouTubePlayer();void mountYouTubePlayer(episode.id,video)}
}
}
function modal(title,body){document.getElementById('modal-root').innerHTML=`<div class="modal-backdrop" data-action="close-modal"><div class="modal form-surface-light" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="row between"><h2>${esc(title)}</h2><button class="btn small" data-action="close-modal">✕</button></div>${body}</div></div>`}
const field=(label,name,value='',type='text',extra='')=>`<div class="field"><label>${label}</label><input class="input" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;const area=(label,name,value='')=>`<div class="field span2"><label>${label}</label><textarea class="textarea" name="${name}">${esc(value)}</textarea></div>`;const select=(label,name,opts,selected)=>`<div class="field"><label>${label}</label><select class="select" name="${name}">${opts.map(x=>`<option value="${esc(x.id)}" ${x.id===selected?'selected':''}>${esc(x.title||x.name)}</option>`).join('')}</select></div>`;const submit=`<div class="span2 row between" style="margin-top:12px"><button type="button" class="btn" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Salvar alterações</button></div>`;
function openEditor(type,entityId){const editing=!!entityId,x=editing?by(type,entityId):null;let body='';if(type==='series'){body=`<form class="form-grid" data-form="series" data-id="${entityId||''}">${field('Título','title',x?.title,'text','required')}${field('Categoria','category',x?.category||'Documentário','text','required')}${area('Sinopse','summary',x?.summary)}${mediaField('Pôster vertical','poster',x?.poster||img('new-poster',650,900),'poster')}${mediaField('Banner horizontal','banner',x?.banner||img('new-banner',1300,700),'banner')}<div class="field span2"><label>Equipes responsáveis (selecione uma ou mais)</label><div class="pillset">${db.teams.map(t=>`<label class="pill"><input type="checkbox" name="teamIds" value="${t.id}" ${(x?.teamIds||[]).includes(t.id)?'checked':''}> ${esc(t.name)}</label>`).join('')}</div></div><label class="span2"><input type="checkbox" name="featured" ${x?.featured?'checked':''}> Destaque no portal</label>${submit}</form>`}else if(type==='seasons'){body=`<form class="form-grid" data-form="seasons" data-id="${entityId||''}">${select('Série','seriesId',db.series,x?.seriesId)}${field('Número','number',x?.number||seasons(db.series[0]?.id).length+1,'number','min="1" required')}${field('Título da temporada','title',x?.title||'Nova temporada','text','required')}${select('Estado da temporada','status',catalogStatuses.seasons.map(t=>({id:t.id,title:t.name})),x?.status||(editing?'published':'draft'))}${submit}</form>`}else if(type==='episodes'){body=`<form class="form-grid" data-form="episodes" data-id="${entityId||''}">${select('Temporada','seasonId',db.seasons.map(s=>({...s,title:`${by('series',s.seriesId)?.title} — T${s.number}`})),x?.seasonId)}${field('Número do episódio','number',x?.number||1,'number','min="1" required')}${field('Título','title',x?.title,'text','required')}${field('Duração estimada (min)','duration',x?.duration||20,'number','min="1"')}${area('Sinopse','summary',x?.summary)}${field('URL ou ID do vídeo YouTube','youtube',x?.youtube)}${mediaField('Thumbnail do episódio','thumbnail',x?.thumbnail||img('new-episode',1200,700),'thumbnail')}${field('Disponível a partir de','releaseAt',(x?datetimeLocal(x.releaseAt):future(1)),'datetime-local','required')}${field('Disponível até (opcional)','endAt',(x?datetimeLocal(x.endAt):''),'datetime-local')}${select('Estado editorial','status',[{id:'published',title:'Aprovado / publicado'},{id:'scheduled',title:'Agendado'},{id:'draft',title:'Rascunho'},{id:'suspended',title:'Suspenso'}],x?.status||'scheduled')}${submit}</form>`}else if(type==='banners'){body=`<form class="form-grid" data-form="banners" data-id="${entityId||''}">${field('Título','title',x?.title,'text','required')}${field('Prioridade (menor primeiro)','order',x?.order||1,'number','min="1"')}${area('Texto de apoio','subtitle',x?.subtitle)}${mediaField('Banner desktop','image',x?.image||img('new-campaign',1400,800),'banner')}${mediaField('Banner mobile (opcional)','mobileImage',x?.mobileImage,'banner')}${select('Destino: série','target',db.series,x?.target)}${field('Início da campanha','startAt',(x?datetimeLocal(x.startAt):future(1)),'datetime-local')}${field('Fim da campanha','endAt',(x?datetimeLocal(x.endAt):''),'datetime-local')}<label class="span2"><input type="checkbox" name="active" ${x?.active!==false?'checked':''}> Campanha habilitada</label>${submit}</form>`}else if(type==='teams'){body=`<form class="form-grid" data-form="teams" data-id="${entityId||''}">${field('Nome da equipe','name',x?.name,'text','required')}${field('Descrição','description',x?.description)}${submit}</form>`}else if(type==='members'){body=`<form class="form-grid" data-form="members" data-id="${entityId||''}">${field('Nome','name',x?.name,'text','required')}${field('E-mail','email',x?.email,'email','required')}${select('Equipe','teamId',db.teams,x?.teamId)}${select('Papel na equipe','role',[{id:'Gestora',title:'Gestora'},{id:'Produtor',title:'Produtor'},{id:'Editor',title:'Editor'},{id:'Publicador',title:'Publicador'},{id:'Colaborador',title:'Colaborador'}],x?.role||'Editor')}${submit}</form>`}else if(type==='media'){body=`<form class="form-grid" data-form="media">${field('Nome do arquivo','name','','text','required')}${field('URL da imagem','url','','url','required')}${submit}</form>`}if(hosted&&type==='series'){
  if(editing){
    body=body.replaceAll('name="teamIds"','name="teamIds" disabled');
    body+='<p class="notice">Equipes responsáveis não podem ser alteradas após a criação nesta etapa.</p>';
  }
  if(!studioUser?.isAdmin)body=body.replace('name="featured"','name="featured" disabled');
  if(studioUser?.isAdmin){
    const visibility=select('Visibilidade da série','visibility',
      [{id:'draft',title:'Rascunho — oculta no portal'},{id:'public',title:'Pública no portal'},{id:'suspended',title:'Suspensa'}],
      x?.visibility||'draft');
    body=body.replace('<div class="span2 row between"',visibility+'<div class="span2 row between"');
  }
}
if(hosted&&type==='members'){
  const roles=[{id:'manager',title:'Gestor'},{id:'editor',title:'Editor'},{id:'publisher',title:'Publicador'},{id:'viewer',title:'Visualizador'}];
  const roleSelect=select('Papel na equipe','role',roles,x?.role||'editor');
  body=body.replace(/<div class="field"><label>Papel na equipe<\/label>[\s\S]*?<\/select><\/div>/,roleSelect);
  if(!editing){
    const credentials=field('Senha inicial (mínimo 12 caracteres)','password','','password','minlength="12" maxlength="128" required')+
      '<p class="span2 muted tiny">Forneça a senha ao integrante por um canal seguro. Ele poderá entrar no Studio após o cadastro.</p>';
    body=body.replace('<div class="span2 row between"',credentials+'<div class="span2 row between"');
  }else{
    body=body.replace('name="email"','name="email" readonly');
  }
}
if(hosted&&type==='seasons'&&editing)body=body.replace('name="seriesId"','name="seriesId" disabled');
if(hosted&&type==='episodes'&&editing)body=body.replace('name="seasonId"','name="seasonId" disabled');
modal((editing?'Editar ':'Adicionar ')+({series:'série',seasons:'temporada',episodes:'episódio',banners:'banner',teams:'equipe',members:'integrante',media:'mídia'}[type]),body)}

const catalogSingular={series:'série',seasons:'temporada',episodes:'episódio'};

function bulkDescription(type,action,status){
 const names={series:'séries',seasons:'temporadas',episodes:'episódios'};
 if(action==='delete')return 'Excluir '+names[type];
 const label=catalogStatuses[type].find(x=>x.id===status)?.name||status;
 return 'Alterar para '+label.toLowerCase();
}
function openBulkConfirmation(type){
 const choices=catalogSelection[type];if(!choices?.size)return;
 if(choices.size>100){toast('Selecione até 100 itens por operação.');return;}
 const picker=document.querySelector('[data-bulk-action="'+type+'"]');
 const chosen=picker?.value||'';
 if(!chosen){toast('Selecione uma ação.');return;}
 const action=chosen==='delete'?'delete':'set_status';
 const status=action==='set_status'?chosen.slice(7):null;
 if(action==='set_status'&&!catalogStatuses[type].some(x=>x.id===status))return;
 const ids=[...choices];
 const names=ids.map(id=>by(type,id)?.title).filter(Boolean);
 const lines=names.slice(0,5).map(name=>'<li>'+esc(name)+'</li>').join('');
 const warning=action==='delete'?
  'A exclusão é permanente. Séries com temporadas ou banners e temporadas com episódios não poderão ser excluídas.':
  'A mudança afeta a disponibilidade do conteúdo no portal, conforme a visibilidade da série e as datas de estreia.';
 const msg='Se algum conteúdo não puder ser alterado, nenhum item da seleção será modificado.';
 modal(bulkDescription(type,action,status),
  '<div class="catalog-bulk-confirm">'+
  '<p><strong>'+ids.length+' '+(ids.length===1?'item selecionado':'itens selecionados')+'</strong></p>'+
  '<ul>'+lines+(ids.length>5?'<li>e mais '+(ids.length-5)+'...</li>':'')+'</ul>'+
  '<p class="muted">'+esc(warning)+'</p><p class="muted tiny">'+esc(msg)+'</p>'+
  '<div class="row between"><button type="button" class="btn" data-action="close-modal">Cancelar</button>'+
  '<button type="button" class="btn primary '+(action==='delete'?'catalog-confirm-danger':'')+
  '" data-action="bulk-confirm" data-type="'+type+'" data-operation="'+action+
  '" data-status="'+esc(status||'')+'">Confirmar '+(action==='delete'?'exclusão':'alteração')+'</button></div></div>');
}
async function performBulkOperation(type,action,status,button){
 const items=[...catalogSelection[type]];
 if(!items.length)return;
 if(button)button.disabled=true;
 try{
  const response=await apiRequest('/api/v1/studio/bulk',{method:'POST',
   body:JSON.stringify({resource:type,action,ids:items,...(action==='set_status'?{status}:{})})});
  await fetchStudioData();
  await refreshPublicCatalog();
  catalogSelection[type].clear();
  document.getElementById('modal-root').innerHTML='';
  render();
  toast(response.count+' '+(response.count===1?'item atualizado.':'itens atualizados.'));
 }catch(error){
  const messages={
   invalid_bulk_request:'Seleção inválida. Escolha até 100 itens diferentes.',
   invalid_status:'O status selecionado é inválido.',
   item_not_found:'Um item selecionado não existe mais. Atualize a lista.',
   forbidden:'Sua conta não tem permissão para alterar um dos itens.',
   publish_denied:'Você não tem permissão para publicar ou retirar um dos itens.',
   episode_missing_release_date:'Preencha a data de estreia dos episódios antes de publicar ou agendar.',
   series_has_seasons:'Uma das séries possui temporadas. Remova-as antes da exclusão.',
   series_has_banners:'Uma das séries está vinculada a banners. Desvincule-os antes da exclusão.',
   season_has_episodes:'Uma das temporadas contém episódios. Remova-os antes da exclusão.'
  };
  toast(messages[error.message]||error.message||'Não foi possível concluir a ação.');
  if(button)button.disabled=false;
 }
}

function openCatalogDelete(type,id){
 const entity=by(type,id);if(!entity)return;
 const name=entity.title||entity.name||'Item';
 const deps=type==='series'?db.seasons.filter(s=>s.seriesId===id).length:
  type==='seasons'?db.episodes.filter(e=>e.seasonId===id).length:0;
 const label=type==='series'?'temporada(s)':type==='seasons'?'episódio(s)':'';
 const text=deps?
  'Este conteúdo possui '+deps+' '+label+'. Exclua os conteúdos vinculados primeiro.':
  'Esta ação é permanente e não pode ser desfeita.';
 const next=type==='series'?'catalog-to-seasons':type==='seasons'?'catalog-to-episodes':'';
 const goId=type==='series'?id:entity.seriesId;
 const body='<div class="catalog-delete-dialog"><p>Deseja excluir <strong>'+esc(name)+'</strong>?</p>'+
 '<p class="'+(deps?'catalog-delete-warning':'muted')+'">'+esc(text)+'</p>'+
 '<div class="row between"><button type="button" class="btn" data-action="close-modal">Cancelar</button>'+
 (deps?'<button type="button" class="btn" data-action="'+next+'" data-id="'+esc(goId)+'">Ver '+(type==='series'?'temporadas':'episódios')+'</button>':
 '<button type="button" class="btn primary catalog-confirm-danger" data-action="catalog-confirm-delete" data-type="'+type+
 '" data-id="'+esc(id)+'">Excluir '+catalogSingular[type]+'</button>')+'</div></div>';
 modal('Excluir '+catalogSingular[type],body);
}
async function deleteCatalogEntity(type,id,button){
 const endpoints={series:'series',seasons:'seasons',episodes:'episodes'};
 if(!endpoints[type]||!by(type,id))return;
 if(button)button.disabled=true;
 try{
  await apiRequest('/api/v1/studio/'+endpoints[type]+'/'+encodeURIComponent(id),{method:'DELETE'});
  await fetchStudioData();
  await refreshPublicCatalog();
  document.getElementById('modal-root').innerHTML='';
  render();toast('Conteúdo excluído.');
 }catch(error){
  const messages={series_has_seasons:'Exclua primeiro as temporadas desta série.',
   series_has_banners:'A série está vinculada a banners. Remova os banners antes.',
   season_has_episodes:'Exclua primeiro os episódios desta temporada.',
   publish_denied:'Você não tem permissão para excluir conteúdo publicado.',
   forbidden:'Você não tem permissão para excluir este conteúdo.'};
  toast(messages[error.message]||error.message||'Não foi possível excluir.');
  if(button)button.disabled=false;
 }
}

function formSubmit(form){const type=form.dataset.form;if(!type)return;
if(hosted){if(['series','seasons','episodes','teams','members','banners'].includes(type)){void saveRemoteEntity(form);}else toast('Esta operação ainda não está habilitada.');return;}
const f=new FormData(form),v=Object.fromEntries(f.entries());if(type==='episodes'&&v.endAt&&v.releaseAt&&new Date(v.endAt)<=new Date(v.releaseAt)){toast('O término precisa ser posterior à estreia.');return}if(type==='banners'&&v.endAt&&v.startAt&&new Date(v.endAt)<=new Date(v.startAt)){toast('O fim da campanha precisa ser posterior ao início.');return}if(type==='series'){v.slug=slug(v.title);v.teamIds=f.getAll('teamIds');v.featured=f.has('featured')}if(type==='banners'){v.active=f.has('active');v.order=Number(v.order)||1}if(type==='episodes'){v.number=Number(v.number);v.duration=Number(v.duration);v.status=v.status||'scheduled'}if(type==='seasons')v.number=Number(v.number);if(type==='series'&&!v.teamIds.length){toast('Selecione uma equipe responsável.');return}const old=form.dataset.id&&by(type,form.dataset.id);if(old)Object.assign(old,v);else db[type].push({id:id(type[0]),...v});save();document.getElementById('modal-root').innerHTML='';render();toast('Alterações salvas.')}
function handle(action,el){const eid=el.dataset.id;
if(action==='bulk-clear'){
 const type=el.dataset.type;if(catalogSelection[type]){catalogSelection[type].clear();refreshCatalogTable(type);}
 return;
}
if(action==='bulk-apply'){openBulkConfirmation(el.dataset.type);return;}
if(action==='bulk-confirm'){
 void performBulkOperation(el.dataset.type,el.dataset.operation,el.dataset.status,el);return;
}

if(action==='create-season'){
 if(!db.series.length){toast('Crie uma série antes de cadastrar temporadas.');return;}
 openEditor('seasons');
 const requested=catalogFilters.seasons.seriesId;
 if(requested!=='all'){
  const input=document.querySelector('#modal-root [name="seriesId"]');
  if(input)input.value=requested;
 }
 return;
}
if(action==='create-episode'){
 if(!db.seasons.length){toast('Crie uma temporada antes de cadastrar episódios.');return;}
 openEditor('episodes');
 const selected=catalogFilters.episodes.seriesId;
 if(selected!=='all'){
  const season=db.seasons.filter(se=>se.seriesId===selected).sort((a,b)=>a.number-b.number)[0];
  if(season){const input=document.querySelector('#modal-root [name="seasonId"]');if(input)input.value=season.id;}
 }
 return;
}
if(action==='catalog-clear'){
 const type=el.dataset.type;if(!catalogFilters[type])return;
 for(const key of Object.keys(catalogFilters[type]))catalogFilters[type][key]=key==='query'?'':'all';
 render();return;
}
if(action==='catalog-to-seasons'){
 catalogFilters.seasons.seriesId=eid;
 document.getElementById('modal-root').innerHTML='';
 nav('/studio/seasons');return;
}
if(action==='catalog-to-episodes'){
 catalogFilters.episodes.seriesId=eid;
 document.getElementById('modal-root').innerHTML='';
 nav('/studio/episodes');return;
}
if(action==='catalog-confirm-delete'){void deleteCatalogEntity(el.dataset.type,eid,el);return}
if(action.startsWith('delete-')&&['series','season','episode'].includes(action.slice(7))){
 const type={series:'series',season:'seasons',episode:'episodes'}[action.slice(7)];
 if(hosted)openCatalogDelete(type,eid);
 else{toast('A exclusão está disponível no Studio.');}
 return;
}

if(action==='player-toggle'){toggleYouTubePlayback();return}
if(action==='retry-public'){window.location.reload();return}
if(action==='settings-jump'){document.getElementById(el.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});return}
if(action==='media-picker-close'){closeMediaPicker();return}
if(action==='media-pick'){
 const media=mediaData.assets.find(a=>a.id===eid);
 if(media&&mediaPickerField){
  const input=document.querySelector('#modal-root [name="'+mediaPickerField+'"]')||
    document.querySelector('#settings-form [name="'+mediaPickerField+'"]');
  if(input){input.value=media.url;input.dispatchEvent(new Event('input',{bubbles:true}));}
  closeMediaPicker();toast('Imagem selecionada.');
 }return;
}
if(action==='media-choose'){openMediaPicker(el.dataset.field,el.dataset.kind);return}
if(action==='media-clear'){
 assignMediaToField(el.dataset.field,'');
 return;
}
if(action==='media-upload-open'){mediaUploadModal();return}
if(action==='media-edit'){editMedia(eid);return}
if(action==='media-copy'){
 const item=mediaData.assets.find(a=>a.id===eid);
 if(item)navigator.clipboard?.writeText(new URL(item.url,location.origin).href).then(()=>toast('Link copiado.'),()=>toast('Não foi possível copiar.'));
 return;
}
if(action==='media-download'){
 const item=mediaData.assets.find(a=>a.id===eid);
 if(item)window.open(item.url+'?download=1','_blank','noopener');
 return;
}
if(action==='media-delete'){void deleteMedia(eid);return}
if(action==='logout'){void logoutStudio();return}
if(hosted&&route.studio&&(/^(reset|move-section|toggle-section)$/.test(action))){
  toast('Funcionalidade administrativa em migração. Nenhum dado foi alterado.');return;
}
switch(action){case'route':nav(el.dataset.path);break;case'go-studio':nav('/studio/dashboard');break;case'go-series':nav('/serie/'+eid);break;case'watch':if(eid)nav('/assistir/'+eid);break;case'play-video':{const e=by('episodes',eid);if(!e||!playable(e))break;if(ytId(e.youtube)){activeVideo=eid;render()}else toast('Vídeo indisponível. Verifique o link do episódio.');break}case'home-view':homeView=el.dataset.view==='list'?'list':'grid';render();break;case'catalog-view':catalogView=el.dataset.view==='list'?'list':'grid';localStorage.setItem('cenalivre-catalog-view',catalogView);render();break;case'filter-cat':filterCategory=el.dataset.cat;history.replaceState(null,'','#/explorar');render();break;case'fav':{const i=db.saved.indexOf(eid);if(i>=0)db.saved.splice(i,1);else db.saved.push(eid);save();render();toast(i>=0?'Removido da lista.':'Adicionado à lista deste navegador.');break}case'toggle-side':document.getElementById('sidebar')?.classList.toggle('open');break;case'close-modal':document.getElementById('modal-root').innerHTML='';break;case'create-series':openEditor('series');break;case'edit-series':openEditor('series',eid);break;case'create-season':openEditor('seasons');break;case'edit-season':openEditor('seasons',eid);break;case'create-episode':openEditor('episodes');break;case'edit-episode':openEditor('episodes',eid);break;case'create-banner':openEditor('banners');break;case'edit-banner':openEditor('banners',eid);break;case'create-team':openEditor('teams');break;case'edit-team':openEditor('teams',eid);break;case'create-member':openEditor('members');break;case'edit-member':openEditor('members',eid);break;case'add-media':openEditor('media');break;case'toggle-section':{let x=by('homeSections',eid);if(x)x.active=el.checked;save();render();break}case'move-section':{const i=db.homeSections.findIndex(x=>x.id===eid),j=i+Number(el.dataset.dir);if(j>=0&&j<db.homeSections.length)[db.homeSections[i],db.homeSections[j]]=[db.homeSections[j],db.homeSections[i]];save();render();break}case'copy-url':navigator.clipboard?.writeText(el.dataset.url).then(()=>toast('URL copiada.'),()=>toast('Não foi possível copiar automaticamente.'));break;case'reset':if(confirm('Restaurar todos os dados fictícios? Suas alterações locais serão perdidas.')){db=initial();save();nav('/studio/dashboard');render();toast('Dados restaurados.')}break;}}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]');if(!el)return;
 if(el.dataset.action==='close-modal'&&el.classList.contains('modal-backdrop')&&e.target!==el)return;
 if(el.dataset.action==='media-picker-close'&&el.classList.contains('media-picker-backdrop')&&e.target!==el)return;
 if(el.tagName==='BUTTON')e.preventDefault();
 handle(el.dataset.action,el);
});document.addEventListener('submit',e=>{e.preventDefault();
if(e.target.querySelector('.media-field.uploading')){toast('Aguarde o upload da imagem terminar antes de salvar.');return;}

if(e.target.id==='media-upload-form'){void submitMediaUpload(e.target);return}
if(e.target.id==='media-edit-form'){void updateMedia(e.target);return}
if(e.target.id==='upload-settings-form'){
 const fd=new FormData(e.target);
 void (async()=>{
  try{
   await apiRequest('/api/v1/studio/media/settings',{method:'PUT',
    body:JSON.stringify({maxFileMb:Number(fd.get('maxFileMb')),maxFiles:Number(fd.get('maxFiles')),
      allowedTypes:fd.getAll('allowedTypes')})});
   await fetchMedia();render();toast('Limites de upload atualizados.');
  }catch(err){toast(err.message)}
 })();return;
}

if(e.target.id==='studio-login'){void loginStudio(e.target);return;}
if(hosted&&e.target.id==='settings-form'){void saveRemoteSettings(e.target);return;}
if(e.target.id==='settings-form'){const f=new FormData(e.target);db.preferences={siteName:f.get('siteName'),siteDescription:f.get('siteDescription'),autoplay:f.has('autoplay')};save();toast('Preferências salvas.')}else formSubmit(e.target)});document.addEventListener('change',e=>{
if(e.target.matches('[data-bulk-row]')){
 const type=e.target.dataset.bulkRow;
 if(catalogSelection[type]){
  if(e.target.checked)catalogSelection[type].add(e.target.value);
  else catalogSelection[type].delete(e.target.value);
  syncCatalogSelection(type);
 }return;
}
if(e.target.matches('[data-bulk-select-all]')){
 const type=e.target.dataset.bulkSelectAll;
 if(catalogSelection[type]){
  for(const row of catalogItems(type)){
   if(e.target.checked)catalogSelection[type].add(row.id);
   else catalogSelection[type].delete(row.id);
  }
  refreshCatalogTable(type);
 }return;
}
if(e.target.matches('[data-bulk-action]')){
 syncCatalogSelection(e.target.dataset.bulkAction);return;
}
if(e.target.matches('[data-catalog-filter]')){
 const type=e.target.closest('[data-catalog-type]')?.dataset.catalogType;
 if(type&&catalogFilters[type]){
  catalogFilters[type][e.target.dataset.catalogFilter]=e.target.value;
  refreshCatalogTable(type);
 }return;
}
if(e.target.id==='media-kind-filter'){mediaFilter=e.target.value;refreshMediaResults();return}
if(e.target.id==='media-tag-filter'){mediaTagFilter=e.target.value;refreshMediaResults();return}
if(e.target.id==='media-picker-kind'){updateMediaPicker();return}
if(e.target.matches('.media-inline-file')){void uploadInlineMedia(e.target);return}
if(e.target.id==='media-picker-file'){
 void uploadFromPicker(e.target.files?.[0]);return;
}
if(e.target.matches('#media-upload-form input[type="file"]')){
 const file=e.target.files?.[0];if(!file)return;
 const name=e.target.closest('form').elements.name;
 if(name&&!name.value&&e.target.files.length===1)name.value=file.name.replace(/\.[^.]+$/,'');
 const target=document.getElementById('media-upload-preview');
 if(target){
  const url=URL.createObjectURL(file);
  target.innerHTML='<img src="'+url+'" alt="Prévia do upload"><span class="tiny muted">'+e.target.files.length+' imagem(ns) selecionada(s)</span>';
  target.querySelector('img').addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
 }
 return;
}
if(e.target.id==='public-season'){studioSection=e.target.value;render()}else if(e.target.matches('input[data-action="toggle-section"]'))handle('toggle-section',e.target)});document.addEventListener('dragover',e=>{
  const area=e.target.closest('.media-drop');if(area){e.preventDefault();area.classList.add('drag-over');}
});
document.addEventListener('dragleave',e=>{const area=e.target.closest('.media-drop');if(area)area.classList.remove('drag-over')});
document.addEventListener('drop',e=>{
  const area=e.target.closest('.media-drop');if(!area)return;
  e.preventDefault();area.classList.remove('drag-over');
  const input=area.querySelector('input[type="file"]');
  if(input&&e.dataTransfer?.files?.length){
    input.files=e.dataTransfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
  }
});
document.addEventListener('input',e=>{
if(e.target.matches('[data-catalog-search]')){
 const type=e.target.dataset.catalogSearch;
 if(catalogFilters[type]){catalogFilters[type].query=e.target.value;refreshCatalogTable(type);}
 return;
}
if(e.target.id==='media-search'){mediaSearch=e.target.value;refreshMediaResults();return}
if(e.target.id==='media-picker-search'){updateMediaPicker();return}
if(e.target.matches('.media-manual-url input[name]')){updateInlineMediaField(e.target.name,e.target.value);return;}
if(e.target.matches('.media-field [name]')){
 const preview=e.target.closest('.media-field').querySelector('.media-field-preview');
 if(preview)preview.innerHTML=e.target.value?'<img src="'+esc(e.target.value)+'" alt="Prévia">':'<span class="muted">Nenhuma imagem selecionada</span>';
}
if(e.target.id==='public-search'){searchTerm=e.target.value;document.getElementById('explore-results').innerHTML=cardGrid(db.series.filter(x=>(filterCategory==='Todas'||x.category===filterCategory)&&`${x.title} ${x.summary} ${x.category}`.toLowerCase().includes(searchTerm.toLowerCase())))}});window.addEventListener('hashchange',()=>{destroyYouTubePlayer();studioSection='';render()});
render();
// A versão identifica os arquivos que o Nginx realmente está servindo.
if(hosted){
  fetch('/version.json',{cache:'no-store'}).then(r=>r.ok?r.json():null)
    .then(data=>{frontendVersion=data?.version||'indisponível';render();})
    .catch(()=>{frontendVersion='indisponível';render();});
  fetch('/api/v1/public/bootstrap',{credentials:'same-origin',cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('api_http_'+r.status);return r.json();})
    .then(payload=>{
      if(!payload||!Array.isArray(payload.series)||!Array.isArray(payload.episodes))throw new Error('invalid_bootstrap');
      for(const key of ['series','seasons','episodes','banners','homeSections']){
        if(Array.isArray(payload[key]))publicData[key]=payload[key];
      }
      if(payload.branding)publicData.preferences={...publicData.preferences,...payload.branding};
      publicLoadState='ready';publicLoadError='';
      if(!location.hash.startsWith('#/studio'))render();
    })
    .catch(error=>{
      publicLoadState='error';publicLoadError=String(error);
      console.error('CenaLivre: falha no catálogo público',error);
      if(!location.hash.startsWith('#/studio'))render();
    });
  void loadSession();
}
})();
