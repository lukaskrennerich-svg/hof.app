"use strict";
/* ---------- Icons ---------- */
const svgI=(d,s=22,w=1.9)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const I={
  uebersicht:'M3 21h18M6 18v-6M11 18V5M16 18V9M21 18v-3',
  karte:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  massnahmen:'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  stall:'M3 11 12 4l9 7M5 10v10h14V10M9 20v-6h6v6',
  markt:'M3 17l6-6 4 4 8-8M15 7h6v6',
  betrieb:'M4 14V8h7l2 6M13 14h5l2 2M11 8V5M10 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  mic:'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8',
  cam:'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  dl:'M12 3v12M7 10l5 5 5-5M4 21h16',
  x:'M6 6l12 12M18 6 6 18', back:'M15 6l-6 6 6 6', plus:'M12 5v14M5 12h14',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4', send:'M5 12h14M13 6l6 6-6 6', edit:'M4 20h4L19 9l-4-4L4 16v4z'
};
/* ---------- Helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NF={};
const nf=(n,d=0)=>(NF[d]||(NF[d]=new Intl.NumberFormat('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}))).format(Number.isFinite(n)?n:0);
const eur=n=>nf(Math.round(n))+' €';
const eur2=n=>nf(n,2)+' €';
const fha=n=>nf(n,2)+' ha';
const n0=v=>{const x=num(v);return Number.isFinite(x)?x:0};
function num(v){if(typeof v==='number')return v;if(v==null)return NaN;v=String(v).trim().replace(/\s|€|%/g,'');if(!v)return NaN;if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');return parseFloat(v)}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const todayISO=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const fmtD=d=>{if(!d)return'';const [y,m,t]=d.split('-');return `${t}.${m}.${String(y).slice(2)}`};
const MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MONS=['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
const fmtIn=v=>v==null||v===''?'':(typeof v==='number'?String(+v.toFixed(4)).replace('.',','):v);
const val=id=>(document.getElementById(id)?.value??'').trim();
const nval=id=>{const x=num(val(id));return Number.isFinite(x)?x:null};
const ls={get(k,d){try{const v=localStorage.getItem('ask.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ask.'+k,JSON.stringify(v))}catch(e){}}};
function toast(t,ms=2600){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,ms)}
const wjLabel=s=>s+'/'+String((s+1)%100).padStart(2,'0');
function wjOf(date,typ){if(!date)return wjLabel(new Date().getFullYear());const [y,m]=date.split('-').map(Number);let s=m>=7?y:y-1;if(typ==='ernte'&&m>=7&&m<=11)s-=1;return wjLabel(s)}
const wjRange=w=>{const s=parseInt(w);return [s+'-07-01',(s+1)+'-06-30']};

/* ---------- Stammdaten-Konstanten ---------- */
const TYP={bodenbearbeitung:['Bodenbearbeitung','var(--c-masch)'],aussaat:['Aussaat','var(--c-saat)'],duengung:['Düngung','var(--c-dueng)'],pflanzenschutz:['Pflanzenschutz','var(--c-psm)'],ernte:['Ernte','var(--c-pacht)'],sonstiges:['Sonstiges','var(--c-sonst)']};
const KAT={duenger:'Dünger',psm:'Pflanzenschutz',saatgut:'Saatgut',sonstiges:'Sonstiges'};
const KATS={duenger:'Dünger',psm:'PSM',saatgut:'Saatgut',sonstiges:'Sonstige'};
const BESITZ={eigen:['Eigen',''],mr:['MR / Gemeinschaft','mr'],lohnunternehmer:['Lohnunternehmer','lu']};
const KCOL=[['weizen','#C9A85A'],['dinkel','#BE9A55'],['gerste','#A9B865'],['roggen','#B58F62'],['triticale','#C2A070'],['hafer','#D1C07E'],['raps','#E5CF3C'],['rübe','#7FA6B4'],['rueb','#7FA6B4'],['mais','#8DB05E'],['kartoffel','#B98A6B'],['soja','#9DBB7A'],['erbse','#8FBF9A'],['bohne','#7EA383'],['grün','#4F8A4A'],['wiese','#4F8A4A'],['weide','#4F8A4A'],['klee','#6FA36A'],['brache','#A7A99A'],['zwischen','#9BB28C']];
const kColor=k=>{k=(k||'').toLowerCase();if(!k)return '#A7AE9F';for(const [s,c] of KCOL)if(k.includes(s))return c;let h=0;for(const ch of k)h=(h*31+ch.charCodeAt(0))%360;return `hsl(${h} 32% 58%)`};
const kShort=k=>{const l=(k||'').toLowerCase();for(const [s,n] of [['weizen','Weizen'],['gerste','Gerste'],['raps','Raps'],['rübe','Rüben'],['mais','Mais'],['roggen','Roggen'],['dinkel','Dinkel'],['hafer','Hafer'],['triticale','Triticale'],['grün','Grünland'],['wiese','Grünland'],['kartoffel','Kartoffeln'],['soja','Soja']])if(l.includes(s))return n;return k||'Ohne Kultur'};
const STALLKAT=['Kraftfutter','Grundfutter','Mineralfutter','Tierarzt & Medikamente','Besamung','Einstreu','Energie & Wasser','Melktechnik','Sonstiges'];
const DVKANAL=['Hofladen','Milchtankstelle','Wochenmarkt','Lieferung','Sonstiges'];

/* ---------- Datenhaltung (Supabase) ---------- */
const COLS=['settings','schlaege','pacht','anbau','massnahmen','mittel','maschinen','einkauf','sonstkosten','milch','dv','stallkosten','tiere','vorlagen','eingang','tierdaten','markt'];
const D={};COLS.forEach(c=>D[c]={});
const CFG=window.HOF_CONFIG||{};
let SB=null,BETRIEB=null,ROLE=null,ME=null,SAMPLE=null,LOCAL=false,CANWRITE=true,READY=false,CH=null,CH2=null,LASTLOAD=0;
let OUTBOX=ls.get('outbox',[]);
const S={auth:'loading',view:ls.get('view','uebersicht'),stack:[],sel:null,wj:ls.get('wj',null),mf:'Alle',ms:'',seg:ls.get('seg','maschinen'),mseg:'duenger',msearch:'',stallSeg:'milch',stallYear:new Date().getFullYear(),mapK:'Alle',mapQ:'',imgOK:false,imp:null,listOpen:false,members:[],betriebe:[],draw:null,email:ls.get('email','')};
const DL={save:async({filename,data})=>{const blob=data instanceof Blob?data:new Blob([data],{type:filename.endsWith('.json')?'application/json':'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return {status:'saved'}}};

function startLocal(){LOCAL=true;S.auth='ready';const raw=ls.get('data',null);if(raw)COLS.forEach(c=>D[c]=raw[c]||{});READY=true;render(true)}
const persistLocal=()=>ls.set('data',D);
let cacheT=0;
function saveCacheSoon(){clearTimeout(cacheT);cacheT=setTimeout(()=>{if(BETRIEB)ls.set('cache',{betrieb:BETRIEB,role:ROLE,me:ME,D})},1500)}
function readInvite(){const m=location.hash.match(/^#einladung-([A-Za-z0-9]{20,})$/);if(m){ls.set('invite',m[1]);history.replaceState(null,'',location.pathname+location.search)}if(location.hash==='#einrichten'){S.setup=true;S.authMode='register'}S.invite=ls.get('invite',null)}
async function loadInviteInfo(){if(!S.invite||!SB||S.inviteInfo)return;const {data}=await SB.rpc('einladung_info',{c:S.invite}).then(r=>r,()=>({}));S.inviteInfo=data||{gueltig:false};if(S.inviteInfo.gueltig){S.authMode='register';if(S.inviteInfo.email&&!S.email)S.email=S.inviteInfo.email}if(S.auth==='login')render(true)}
async function acceptInvite(meta){const c=S.invite||(meta&&meta.einladung);if(!c||ls.get('inviteDone',null)===c)return;const {error}=await SB.rpc('einladung_annehmen',{c});if(!error)ls.set('inviteDone',c);if(error&&!S.invite)return;if(error)toast(error.message,8000);else toast('Einladung angenommen – willkommen!',5000);ls.set('invite',null);S.invite=null;S.inviteInfo=null}
async function boot(){readInvite();
  if(!CFG.supabaseUrl||!CFG.supabaseAnonKey||!window.supabase){startLocal();return}
  SB=supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  if(CFG.kiFunktion){SAMPLE={json:kiJson};S.imgOK=true}
  SB.auth.onAuthStateChange((ev,session)=>{if(ev==='PASSWORD_RECOVERY'){ME={id:session.user.id,email:(session.user.email||'').toLowerCase()};S.auth='recovery';render(true);return}if(ev==='SIGNED_IN'&&session&&!ME&&S.auth!=='recovery')afterLogin(session);if(ev==='SIGNED_OUT'){ME=null;BETRIEB=null;S.auth='login';render(true)}});
  const {data}=await SB.auth.getSession().catch(()=>({data:{}}));
  if(data&&data.session)await afterLogin(data.session);
  else{const c=ls.get('cache',null);if(c&&!navigator.onLine){useCache(c)}else{S.auth='login';render(true);loadInviteInfo()}}
}
function useCache(c){BETRIEB=c.betrieb;ROLE=c.role;ME=c.me;CANWRITE=ROLE!=='leser';COLS.forEach(k=>D[k]=c.D[k]||{});applyOutbox();READY=true;S.auth='ready';render(true)}
async function afterLogin(session){
  ME={id:session.user.id,email:(session.user.email||'').toLowerCase()};
  S.auth='loading';render(true);
  await acceptInvite(session.user.user_metadata);
  const {data,error}=await SB.from('betriebe').select('id,name,owner').order('created_at');
  if(error){const c=ls.get('cache',null);if(c&&c.me&&c.me.id===ME.id){useCache(c);toast('Offline – zeige zuletzt geladene Daten.')}else{S.auth='error';S.err=error.message;render(true)}return}
  S.betriebe=data||[];
  if(!S.betriebe.length){S.auth='nobetrieb';render(true);return}
  const want=ls.get('betrieb',null);BETRIEB=S.betriebe.find(b=>b.id===want)||S.betriebe[0];
  await loadBetrieb();
}
async function loadMembers(){setTimeout(()=>loadInvites().then(schedule),0);const m=await SB.from('mitglieder').select('email,rolle,name').eq('betrieb_id',BETRIEB.id).order('created_at');S.members=m.data||[];const me=S.members.find(x=>x.email===ME.email);ROLE=me?me.rolle:'leser';CANWRITE=ROLE!=='leser'}
async function loadDocs(){
  const N={};COLS.forEach(c=>N[c]={});
  for(let from=0;;from+=1000){const {data,error}=await SB.from('docs').select('col,id,data').eq('betrieb_id',BETRIEB.id).order('col').order('id').range(from,from+999);if(error)throw error;data.forEach(r=>{if(N[r.col])N[r.col][r.id]={...r.data,id:r.id}});if(data.length<1000)break}
  COLS.forEach(c=>D[c]=N[c]);applyOutbox();LASTLOAD=Date.now();saveCacheSoon();
}
async function loadBetrieb(){
  S.auth='loading';render(true);
  try{await loadMembers();await loadDocs()}catch(e){const c=ls.get('cache',null);if(c&&c.betrieb&&c.betrieb.id===BETRIEB.id){useCache(c);return}S.auth='error';S.err=e.message||String(e);render(true);return}
  READY=true;S.auth='ready';ls.set('betrieb',BETRIEB.id);render(true);subscribe();flushOutbox();
}
function subscribe(){
  if(CH)SB.removeChannel(CH);if(CH2)SB.removeChannel(CH2);
  const b=BETRIEB.id;
  CH=SB.channel('docs-'+b).on('postgres_changes',{event:'INSERT',schema:'public',table:'docs',filter:'betrieb_id=eq.'+b},onRow).on('postgres_changes',{event:'UPDATE',schema:'public',table:'docs',filter:'betrieb_id=eq.'+b},onRow).subscribe();
  CH2=SB.channel('docs-del-'+b).on('postgres_changes',{event:'DELETE',schema:'public',table:'docs'},p=>{const o=p.old||{};if(o.betrieb_id===b&&D[o.col]){delete D[o.col][o.id];saveCacheSoon();schedule()}}).subscribe();
}
function onRow(p){const r=p.new;if(!r||!D[r.col])return;if(OUTBOX.some(o=>o.col===r.col&&o.id===r.id))return;D[r.col][r.id]={...r.data,id:r.id};saveCacheSoon();schedule()}
function applyOutbox(){OUTBOX.filter(o=>BETRIEB&&o.b===BETRIEB.id).forEach(o=>{if(!D[o.col])return;if(o.op==='del')delete D[o.col][o.id];else D[o.col][o.id]={...o.data,id:o.id}})}
const isNet=e=>!navigator.onLine||/fetch|network|load failed|timeout/i.test((e&&e.message)||'');
let flushing=false;
async function flushOutbox(){
  if(flushing||!SB||!OUTBOX.length||!navigator.onLine)return;flushing=true;
  try{while(OUTBOX.length){const o=OUTBOX[0];const q=o.op==='del'?SB.from('docs').delete().match({betrieb_id:o.b,col:o.col,id:o.id}):SB.from('docs').upsert({betrieb_id:o.b,col:o.col,id:o.id,data:o.data});const {error}=await q;if(error&&isNet(error))break;if(error)toast('Ein offline erfasster Eintrag konnte nicht gespeichert werden.');OUTBOX.shift();ls.set('outbox',OUTBOX)}}
  finally{flushing=false;schedule()}
}
function queue(o){OUTBOX=OUTBOX.filter(x=>!(x.b===o.b&&x.col===o.col&&x.id===o.id));OUTBOX.push(o);ls.set('outbox',OUTBOX);schedule()}
window.addEventListener('online',()=>{flushOutbox();schedule()});window.addEventListener('offline',()=>schedule());
setInterval(flushOutbox,30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SB&&BETRIEB&&S.auth==='ready'&&Date.now()-LASTLOAD>60000){flushOutbox().then(()=>loadDocs()).then(schedule).catch(()=>{})}});
function writeErr(e){if(e&&(e.code==='42501'||/row-level security|permission/i.test(e.message||''))){CANWRITE=false;toast('Du hast für diesen Betrieb nur Leserechte.')}else toast('Speichern fehlgeschlagen: '+((e&&e.message)||'Fehler'));schedule()}
async function put(col,id,data){
  if(!CANWRITE){toast('Du hast für diesen Betrieb nur Leserechte.');return false}
  const body={...data};delete body.id;
  for(const k in body)if(body[k]===undefined)delete body[k];
  body.geaendert=new Date().toISOString();
  if(!body.von&&ME)body.von=ME.email;
  D[col][id]={...body,id};schedule();
  if(LOCAL){persistLocal();return true}
  saveCacheSoon();
  const o={op:'set',b:BETRIEB.id,col,id,data:body};
  if(!navigator.onLine||OUTBOX.length){queue(o);flushOutbox();return true}
  const {error}=await SB.from('docs').upsert({betrieb_id:o.b,col,id,data:body}).then(r=>r,e=>({error:e}));
  if(error){if(isNet(error)){queue(o);return true}writeErr(error);return false}
  return true;
}
async function del(col,id){
  if(!CANWRITE){toast('Du hast für diesen Betrieb nur Leserechte.');return}
  delete D[col][id];schedule();
  if(LOCAL){persistLocal();return}
  saveCacheSoon();
  const o={op:'del',b:BETRIEB.id,col,id};
  if(!navigator.onLine||OUTBOX.length){queue(o);flushOutbox();return}
  const {error}=await SB.from('docs').delete().match({betrieb_id:o.b,col,id}).then(r=>r,e=>({error:e}));
  if(error){if(isNet(error))queue(o);else writeErr(error)}
}
/* KI über die Supabase-Funktion "ki" */
function parseJSON(t){t=String(t||'').trim();const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw {code:'invalid_json'};try{return JSON.parse(t.slice(a,b+1))}catch(e){throw {code:'invalid_json'}}}
function toJpeg(file,m=1600,q=.85){return new Promise((ok,no)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);ok({media_type:'image/jpeg',data:c.toDataURL('image/jpeg',q).split(',')[1]})};img.onerror=()=>{URL.revokeObjectURL(u);no({code:'image_rejected'})};img.src=u})}
async function kiJson(prompt,opts={}){
  if(!navigator.onLine)throw {code:'offline'};
  const image=opts.images&&opts.images[0]?await toJpeg(opts.images[0]):null;
  const {data,error}=await SB.functions.invoke('ki',{body:{prompt,image,betrieb_id:BETRIEB.id}});
  if(error){let code='ki_error';try{const j=await error.context.json();code=j.error||code}catch(e){}throw {code}}
  if(data&&data.error)throw {code:data.error};
  return parseJSON(data&&data.text);
}
const L=col=>Object.values(D[col]);
const SET=()=>D.settings.main||{};

/* ---------- Rechenkern ---------- */
function curWJ(){
  if(S.wj)return S.wj;
  const all=L('anbau').map(a=>a.wj).filter(Boolean).sort();
  return all.length?all[all.length-1]:wjOf(todayISO());
}
function wjList(){const s=new Set([curWJ(),wjOf(todayISO()),...(SET().wjs||[])]);L('anbau').forEach(a=>a.wj&&s.add(a.wj));L('massnahmen').forEach(m=>m.wj&&s.add(m.wj));return [...s].sort().reverse()}
const anbauFor=(sid,wj)=>L('anbau').find(a=>a.schlag_id===sid&&a.wj===wj);
function pachtFor(sid,wj){const [a,b]=wjRange(wj);const l=L('pacht').filter(p=>p.schlag_id===sid&&(!p.beginn||p.beginn<=b)&&(!p.ende||p.ende>=a)).sort((x,y)=>(x.beginn||'').localeCompare(y.beginn||''));return l[l.length-1]||L('pacht').filter(p=>p.schlag_id===sid).pop()||null}
function priceAt(mi,date){if(!mi)return null;const p=(mi.preise||[]).slice().sort((a,b)=>(a.ab||'').localeCompare(b.ab||''));if(!p.length)return null;let r=p[0];for(const x of p)if(!date||(x.ab||'')<=date)r=x;return r}
const lastPrice=mi=>{const p=(mi.preise||[]).slice().sort((a,b)=>(a.ab||'').localeCompare(b.ab||''));return p[p.length-1]||null};
function massCost(m){
  const s=D.schlaege[m.schlag_id];const fl=n0(m.flaeche_ha)||n0(s&&s.flaeche_ha);
  const c={saatgut:0,duenger:0,psm:0,sonstiges:0,masch:0,fl};
  (m.mittel||[]).forEach(x=>{const k=x.kategorie||(D.mittel[x.mittel_id]||{}).kategorie||'sonstiges';c[k in c?k:'sonstiges']+=n0(x.menge_pro_ha)*n0(x.preis)*fl});
  (m.maschinen||[]).forEach(y=>{c.masch+=n0(y.menge)*n0(y.satz)});
  c.masch+=n0(m.lohn_eur);
  c.direkt=c.saatgut+c.duenger+c.psm+c.sonstiges;c.total=c.direkt+c.masch;c.perHa=fl?c.total/fl:0;
  return c;
}
function calc(sid,wj){
  const s=D.schlaege[sid]||{};const fl=n0(s.flaeche_ha);const a=anbauFor(sid,wj);
  const r={id:sid,name:s.name,fl,kultur:a?a.kultur:'',anbau:a,erloes:0,saatgut:0,duenger:0,psm:0,sonst:0,masch:0,pacht:0,ertrag:0,preis:0,ist:false,last:null};
  if(a){const ist=n0(a.ertrag_ist);r.ist=ist>0;r.ertrag=ist||n0(a.ertrag_plan);r.preis=n0(a.preis_eur_dt);r.erloes=(r.ertrag*r.preis+n0(a.sonstige_erloese))*fl}
  L('massnahmen').forEach(m=>{if(m.schlag_id!==sid||m.wj!==wj)return;const c=massCost(m);r.saatgut+=c.saatgut;r.duenger+=c.duenger;r.psm+=c.psm;r.sonst+=c.sonstiges;r.masch+=c.masch;if(m.status!=='geplant'&&(!r.last||m.datum>r.last.datum))r.last=m});
  L('sonstkosten').forEach(k=>{if(k.schlag_id===sid&&k.wj===wj)r.sonst+=n0(k.betrag)});
  const p=pachtFor(sid,wj);r.vertrag=p;
  r.pachtHa=s.besitz==='pacht'?n0(p&&p.preis_eur_ha):n0(SET().kalk_pacht);r.pacht=r.pachtHa*fl;
  r.direkt=r.saatgut+r.duenger+r.psm+r.sonst;r.db1=r.erloes-r.direkt;r.db2=r.db1-r.masch;r.np=r.db2-r.pacht;r.kosten=r.direkt+r.masch+r.pacht;
  const h=x=>fl?x/fl:0;r.ha={erloes:h(r.erloes),saatgut:h(r.saatgut),duenger:h(r.duenger),psm:h(r.psm),sonst:h(r.sonst),masch:h(r.masch),pacht:h(r.pacht),db1:h(r.db1),db2:h(r.db2),np:h(r.np),kosten:h(r.kosten)};
  return r;
}
function farm(wj){
  const rows=L('schlaege').map(s=>calc(s.id,wj));
  const t={fl:0,erloes:0,saatgut:0,duenger:0,psm:0,sonst:0,masch:0,pacht:0,n:rows.length,rows,anyIst:false};
  rows.forEach(r=>{for(const k of ['fl','erloes','saatgut','duenger','psm','sonst','masch','pacht'])t[k]+=r[k];if(r.ist)t.anyIst=true});
  L('sonstkosten').forEach(k=>{if(!k.schlag_id&&k.wj===wj)t.sonst+=n0(k.betrag)});
  t.direkt=t.saatgut+t.duenger+t.psm+t.sonst;t.db1=t.erloes-t.direkt;t.db2=t.db1-t.masch;t.np=t.db2-t.pacht;t.kosten=t.direkt+t.masch+t.pacht;
  return t;
}
function stallYear(y){
  const ys=String(y);
  const milch=L('milch').filter(m=>(m.monat||'').startsWith(ys)).sort((a,b)=>a.monat.localeCompare(b.monat));
  const geld=m=>n0(m.milchgeld_eur)||n0(m.menge_kg)*n0(m.preis_ct)/100;
  const dv=L('dv').filter(x=>(x.datum||'').startsWith(ys));const ko=L('stallkosten').filter(x=>(x.datum||'').startsWith(ys));
  const r={milch,dv,ko,geld:0,kg:0,dvSum:0,koSum:0,months:Array.from({length:12},()=>({geld:0,dv:0}))};
  let kuhTage=0,kgL=0;
  milch.forEach(m=>{const g=geld(m);r.geld+=g;r.kg+=n0(m.menge_kg);const i=+m.monat.slice(5,7)-1;r.months[i].geld+=g;if(n0(m.kuehe)){const days=new Date(+m.monat.slice(0,4),i+1,0).getDate();kuhTage+=n0(m.kuehe)*days;kgL+=n0(m.gemelk_kg)||n0(m.menge_kg)}});
  dv.forEach(x=>{r.dvSum+=n0(x.betrag);r.months[+x.datum.slice(5,7)-1].dv+=n0(x.betrag)});
  ko.forEach(x=>r.koSum+=n0(x.betrag));
  r.preis=r.kg?r.geld/r.kg*100:0;r.leistung=kuhTage?kgL/kuhTage:0;r.saldo=r.geld+r.dvSum-r.koSum;
  const lastM=milch[milch.length-1];r.kuehe=lastM?n0(lastM.kuehe):L('tiere').filter(t=>t.status==='laktierend').length;
  r.geldOf=geld;return r;
}

/* ---------- Rendering ---------- */
let rq=0;
function schedule(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;render()})}
const TABS=[['uebersicht','Übersicht'],['karte','Karte'],['massnahmen','Maßnahmen'],['stall','Stall'],['markt','Markt'],['betrieb','Betrieb']];
function go(v,opts={}){if(opts.push)S.stack.push({view:S.view,sel:S.sel});else S.stack=[];S.view=v;if(opts.sel!==undefined)S.sel=opts.sel;if(['uebersicht','karte','massnahmen','stall','markt','betrieb'].includes(v))ls.set('view',v);render(true)}
function back(){const p=S.stack.pop();if(p){S.view=p.view;S.sel=p.sel}else S.view='uebersicht';render(true)}
function render(reset){
  const main=$('#main');const ae=document.activeElement;const aid=ae&&main.contains(ae)?ae.id:null;const sel=aid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  const st=main.scrollTop;const authed=S.auth==='ready';
  const V=!authed?vAuth:({uebersicht:vUebersicht,karte:vKarte,massnahmen:vMassnahmen,stall:vStall,betrieb:vBetrieb,schlag:vSchlag,import:vImport,tier:vTier,markt:vMarkt}[S.view]||vUebersicht);
  main.innerHTML=V()+(authed&&!LOCAL&&(!navigator.onLine||OUTBOX.length)?`<div class="netbadge">${navigator.onLine?'Wird synchronisiert …':'Offline'}${OUTBOX.length?' · '+OUTBOX.length+' ungespeichert':''}</div>`:'');
  if(!reset)main.scrollTop=st;else main.scrollTop=0;
  if(aid){const el=document.getElementById(aid);if(el){el.focus({preventScroll:true});if(sel&&el.setSelectionRange)try{el.setSelectionRange(sel[0],sel[1])}catch(e){}}}
  const tabV=S.view==='schlag'?(S.stack[0]?.view||'karte'):S.view==='tier'?'stall':S.view==='import'?'uebersicht':S.view;
  $('#tabs').hidden=!authed;
  $('#tabs').innerHTML=TABS.map(([id,l])=>`<button data-act="tab" data-v="${id}" class="${tabV===id?'on':''}" aria-current="${tabV===id?'page':'false'}"><span class="ic">${svgI(I[id])}</span><span>${l}</span></button>`).join('');
  $('#fab').innerHTML=svgI(I.mic,26,2);$('#fab').hidden=!authed||(S.view==='karte'&&!!(S.sel||S.listOpen||S.draw||!L('schlaege').some(s=>s.geo)));
  const onMap=authed&&S.view==='karte';main.classList.toggle('overmap',onMap);$('#maplayer').hidden=!onMap;
  if(onMap)mountMap();else stopWatch();
  if($('#ibx'))drawInbox();
}
/* Anmeldung */
function vAuth(){
  const logo=`<div class="logo">${svgI(I.karte,32,2)}</div>`;
  if(S.auth==='loading')return `<div class="auth">${logo}<h1>Ackerschlagkartei</h1><div class="empty"><span class="spin"></span>Wird geladen …</div></div>`;
  if(S.auth==='error')return `<div class="auth">${logo}<h1>Verbindung fehlgeschlagen</h1><div class="banner">${esc(S.err||'Unbekannter Fehler')}</div><button class="btn pri" data-act="reload">Erneut versuchen</button><button class="btn ghost" data-act="logout">Abmelden</button></div>`;
  if(S.auth==='nobetrieb')return `<div class="auth">${logo}<h1>Willkommen</h1><div class="muted" style="font-size:15px;line-height:1.5">Angemeldet als <b>${esc(ME&&ME.email)}</b>. Für diese E-Mail ist noch kein Betrieb freigegeben.</div>
   <div class="card"><h2>Neuen Betrieb anlegen</h2>${F('nb-name','Name des Betriebs','',{ph:'z. B. Hof Krennerich'})}<button class="btn pri" data-act="newBetrieb">Betrieb anlegen</button></div>
   <div class="note box">Wurdest du eingeladen? Dann bitte den Betriebsleiter, genau diese E-Mail-Adresse in der App unter Betrieb → Mehr → Team einzutragen, und tippe danach auf „Erneut prüfen“.</div>
   <button class="btn sec" data-act="reload">Erneut prüfen</button><button class="btn ghost" data-act="logout">Mit anderer E-Mail anmelden</button></div>`;
  if(S.auth==='recovery')return `<div class="auth">${logo}<h1>Neues Passwort</h1><div class="muted" style="font-size:15px;line-height:1.5">Lege ein neues Passwort für <b>${esc(ME&&ME.email||'')}</b> fest.</div>
   <label class="fld"><span>Neues Passwort</span><input id="au-pw" type="password" autocomplete="new-password" placeholder="mindestens 8 Zeichen"></label><button class="btn pri" data-act="setPw">Passwort speichern</button></div>`;
  if(S.auth==='checkmail')return `<div class="auth">${logo}<h1>E-Mail bestätigen</h1><div class="muted" style="font-size:15px;line-height:1.5">Wir haben dir eine E-Mail an <b>${esc(S.email)}</b> geschickt. Tippe auf den Link darin – danach bist du angemeldet. Kommt nichts an, schau im Spam-Ordner nach.</div>
   <div class="note box">Tipp fürs iPhone: Nach der Bestätigung die App in Safari einmal öffnen, dann über Teilen → „Zum Home-Bildschirm“ hinzufügen und dort mit E-Mail und Passwort anmelden.</div><button class="btn sec" data-act="authBack">Zurück zur Anmeldung</button></div>`;
  const inv=S.inviteInfo;const reg=S.authMode==='register'&&(inv&&inv.gueltig||S.setup),fg=S.authMode==='forgot';
  const invBox=inv?(inv.gueltig?`<div class="banner" style="background:var(--pri-l);color:var(--pri)">Einladung zu <b>${esc(inv.betrieb||'')}</b>${inv.email?' für '+esc(inv.email):''}. Erstelle ein Konto oder melde dich an.</div>`:'<div class="banner">Dieser Einladungslink ist ungültig, abgelaufen oder wurde schon benutzt.</div>'):'';
  return `<div class="auth">${logo}<h1>${reg?'Konto erstellen':fg?'Passwort vergessen':'Anmelden'}</h1>${invBox}<div class="muted" style="font-size:15px;line-height:1.5">${reg?'Wähle ein Passwort. Danach bekommst du einen Bestätigungslink per E-Mail.':fg?'Du bekommst einen Link, mit dem du ein neues Passwort festlegst.':'Ackerschlagkartei – melde dich mit E-Mail und Passwort an.'}</div>
   <label class="fld"><span>E-Mail</span><input id="au-mail" type="email" autocomplete="email" inputmode="email" value="${esc(S.email)}" placeholder="name@beispiel.de"></label>
   ${fg?'':`<label class="fld"><span>Passwort</span><input id="au-pw" type="password" autocomplete="${reg?'new-password':'current-password'}" placeholder="${reg?'mindestens 8 Zeichen':''}"></label>`}
   <button class="btn pri" data-act="${reg?'signUp':fg?'forgotPw':'signIn'}">${reg?'Konto erstellen':fg?'Link senden':'Anmelden'}</button>
   ${reg||fg?'<button class="btn ghost" data-act="authMode" data-m="login">Ich habe schon ein Konto</button>':`${inv&&inv.gueltig||S.setup?'<button class="btn sec" data-act="authMode" data-m="register">Neu hier? Konto erstellen</button>':''}<button class="btn ghost" data-act="authMode" data-m="forgot">Passwort vergessen?</button>${inv&&inv.gueltig?'':'<div class="note box">Ein neues Konto gibt es nur mit einem <b>Einladungslink</b> von der Betriebsleitung.</div>'}`}</div>`;
}
const appUrl=()=>location.origin+location.pathname;
const authMail=()=>{const em=val('au-mail').toLowerCase();if(!/^\S+@\S+\.\S+$/.test(em)){toast('Bitte eine gültige E-Mail-Adresse eingeben.');return null}S.email=em;ls.set('email',em);return em};
const authErr=e=>{const box=document.querySelector('.auth');if(box){let el=document.getElementById('au-err');if(!el){box.insertAdjacentHTML('beforeend','<div id="au-err" class="banner" style="user-select:text"></div>');el=document.getElementById('au-err')}el.textContent='Meldung von Supabase: '+(e.message||e)+(e.status?' (Status '+e.status+')':'')+(e.code?' ['+e.code+']':'')}authErrToast(e)};
const authErrToast=e=>/einladungslink|freigeschaltet/i.test(e.message)?toast(e.message,8000):toast(/invalid login/i.test(e.message)?'E-Mail oder Passwort stimmt nicht.':/not confirmed/i.test(e.message)?'Bitte zuerst den Link in der Bestätigungs-E-Mail antippen.':/already registered/i.test(e.message)?'Für diese E-Mail gibt es schon ein Konto – bitte anmelden.':/rate|limit|security purposes/i.test(e.message)?'Supabase verschickt gerade keine Mails mehr (Limit erreicht). Bitte später nochmal – oder die E-Mail-Bestätigung abschalten (siehe Anleitung).':/password/i.test(e.message)?'Das Passwort ist zu kurz oder zu einfach (mindestens 8 Zeichen).':'Fehler: '+e.message,5000);
async function signIn(){const em=authMail();if(!em)return;const pw=val('au-pw');if(!pw)return toast('Bitte das Passwort eingeben.');const {error}=await SB.auth.signInWithPassword({email:em,password:pw});if(error)authErr(error)}
async function signUp(){const ae=document.getElementById('au-err');if(ae)ae.remove();const em=authMail();if(!em)return;const pw=val('au-pw');if(pw.length<8)return toast('Das Passwort braucht mindestens 8 Zeichen.');const {data,error}=await SB.auth.signUp({email:em,password:pw,options:{emailRedirectTo:appUrl(),data:S.invite?{einladung:S.invite}:{}}});if(error)return authErr(error);if(data&&data.session)return;if(data&&data.user&&data.user.identities&&!data.user.identities.length)return toast('Für diese E-Mail gibt es schon ein Konto – bitte anmelden.',5000);S.auth='checkmail';render(true)}
async function forgotPw(){const em=authMail();if(!em)return;const {error}=await SB.auth.resetPasswordForEmail(em,{redirectTo:appUrl()});if(error)return authErr(error);toast('Link verschickt – bitte E-Mail öffnen.',5000)}
async function setPw(){const pw=val('au-pw');if(pw.length<8)return toast('Das Passwort braucht mindestens 8 Zeichen.');const {error}=await SB.auth.updateUser({password:pw});if(error)return authErr(error);toast('Passwort gespeichert');const {data}=await SB.auth.getSession();if(data.session){ME=null;afterLogin(data.session)}}
async function newBetrieb(d,b){const n=val('nb-name');if(!n)return toast('Bitte einen Namen eingeben.');if(b)b.disabled=true;try{const id=(crypto.randomUUID?crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)));const {data:u}=await SB.auth.getUser();const {error}=await SB.from('betriebe').insert({id,name:n,owner:u&&u.user?u.user.id:undefined});if(error){S.err='Betrieb anlegen fehlgeschlagen: '+(error.message||'')+(error.code?' (Code '+error.code+')':'')+(error.details?' – '+error.details:'')+(error.hint?' – '+error.hint:'');toast(S.err,15000);const nb=document.querySelector('.auth .card');if(nb&&!document.getElementById('nb-err'))nb.insertAdjacentHTML('beforeend','<div id="nb-err" class="banner" style="user-select:text"></div>');const e=document.getElementById('nb-err');if(e)e.textContent=S.err;return}ls.set('betrieb',id);await afterLogin((await SB.auth.getSession()).data.session);if(BETRIEB)await put('settings','main',{name:n,kalk_pacht:0})}catch(e){toast('Betrieb anlegen fehlgeschlagen: '+(e&&e.message||e),15000)}finally{if(b&&b.isConnected)b.disabled=false}}
function wjSelect(){return `<select id="wjsel" class="inp" style="height:30px;width:auto;padding:0 8px;font-size:13px;border-radius:8px" aria-label="Wirtschaftsjahr">${wjList().map(w=>`<option${w===curWJ()?' selected':''}>${w}</option>`).join('')}<option value="__neu">＋ Wirtschaftsjahr hinzufügen …</option></select>`}
function wjAdd(){const have=new Set(wjList());const y=new Date().getFullYear();const opts=[];for(let i=y+3;i>=y-10;i--){const w=wjLabel(i);if(!have.has(w))opts.push(w)}
  openSheet({title:'Wirtschaftsjahr hinzufügen',body:`<div class="note">Ein Wirtschaftsjahr läuft vom 1. Juli bis 30. Juni (z. B. 2026/27 = Anbau für die Ernte 2027).</div>${F('wj-neu','Wirtschaftsjahr',opts.find(w=>parseInt(w)===y)||opts[0],{type:'select',opts})}<div class="note">Für das neue Jahr kannst du danach je Schlag die Kultur festlegen (Schlag öffnen → Kultur / Sorte). Pachtverträge und Schläge gelten automatisch weiter.</div>`,
   saveLabel:'Hinzufügen',save:async()=>{const w=val('wj-neu');await put('settings','main',{...SET(),wjs:[...new Set([...(SET().wjs||[]),w])]});S.wj=w;ls.set('wj',w);toast('Wirtschaftsjahr '+w+' hinzugefügt');render()}})}
const betriebName=()=>SET().name||(BETRIEB&&BETRIEB.name)||'Mein Betrieb';
function banners(){let b='';if(LOCAL)b+=`<div class="banner">Demo-Modus: Die App ist noch nicht mit der Datenbank verbunden (config.js). Daten bleiben nur in diesem Browser.</div>`;else if(!CANWRITE)b+=`<div class="banner">Du kannst die Daten ansehen, aber nicht bearbeiten.</div>`;if(L('schlaege').some(s=>s.demo)||L('maschinen').some(s=>s.demo))b+=`<div class="banner" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span>Es sind noch Beispieldaten enthalten.</span><button class="btn sm sec" data-act="demoDel">Entfernen</button></div>`;return b}
function loading(){return `<div class="empty"><span class="spin"></span>Daten werden geladen …</div>`}

/* Übersicht */
function vUebersicht(){
  const wj=curWJ();const t=farm(wj);
  const head=`<div class="head"><div><div class="eyebrow">${esc(betriebName())} · WJ ${wjSelect()}</div><h1>Übersicht</h1></div><div style="display:flex;gap:8px"><button class="icon-btn" data-act="pdfDialog" aria-label="Auswertung als PDF" title="Auswertung als PDF">${svgI('M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',20,2)}</button><button class="icon-btn" data-act="go" data-v="import" aria-label="Daten importieren">${svgI(I.dl,20,2)}</button></div></div>`;
  if(!READY)return `<div class="page">${head}${loading()}</div>`;
  if(!t.n)return `<div class="page">${head}${banners()}<div class="card empty"><b>Noch keine Schläge angelegt</b>Importiere deine Flächen aus FIONA oder der Ackerschlagkartei – oder lege den ersten Schlag von Hand an.<div class="as-actions" style="justify-content:center"><button class="btn pri" data-act="go" data-v="import">Daten importieren</button><button class="btn sec" data-act="schlagForm">Schlag anlegen</button></div></div>${stallCard()}</div>`;
  const costs=[['Pacht',t.pacht,'var(--c-pacht)'],['Maschinen & Lohn',t.masch,'var(--c-masch)'],['Dünger',t.duenger,'var(--c-dueng)'],['Pflanzenschutz',t.psm,'var(--c-psm)'],['Saatgut',t.saatgut,'var(--c-saat)'],['Sonstiges',t.sonst,'var(--c-sonst)']];
  const tot=t.kosten||1;
  const byK={};t.rows.forEach(r=>{const k=r.kultur||'Ohne Kultur';(byK[k]||(byK[k]={k,fl:0,np:0}));byK[k].fl+=r.fl;byK[k].np+=r.np});
  const crops=Object.values(byK).map(c=>({...c,ha:c.fl?c.np/c.fl:0})).sort((a,b)=>b.ha-a.ha);const best=Math.max(1,...crops.map(c=>c.ha));
  const weak=t.rows.filter(r=>r.fl).sort((a,b)=>a.ha.np-b.ha.np).slice(0,3);
  const avg=t.fl?t.np/t.fl:0;
  const recent=L('massnahmen').filter(m=>m.status!=='geplant').sort((a,b)=>(b.datum||'').localeCompare(a.datum||'')).slice(0,3);
  return `<div class="page">${head}${banners()}${inboxCard()}
  <div class="hero"><div class="l">Deckungsbeitrag nach Pacht</div><div class="v">${eur(t.np)}</div><div class="s">Ø ${eur(avg)}/ha · ${fha(t.fl)} · ${t.n} Schläge</div>
   <div class="steps"><span>DB I <b>${eur(t.fl?t.db1/t.fl:0)}/ha</b></span><span>DB II <b>${eur(t.fl?t.db2/t.fl:0)}/ha</b></span></div></div>
  <div class="grid2">
   <div class="tile"><span class="l">Kosten gesamt</span><span class="v num">${eur(t.kosten)}</span><span class="s">${eur(t.fl?t.kosten/t.fl:0)}/ha</span></div>
   <div class="tile"><span class="l">Erlöse (${t.anyIst?'Ist/Plan':'Plan'})</span><span class="v num">${eur(t.erloes)}</span><span class="s">${eur(t.fl?t.erloes/t.fl:0)}/ha</span></div>
  </div>
  <div class="card"><div class="card-h"><h2>Kostenstruktur</h2><small>€ im WJ ${esc(wj)}</small></div>
   <div class="bar" role="img" aria-label="Kostenanteile">${costs.filter(c=>c[1]>0).map(c=>`<div style="width:${(c[1]/tot*100).toFixed(1)}%;background:${c[2]}"></div>`).join('')}</div>
   <div class="legend">${costs.map(c=>`<div><span class="sw" style="background:${c[2]}"></span><span class="lab">${c[0]}</span><span class="num" style="font-size:13px">${eur(c[1])}</span><span class="pct">${Math.round(c[1]/tot*100)} %</span></div>`).join('')}</div>
  </div>
  <div class="card"><div class="card-h"><h2>Deckungsbeitrag je Kultur</h2><small>nach Pacht, €/ha</small></div>
   ${crops.map(c=>`<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:14px"><span style="font-weight:600">${esc(c.k)} <span class="muted" style="font-weight:400">· ${nf(c.fl,1)} ha</span></span><span class="num ${c.ha<0?'warn':''}" style="font-size:13px">${eur(c.ha)}/ha</span></div><div class="meter"><i style="width:${Math.max(0,c.ha/best*100).toFixed(1)}%"></i></div></div>`).join('')}
  </div>
  <div class="card"><h2>Schwächste Schläge</h2><div class="rows">
   ${weak.map(r=>`<button class="row" data-act="schlag" data-id="${r.id}"><div class="main"><span class="t">${esc(r.name)}</span><span class="sub">${esc(r.kultur||'ohne Kultur')} · ${nf(r.fl,1)} ha · ${D.schlaege[r.id].besitz==='pacht'?'Pacht '+eur(r.pachtHa)+'/ha':'Eigentum'}</span></div><span class="r warn">${eur(r.ha.np)}/ha</span></button>`).join('')}</div></div>
  ${stallCard()}
  ${recent.length?`<div class="card"><div class="card-h"><h2>Zuletzt erledigt</h2><button class="btn ghost sm" data-act="tab" data-v="massnahmen">Alle</button></div><div class="rows">${recent.map(m=>`<button class="row" data-act="massEdit" data-id="${m.id}"><span class="dot" style="background:${TYP[m.typ]?.[1]||'var(--c-sonst)'}"></span><div class="main"><span class="t">${esc(m.titel||TYP[m.typ]?.[0])}</span><span class="sub">${fmtD(m.datum)} · ${esc(D.schlaege[m.schlag_id]?.name||'?')}</span></div><span class="r">${eur(massCost(m).total)}</span></button>`).join('')}</div></div>`:''}
  </div>`;
}
function stallCard(){
  const y=new Date().getFullYear();const r=stallYear(y);
  if(!r.milch.length&&!r.dv.length&&!r.ko.length)return `<button class="card" data-act="tab" data-v="stall" style="text-align:left;cursor:pointer"><div class="card-h"><h2>Stall</h2><small>${y}</small></div><span class="muted" style="font-size:14px">Noch keine Milchdaten. Milchgeld, Direktvermarktung und Stallkosten im Reiter „Stall“ erfassen.</span></button>`;
  return `<button class="card" data-act="tab" data-v="stall" style="text-align:left;cursor:pointer;color:var(--fg)"><div class="card-h"><h2>Stall ${y}</h2><small>bis ${r.milch.length?MON[+r.milch[r.milch.length-1].monat.slice(5)-1]:'heute'}</small></div>
   <div class="grid3"><div class="tile soft"><span class="l">Molkerei</span><span class="num">${eur(r.geld)}</span></div><div class="tile soft"><span class="l">Direktverm.</span><span class="num">${eur(r.dvSum)}</span></div><div class="tile soft"><span class="l">Saldo</span><span class="num">${eur(r.saldo)}</span></div></div>
   <span class="muted" style="font-size:12px">Ø ${nf(r.preis,1)} ct/kg · ${nf(r.leistung,1)} kg/Kuh/Tag · Stallkosten ${eur(r.koSum)}</span></button>`;
}

/* Karte */
const geoCache=new Map();
function geomOf(s){if(!s.geo)return null;if(geoCache.has(s.geo))return geoCache.get(s.geo);let g=null;try{g=JSON.parse(s.geo)}catch(e){}geoCache.set(s.geo,g);return g}
const polysOf=g=>!g?[]:g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
function vKarte(){
  const wj=curWJ();const all=L('schlaege');
  const ks=[...new Set(all.map(s=>kShort(anbauFor(s.id,wj)?.kultur)).filter(Boolean))].sort();
  const q=S.mapQ.toLowerCase();
  const vis=all.filter(s=>(S.mapK==='Alle'||kShort(anbauFor(s.id,wj)?.kultur)===S.mapK)&&(!q||(s.name||'').toLowerCase().includes(q)||(s.flurstueck||'').toLowerCase().includes(q)||(s.gemarkung||'').toLowerCase().includes(q)));
  const withG=vis.filter(s=>geomOf(s));const noG=vis.filter(s=>!geomOf(s));
  const sel=S.sel&&D.schlaege[S.sel]?S.sel:null;
  let sheet;
  if(S.draw){const ds=D.schlaege[S.draw.sid];const ha=drawHa();sheet=`<div class="bsheet"><div class="grab"></div><h2>Grenze zeichnen: ${esc(ds?ds.name:'')}</h2><span class="note">Tippe nacheinander die Ecken des Schlags auf der Karte an. Punkte lassen sich danach verschieben.</span><span class="num" style="font-size:14px">${S.draw.n||0} Punkte${ha?' · '+fha(ha):''}</span><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sec sm" data-act="drawUndo">Letzten Punkt löschen</button><button class="btn ghost sm" data-act="drawCancel">Abbrechen</button><button class="btn pri sm" style="flex:1" data-act="drawSave" ${(S.draw.n||0)<3?'disabled':''}>Grenze speichern</button></div></div>`}
  else if(sel){const s=D.schlaege[sel];const r=calc(sel,wj);sheet=`<div class="bsheet"><div class="grab"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><h1 style="font-size:20px">${esc(s.name)}</h1><span class="muted" style="font-size:13px">${fha(r.fl)} · ${esc(r.kultur||'ohne Kultur')} · ${s.besitz==='pacht'?'Pachtfläche':'Eigentum'}</span></div><span class="badge ${r.ha.np<0?'warn':''}">DB ${eur(r.ha.np)}/ha</span></div>
    <div class="grid3"><div class="tile soft"><span class="l">Pacht</span><span class="num" style="font-size:14px">${s.besitz==='pacht'?eur(r.pachtHa)+'/ha':'—'}</span></div><div class="tile soft"><span class="l">Kosten</span><span class="num" style="font-size:14px">${eur(r.ha.kosten)}/ha</span></div><div class="tile soft"><span class="l">Letzte</span><span style="font-size:14px;font-weight:600">${r.last?esc(TYP[r.last.typ]?.[0]||r.last.titel)+' '+fmtD(r.last.datum).slice(0,6):'—'}</span></div></div>
    <div style="display:flex;gap:8px"><button class="btn sec" data-act="selClear" style="flex:0 0 auto">Schließen</button><button class="btn pri" style="flex:1" data-act="schlag" data-id="${sel}">Schlagkartei öffnen</button></div></div>`}
  else if(S.listOpen||!withG.length){sheet=`<div class="bsheet"><div class="grab"></div><div class="card-h"><h2>${withG.length?'Schläge':'Noch keine Schlaggrenzen'}</h2>${withG.length?`<button class="btn ghost sm" data-act="listToggle">Zur Karte</button>`:`<button class="btn ghost sm" data-act="go" data-v="import">Grenzen importieren</button>`}</div>${!withG.length?`<span class="note">Importiere den Shape-Export aus FIONA oder eine GeoJSON/KML-Datei – oder öffne einen Schlag und zeichne die Grenze direkt auf der Karte.</span>`:''}<div class="flist">${vis.map(s=>{const r=calc(s.id,wj);return `<button class="row" data-act="schlag" data-id="${s.id}"><span class="dot" style="background:${kColor(r.kultur)}"></span><div class="main"><span class="t">${esc(s.name)}</span><span class="sub">${fha(r.fl)} · ${esc(r.kultur||'ohne Kultur')}${geomOf(s)?'':' · ohne Grenze'}</span></div><span class="r ${r.ha.np<0?'warn':''}">${eur(r.ha.np)}/ha</span></button>`}).join('')||'<div class="empty">Keine Schläge gefunden.</div>'}</div></div>`}
  else sheet=`<div class="bsheet" style="padding-bottom:14px;padding-right:96px"><div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="muted" style="font-size:13px">${withG.length} Schläge auf der Karte${noG.length?` · ${noG.length} ohne Grenze`:''} · Schlag antippen</span><button class="btn ghost sm" data-act="listToggle">Liste</button></div></div>`;
  return `<div class="page full"><div class="map-wrap">
   <div class="map-top"><label class="search" for="mapq">${svgI(I.search,18,2)}<input id="mapq" type="search" placeholder="Schlag, Flurstück suchen" value="${esc(S.mapQ)}" autocomplete="off"></label>
    <div class="chips">${['Alle',...ks].map(k=>`<button class="chip ${S.mapK===k?'on':''}" data-act="mapK" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>
   ${withG.length||gmOK()?`<div class="map-ctl"><button data-act="zoom" data-z="0.7" aria-label="Hineinzoomen">+</button><button data-act="zoom" data-z="1.4" aria-label="Herauszoomen">−</button><button data-act="fit" aria-label="Alle Schläge zeigen" style="font-size:12px">Alle</button><button data-act="layers" aria-label="Kartenebenen">${svgI('m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5',20,2)}</button><button data-act="locate" aria-label="Mein Standort" style="font-size:12px">${svgI('M12 2v3M12 19v3M2 12h3M19 12h3M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',20,2)}</button></div>`:''}
   ${sheet}</div></div>`;
}
let MAP={vb:null,key:'',gkey:''};
const LF=()=>window.L;
const gmOK=()=>!!(window.L&&window.L.map&&!S.gmFail);
function layersSheet(){openSheet({title:'Kartenebenen',body:`<div class="lines">${Object.entries(BASES).map(([k,b])=>`<button class="src-btn ${(S.base||ls.get('base','dop'))===k?'on':''}" data-act="base" data-k="${k}"><span style="flex:1;font-weight:700">${b.name}</span><span class="muted" style="font-size:12px">${{dop:'LGL Baden-Württemberg, 20 cm',sat:'weltweit, Esri',osm:'OpenStreetMap'}[k]}</span></button>`).join('')}</div><label style="display:flex;gap:10px;align-items:center;font-size:15px;font-weight:600;min-height:44px"><input type="checkbox" id="flurcb" ${S.flur??ls.get('flur',false)?'checked':''} style="width:22px;height:22px" data-act="flur"> Flurstücke mit Nummern einblenden</label><div class="note">Flurstücke erscheinen ab Zoomstufe 15 (nah heranzoomen). Luftbilder und Flurstücke: © LGL-BW, Datenlizenz Deutschland – Namensnennung 2.0.</div>`})}
let LMAP=null,LPOLY={},LDRAW=null,LDRAWM=[],LME=null,LBASE=null,LFLUR=null;
const BASES={
  dop:{name:'Luftbild BW',make:()=>LF().tileLayer.wms('https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ATKIS_DOP_20_C?',{layers:'IMAGES_DOP_20_RGB',format:'image/jpeg',version:'1.3.0',maxZoom:21,attribution:'Luftbild © LGL-BW ('+new Date().getFullYear()+') dl-de/by-2-0'})},
  sat:{name:'Satellit',make:()=>LF().tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20,maxNativeZoom:19,attribution:'Bild © Esri, Maxar, Earthstar Geographics'})},
  osm:{name:'Karte',make:()=>LF().tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,maxNativeZoom:19,attribution:'© OpenStreetMap-Mitwirkende'})}
};
function setBase(k){if(!LMAP)return;S.base=k;ls.set('base',k);if(LBASE)LMAP.removeLayer(LBASE);LBASE=BASES[k].make().addTo(LMAP);LBASE.bringToBack()}
function setFlur(on){S.flur=on;ls.set('flur',on);if(!LMAP)return;if(on&&!LFLUR)LFLUR=LF().tileLayer.wms('https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ALKIS_Basis_transparent?',{layers:'nora:ALKIS_Basis_transparent,nora:ALKIS_Basis_Beschriftung_transparent',format:'image/png',transparent:true,version:'1.3.0',maxZoom:21,minZoom:15,attribution:'Flurstücke © LGL-BW dl-de/by-2-0'});if(on)LFLUR.addTo(LMAP);else if(LFLUR)LMAP.removeLayer(LFLUR)}
function mountMap(){if(gmOK()){drawLeaflet();startWatch()}else drawSvgMap()}
let WATCH=null,MYPOS=null;
function setMe(ll){MYPOS=ll;if(!LMAP)return;if(LME)LME.setLatLng(ll);else LME=LF().circleMarker(ll,{radius:8,color:'#FFFFFF',weight:3,fillColor:'#1A73E8',fillOpacity:1,interactive:false}).addTo(LMAP)}
function startWatch(){if(WATCH!=null||!navigator.geolocation)return;let first=true;WATCH=navigator.geolocation.watchPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];setMe(ll);if(first){first=false;if(LMAP&&!L('schlaege').some(x=>x.geo)&&!S.draw)LMAP.setView(ll,16)}},()=>{navigator.geolocation.clearWatch(WATCH);WATCH=-1},{enableHighAccuracy:true,maximumAge:15000,timeout:20000})}
function stopWatch(){if(WATCH!=null&&WATCH>=0)navigator.geolocation.clearWatch(WATCH);if(WATCH!==-1)WATCH=null}
function mapFilter(){const wj=curWJ();const q=S.mapQ.toLowerCase();return s=>(S.mapK==='Alle'||kShort(anbauFor(s.id,wj)?.kultur)===S.mapK)&&(!q||(s.name||'').toLowerCase().includes(q)||(s.flurstueck||'').toLowerCase().includes(q))}
function drawLeaflet(){
  const layer=$('#maplayer');if(layer.hidden)return;const Lf=LF();
  if(!LMAP||!document.getElementById('lmap')){layer.innerHTML='<div id="lmap" style="position:absolute;inset:0"></div>';LPOLY={};LDRAW=null;LDRAWM=[];MAP.gkey='';
    LMAP=Lf.map('lmap',{zoomControl:false,attributionControl:true,maxZoom:21}).setView(CFG.mapCenter?[CFG.mapCenter.lat,CFG.mapCenter.lng]:[48.7,9.6],CFG.mapCenter?14:8);
    LMAP.attributionControl.setPrefix('');setBase(S.base||ls.get('base','dop'));setFlur(S.flur??ls.get('flur',false));
    LMAP.on('click',e=>{if(S.draw){addDrawPoint(e.latlng);return}if(S.sel){S.sel=null;render()}});
    LME=null;if(MYPOS)setMe(MYPOS);
    setTimeout(()=>LMAP&&LMAP.invalidateSize(),50)}
  else LMAP.invalidateSize();
  const wj=curWJ();const f=mapFilter();const seen=new Set();let bounds=null;
  L('schlaege').forEach(s=>{const g=geomOf(s);if(!g)return;const vis=f(s)&&!(S.draw&&S.draw.sid===s.id);const on=S.sel===s.id;const col=kColor(anbauFor(s.id,wj)?.kultur);
    const ll=polysOf(g).map(poly=>poly.map(r=>r.map(c=>[c[1],c[0]])));
    const st={color:on?'#FFD24A':'#FFFFFF',weight:on?4:2,fillColor:on?'#F2D33B':col,fillOpacity:on?.5:.4,interactive:!S.draw};
    let pg=LPOLY[s.id];
    if(!pg){pg=Lf.polygon(ll,st);pg.on('click',e=>{Lf.DomEvent.stopPropagation(e);if(S.draw)return;S.sel=s.id;S.listOpen=false;render()});pg.bindTooltip(esc(s.name||''),{permanent:true,direction:'center',className:'flabel'});LPOLY[s.id]=pg}
    else{pg.setLatLngs(ll);pg.setStyle(st);pg.setTooltipContent(esc(s.name||''))}
    if(vis){if(!LMAP.hasLayer(pg))pg.addTo(LMAP);const b=pg.getBounds();bounds=bounds?bounds.extend(b):Lf.latLngBounds(b.getSouthWest(),b.getNorthEast())}else if(LMAP.hasLayer(pg))LMAP.removeLayer(pg);
    seen.add(s.id)});
  Object.keys(LPOLY).forEach(id=>{if(!seen.has(id)){LMAP.removeLayer(LPOLY[id]);delete LPOLY[id]}});
  const key=L('schlaege').filter(f).map(s=>s.id).join(',');
  if(MAP.gkey!==key&&!S.draw){MAP.gkey=key;if(bounds)LMAP.fitBounds(bounds,{paddingTopLeft:[20,140],paddingBottomRight:[20,160],maxZoom:17})}
  if(S.draw&&!LDRAW){LDRAW=Lf.polygon([],{color:'#FFD24A',weight:3,fillColor:'#F2D33B',fillOpacity:.3,interactive:false}).addTo(LMAP);(S.draw.pts||[]).forEach(p=>addDrawPoint(Lf.latLng(p.lat,p.lng),true));
    if(S.draw.pts&&S.draw.pts.length)LMAP.fitBounds(LDRAW.getBounds(),{padding:[60,60]});else{const others=Object.values(LPOLY).filter(p=>LMAP.hasLayer(p));if(others.length&&bounds)LMAP.fitBounds(bounds,{maxZoom:16})}}
  if(!S.draw&&LDRAW){LMAP.removeLayer(LDRAW);LDRAWM.forEach(m=>LMAP.removeLayer(m));LDRAW=null;LDRAWM=[]}
}
function drawUpdate(){if(!LDRAW)return;LDRAW.setLatLngs(LDRAWM.map(m=>m.getLatLng()));S.draw.n=LDRAWM.length;const hs=document.querySelector('.bsheet .num');if(hs)hs.textContent=S.draw.n+' Punkte'+(drawHa()?' · '+fha(drawHa()):'');const sb=document.querySelector('[data-act=drawSave]');if(sb)sb.disabled=S.draw.n<3}
function addDrawPoint(ll,silent){const Lf=LF();const m=Lf.marker(ll,{draggable:true,icon:Lf.divIcon({className:'vtx',iconSize:[18,18]})}).addTo(LMAP);m.on('drag',drawUpdate);LDRAWM.push(m);drawUpdate()}
function drawUndo(){const m=LDRAWM.pop();if(m)LMAP.removeLayer(m);drawUpdate()}
function drawCoords(){return LDRAWM.map(m=>{const p=m.getLatLng();return [+p.lng.toFixed(7),+p.lat.toFixed(7)]})}
function drawHa(){const c=drawCoords();if(c.length<3)return 0;return ringArea([...c,c[0]])/1e4}
function startDraw(sid){if(!gmOK())return toast('Die Karte konnte nicht geladen werden – bitte Internetverbindung prüfen.');const g=geomOf(D.schlaege[sid]||{});S.draw={sid,pts:g?polysOf(g)[0][0].slice(0,-1).map(c=>({lat:c[1],lng:c[0]})):[],n:0};S.sel=null;S.stack=[];S.view='karte';LDRAW=null;LDRAWM=[];render(true)}
async function drawSave(){const c=drawCoords();if(c.length<3)return;const s=D.schlaege[S.draw.sid];const ha=+(ringArea([...c,c[0]])/1e4).toFixed(4);const geo=JSON.stringify({type:'Polygon',coordinates:[[...c,c[0]]]});const upd={...s,geo};if(!n0(s.flaeche_ha))upd.flaeche_ha=ha;await put('schlaege',s.id,upd);toast('Grenze gespeichert · '+fha(ha)+(n0(s.flaeche_ha)?' (Fläche im Schlag unverändert)':''));const sid=S.draw.sid;S.draw=null;MAP.gkey='';S.sel=sid;render()}
function locate(){if(!navigator.geolocation)return toast('Standort ist auf diesem Gerät nicht verfügbar.');navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];if(LMAP){LMAP.setView(ll,Math.max(LMAP.getZoom(),16));setMe(ll)}const s=schlagAt(ll[1],ll[0]);toast(s?'Du stehst auf: '+s.name:'Kein Schlag an deinem Standort.')},()=>toast('Standort nicht freigegeben.'),{enableHighAccuracy:true,timeout:10000})}
function inRing(x,y,r){let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,yi]=r[i],[xj,yj]=r[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins}
function schlagAt(x,y){return L('schlaege').find(s=>{const g=geomOf(s);return g&&polysOf(g).some(p=>inRing(x,y,p[0])&&!p.slice(1).some(h=>inRing(x,y,h)))})}
function zoomMap(f){if(LMAP&&gmOK()){f<1?LMAP.zoomIn():LMAP.zoomOut();return}const svg=$('#mapsvg');if(!svg||!MAP.vb)return;const [x,y,w,h]=MAP.vb;const cx=x+w/2,cy=y+h/2;MAP.vb=[cx-w*f/2,cy-h*f/2,w*f,h*f];svg.setAttribute('viewBox',MAP.vb.join(' '));svg.querySelectorAll('text').forEach(t=>{t.setAttribute('font-size',MAP.vb[2]/52);t.setAttribute('stroke-width',MAP.vb[2]/430)})}
function drawSvgMap(){
  const layer=$('#maplayer');let svg=$('#mapsvg');if(!svg){layer.innerHTML='<svg id="mapsvg" role="img" aria-label="Karte der Schläge"></svg>';svg=$('#mapsvg')}const wj=curWJ();const q=S.mapQ.toLowerCase();
  const items=L('schlaege').filter(s=>geomOf(s)).filter(s=>(S.mapK==='Alle'||kShort(anbauFor(s.id,wj)?.kultur)===S.mapK)&&(!q||(s.name||'').toLowerCase().includes(q)||(s.flurstueck||'').toLowerCase().includes(q)));
  const allG=L('schlaege').filter(s=>geomOf(s));
  if(!allG.length){svg.innerHTML='';return}
  let lat0=0,n=0;allG.forEach(s=>polysOf(geomOf(s)).forEach(p=>p[0].forEach(c=>{lat0+=c[1];n++})));lat0/=n;const k=Math.cos(lat0*Math.PI/180);
  const P=c=>[c[0]*k*1e4,-c[1]*1e4];
  let bb=[1e12,1e12,-1e12,-1e12];const B=pts=>pts.forEach(([x,y])=>{bb[0]=Math.min(bb[0],x);bb[1]=Math.min(bb[1],y);bb[2]=Math.max(bb[2],x);bb[3]=Math.max(bb[3],y)});
  const shapes=items.map(s=>{const g=geomOf(s);const paths=polysOf(g).map(p=>p.map(r=>r.map(P)));paths.forEach(p=>B(p[0]));return {s,paths}});
  if(!shapes.length){allG.forEach(s=>polysOf(geomOf(s)).forEach(p=>B(p[0].map(P))))}
  const key=items.map(s=>s.id).join(',');
  const W=svg.clientWidth||390,H=svg.clientHeight||700;
  if(!MAP.vb||MAP.key!==key){const pad=.18;let w=bb[2]-bb[0],h=bb[3]-bb[1];w=Math.max(w,1e-3);h=Math.max(h,1e-3);const ar=W/H;let vw=w*(1+pad*2),vh=h*(1+pad*2)+h*.9;if(vw/vh>ar)vh=vw/ar;else vw=vh*ar;const cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2+h*.25;MAP.vb=[cx-vw/2,cy-vh/2,vw,vh];MAP.key=key}
  const fs=MAP.vb[2]/26;
  const kul=id=>anbauFor(id,wj)?.kultur;
  svg.setAttribute('viewBox',MAP.vb.join(' '));svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.innerHTML=`<rect x="-1e7" y="-1e7" width="2e7" height="2e7" fill="var(--map)"/>`+shapes.map(({s,paths})=>{const on=s.id===S.sel;const d=paths.map(p=>p.map(r=>'M'+r.map(c=>c[0].toFixed(2)+' '+c[1].toFixed(2)).join('L')+'Z').join('')).join('');return `<path d="${d}" data-sid="${s.id}" fill="${on?'#F2D33B':kColor(kul(s.id))}" fill-opacity="${on?.8:.62}" stroke="${on?'#FFD24A':'#FFFFFF'}" stroke-width="${on?4:2}" vector-effect="non-scaling-stroke" fill-rule="evenodd" style="cursor:pointer"/>`}).join('')+shapes.map(({s,paths})=>{const r=paths[0][0];let x=0,y=0;r.forEach(c=>{x+=c[0];y+=c[1]});x/=r.length;y/=r.length;return `<text x="${x}" y="${y}" font-size="${fs*.5}" font-weight="800" font-family="Archivo,sans-serif" text-anchor="middle" fill="#FFFFFF" stroke="rgba(0,0,0,.45)" stroke-width="${fs*.06}" paint-order="stroke" pointer-events="none">${esc(s.name)}</text>`}).join('');
  // pan & zoom
  let drag=null;
  svg.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,vb:MAP.vb.slice(),moved:false,pts:new Map([[e.pointerId,[e.clientX,e.clientY]]])};svg.setPointerCapture(e.pointerId)};
  svg.onpointermove=e=>{if(!drag)return;const sc=MAP.vb[2]/svg.clientWidth;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)drag.moved=true;if(!drag.moved)return;MAP.vb=[drag.vb[0]-dx*sc,drag.vb[1]-dy*sc,drag.vb[2],drag.vb[3]];svg.setAttribute('viewBox',MAP.vb.join(' '))};
  svg.onpointerup=e=>{if(drag&&!drag.moved){const t=document.elementFromPoint(e.clientX,e.clientY);const sid=t&&t.getAttribute&&t.getAttribute('data-sid');S.sel=sid||null;S.listOpen=false;render()}drag=null};
  svg.onwheel=e=>{e.preventDefault();zoomMap(e.deltaY>0?1.15:.87)};
}
/* Schlag-Detail */
function vSchlag(){
  const s=D.schlaege[S.sel];const wj=curWJ();
  const backL=S.stack.length?({karte:'Karte',uebersicht:'Übersicht',massnahmen:'Maßnahmen',betrieb:'Betrieb'}[S.stack[S.stack.length-1].view]||'Zurück'):'Karte';
  if(!s)return `<div class="page"><button class="back" data-act="back">${svgI(I.back,20,2)}${backL}</button>${READY?'<div class="empty">Dieser Schlag existiert nicht mehr.</div>':loading()}</div>`;
  const r=calc(s.id,wj);const a=r.anbau;const p=r.vertrag;const t=farm(wj);const avg=t.fl?t.np/t.fl:0;
  const ms=L('massnahmen').filter(m=>m.schlag_id===s.id&&m.wj===wj).sort((x,y)=>(x.datum||'').localeCompare(y.datum||''));
  const ln=(l,v,cls='')=>`<div class="ln ${cls}"><span>${l}</span><span class="num">${v}</span></div>`;
  return `<div class="page"><button class="back" data-act="back">${svgI(I.back,20,2)}${backL}</button>
  <div class="head"><div><h1>${esc(s.name)}</h1><div class="eyebrow">${[s.flurstueck&&'Flurstück '+esc(s.flurstueck),s.gemarkung&&'Gemarkung '+esc(s.gemarkung),fha(r.fl)].filter(Boolean).join(' · ')} · WJ ${wjSelect()}</div></div><button class="icon-btn" data-act="schlagForm" data-id="${s.id}" aria-label="Stammdaten bearbeiten">${svgI(I.edit,20,2)}</button></div>
  <div class="grid2">
   <button class="tile" data-act="anbauForm" data-id="${s.id}"><span class="l">Kultur / Sorte</span><span style="font-size:14px;font-weight:600">${a?esc(a.kultur)+(a.sorte?' · '+esc(a.sorte):''):'<span class="muted">+ Anbau festlegen</span>'}</span></button>
   <button class="tile" data-act="pachtForm" data-sid="${s.id}" data-id="${p?p.id:''}"><span class="l">Pachtpreis</span><span class="num" style="font-size:14px">${s.besitz==='pacht'?(p?eur(p.preis_eur_ha)+'/ha · '+eur(r.pacht):'<span class="muted" style="font-family:var(--f-ui)">+ Vertrag erfassen</span>'):'Eigentum'}</span></button>
   <button class="tile" data-act="pachtForm" data-sid="${s.id}" data-id="${p?p.id:''}"><span class="l">Verpächter / Laufzeit</span><span style="font-size:14px;font-weight:600">${s.besitz==='pacht'?(p?esc(p.verpaechter||'—')+(p.ende?' · bis '+p.ende.slice(0,4):''):'—'):'—'}</span></button>
   <button class="tile" data-act="anbauForm" data-id="${s.id}"><span class="l">Vorfrucht</span><span style="font-size:14px;font-weight:600">${esc(a&&a.vorfrucht||'—')}</span></button>
  </div>
  <div class="card"><h2>Deckungsbeitrag je ha</h2><div class="dbcalc">
   <div class="ln" style="color:var(--fg)"><span>Erlös <span class="muted">${r.ertrag?nf(r.ertrag,1)+' dt × '+eur2(r.preis):'kein Ertrag/Preis hinterlegt'}${r.anbau&&!r.ist&&r.ertrag?' (Plan)':''}</span></span><span class="num">${eur(r.ha.erloes)}</span></div>
   ${ln('− Saatgut',eur(r.ha.saatgut))}${ln('− Dünger',eur(r.ha.duenger))}${ln('− Pflanzenschutz',eur(r.ha.psm))}${r.sonst?ln('− Sonstiges',eur(r.ha.sonst)):''}
   ${ln('= DB I',eur(r.ha.db1),'sum')}${ln('− Maschinen & Lohn',eur(r.ha.masch))}${ln('= DB II',eur(r.ha.db2),'sum')}${ln(s.besitz==='pacht'?'− Pacht':'− Pachtansatz Eigentum',eur(r.ha.pacht))}
   <div class="ln final"><span>nach Pacht</span><span class="num ${r.ha.np<0?'neg':''}">${eur(r.ha.np)}/ha</span></div></div>
   <div class="note">Schlag gesamt: ${eur(r.np)} · Betriebsdurchschnitt ${eur(avg)}/ha</div></div>
  <div style="display:flex;flex-direction:column;gap:10px"><div class="card-h"><h2>Maßnahmen ${esc(wj)}</h2><span class="muted num" style="font-size:13px">${eur(ms.reduce((x,m)=>x+massCost(m).total,0))}</span></div>
   ${ms.length?`<div class="card tight timeline">${ms.map(m=>{const c=massCost(m);return `<button class="row" data-act="massEdit" data-id="${m.id}"><span class="dot" style="background:${TYP[m.typ]?.[1]||'var(--c-sonst)'}"></span><div class="main"><span class="t">${esc(m.titel||TYP[m.typ]?.[0])} ${m.status==='geplant'?'<span class="badge plan">geplant</span>':''}</span><span class="sub">${fmtD(m.datum)} · ${esc(massDetail(m))}</span></div><span class="r">${eur(c.perHa)}/ha</span></button>`}).join('')}</div>`:`<div class="note box">Für dieses Wirtschaftsjahr ist noch nichts dokumentiert. Tipp: Mikrofon unten rechts antippen und sagen, was du gemacht hast.</div>`}
   <button class="btn dash" data-act="massNew" data-sid="${s.id}">+ Maßnahme erfassen</button></div>
  <button class="btn sec" data-act="pdfDialog" data-id="${s.id}">${svgI('M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',18,2)} Schlag als PDF</button>
  <button class="btn sec" data-act="startDraw" data-id="${s.id}">${svgI(I.karte,18,2)} ${s.geo?'Grenze auf der Karte bearbeiten':'Grenze auf der Karte zeichnen'}</button>
  ${s.notizen?`<div class="card"><h2>Notizen</h2><div style="font-size:14px;white-space:pre-wrap">${esc(s.notizen)}</div></div>`:''}
  </div>`;
}
function massDetail(m){const a=[];(m.mittel||[]).forEach(x=>a.push(`${x.name||D.mittel[x.mittel_id]?.name||'Mittel'} ${nf(n0(x.menge_pro_ha),n0(x.menge_pro_ha)%1?1:0)} ${x.einheit||''}/ha × ${nf(n0(x.preis),2)} €`));(m.maschinen||[]).forEach(y=>a.push(y.name||D.maschinen[y.maschine_id]?.name||'Maschine'));if(n0(m.lohn_eur))a.push('Lohn '+eur(m.lohn_eur));return a.join(' · ')||(m.notizen||'')}

/* Maßnahmen */
function vMassnahmen(){
  const wj=curWJ();const types=['Alle',...Object.keys(TYP)];
  let ms=L('massnahmen').filter(m=>m.wj===wj);
  if(S.mf!=='Alle')ms=ms.filter(m=>m.typ===S.mf);if(S.ms)ms=ms.filter(m=>m.schlag_id===S.ms);
  ms.sort((a,b)=>(b.datum||'').localeCompare(a.datum||''));
  let direkt=0,masch=0;ms.forEach(m=>{const c=massCost(m);direkt+=c.direkt;masch+=c.masch});
  const groups=[];ms.forEach(m=>{const k=(m.datum||'').slice(0,7);let g=groups[groups.length-1];if(!g||g.k!==k)groups.push(g={k,items:[]});g.items.push(m)});
  const sch=L('schlaege').sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  return `<div class="page"><div class="head"><div><div class="eyebrow">${S.ms?esc(D.schlaege[S.ms]?.name):'Alle Schläge'} · WJ ${wjSelect()}</div><h1>Maßnahmen</h1></div><button class="btn pri sm" style="height:44px" data-act="massNew">+ Neu</button></div>${banners()}${inboxCard()}
  <div class="chips">${types.map(t=>`<button class="chip ${S.mf===t?'on':''}" data-act="mf" data-t="${t}">${t==='Alle'?'Alle':TYP[t][0]}</button>`).join('')}</div>
  <select id="msel" class="inp" aria-label="Schlag filtern"><option value="">Alle Schläge</option>${sch.map(s=>`<option value="${s.id}"${S.ms===s.id?' selected':''}>${esc(s.name)}</option>`).join('')}</select>
  <div class="grid2"><div class="tile"><span class="l">Direktkosten erfasst</span><span class="v num">${eur(direkt)}</span></div><div class="tile"><span class="l">Maschinen & Lohn</span><span class="v num">${eur(masch)}</span></div></div>
  ${!READY?loading():groups.length?groups.map(g=>`<div style="display:flex;flex-direction:column;gap:8px"><h2 class="month">${g.k?MON[+g.k.slice(5)-1]+' '+g.k.slice(0,4):'Ohne Datum'}</h2>${g.items.map(m=>{const s=D.schlaege[m.schlag_id];const c=massCost(m);return `<button class="mcard" data-act="massEdit" data-id="${m.id}"><div class="date"><b>${(m.datum||'').slice(8,10)}</b><span>${MONS[+(m.datum||'0000-01').slice(5,7)-1]}</span></div><div class="body"><div class="top"><b>${esc(m.titel||TYP[m.typ]?.[0])}</b><span class="num" style="font-size:13px;white-space:nowrap">${eur(c.total)}</span></div><span class="sub"><span class="dot" style="background:${TYP[m.typ]?.[1]};width:8px;height:8px"></span> ${esc(TYP[m.typ]?.[0]||'')} · ${esc(s?s.name:'?')} · ${fha(c.fl)}${m.status==='geplant'?' · <b>geplant</b>':''}</span>${massDetail(m)?`<span class="mit">${esc(massDetail(m))}</span>`:''}</div></button>`}).join('')}</div>`).join(''):`<div class="card empty"><b>Noch keine Maßnahmen in ${esc(wj)}</b>Tippe auf das Mikrofon und sag z. B. „Heute Lange Äcker gegrubbert mit dem Grubber“ – oder lege sie über „+ Neu“ an.</div>`}
  </div>`;
}

/* Stall */
function vStall(){
  const y=S.stallYear;const r=stallYear(y);
  const years=[...new Set([new Date().getFullYear(),y,...L('milch').map(m=>+(m.monat||'').slice(0,4)),...L('dv').map(m=>+(m.datum||'').slice(0,4))].filter(Boolean))].sort().reverse();
  const max=Math.max(1,...r.months.map(m=>m.geld+m.dv));
  const W=340,H=150,bw=W/12;
  const chart=`<svg class="chart" viewBox="0 0 ${W} ${H+18}" width="100%" role="img" aria-label="Einnahmen je Monat">${[0.5,1].map(f=>`<line x1="0" x2="${W}" y1="${H-H*f}" y2="${H-H*f}" stroke="var(--line2)"/>`).join('')}${r.months.map((m,i)=>{const h1=m.geld/max*H,h2=m.dv/max*H;return `<rect x="${i*bw+4}" y="${H-h1}" width="${bw-8}" height="${h1}" rx="2" fill="var(--pri)"/><rect x="${i*bw+4}" y="${H-h1-h2}" width="${bw-8}" height="${h2}" rx="2" fill="var(--c-dueng)"/><text x="${i*bw+bw/2}" y="${H+13}" text-anchor="middle">${MON[i][0]}</text>`}).join('')}<text x="2" y="10" style="font-size:9px">${eur(max)}</text></svg>`;
  const segs=[['milch','Milch'],['dv','Direktverm.'],['kosten','Kosten'],['herde','Herde']];
  let list='';
  if(S.stallSeg==='milch'){list=`<div class="card tight">${r.milch.slice().reverse().map(m=>{const days=new Date(+m.monat.slice(0,4),+m.monat.slice(5,7),0).getDate();const lst=n0(m.kuehe)?(n0(m.gemelk_kg)||n0(m.menge_kg))/n0(m.kuehe)/days:0;return `<button class="row" data-act="milchForm" data-id="${m.id}"><div class="main"><span class="t">${MON[+m.monat.slice(5,7)-1]} ${m.monat.slice(0,4)}</span><span class="sub">${nf(n0(m.menge_kg))} kg · ${nf(n0(m.preis_ct)||(n0(m.menge_kg)?r.geldOf(m)/n0(m.menge_kg)*100:0),2)} ct/kg${lst?' · '+nf(lst,1)+' kg/Kuh/Tag':''}${n0(m.fett)?' · '+nf(n0(m.fett),2)+' % F / '+nf(n0(m.eiweiss),2)+' % E':''}</span></div><span class="r">${eur(r.geldOf(m))}</span></button>`}).join('')||'<div class="empty">Noch keine Milchgeldabrechnung erfasst. Foto der Abrechnung genügt.</div>'}</div><button class="btn dash" data-act="milchForm">+ Monat erfassen</button>${CFG.fotos?`<button class="btn sec" data-act="assistant" data-mode="photo">${svgI(I.cam,18,2)} Milchgeldabrechnung fotografieren</button>`:''}`}
  if(S.stallSeg==='dv'){const byP={};r.dv.forEach(x=>{byP[x.produkt||'Sonstiges']=(byP[x.produkt||'Sonstiges']||0)+n0(x.betrag)});list=`${Object.keys(byP).length?`<div class="card"><h2>Nach Produkt</h2><div class="legend">${Object.entries(byP).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><span class="lab">${esc(k)}</span><span class="num" style="font-size:13px">${eur(v)}</span><span class="pct">${Math.round(v/(r.dvSum||1)*100)} %</span></div>`).join('')}</div></div>`:''}<div class="card tight">${r.dv.slice().sort((a,b)=>b.datum.localeCompare(a.datum)).map(x=>`<button class="row" data-act="dvForm" data-id="${x.id}"><div class="main"><span class="t">${esc(x.produkt||'Verkauf')}</span><span class="sub">${fmtD(x.datum)}${x.menge?' · '+nf(n0(x.menge),1)+' '+esc(x.einheit||''):''}${x.kanal?' · '+esc(x.kanal):''}</span></div><span class="r">${eur(n0(x.betrag))}</span></button>`).join('')||'<div class="empty">Noch keine Einnahmen aus der Direktvermarktung.</div>'}</div><button class="btn dash" data-act="dvForm">+ Einnahme erfassen</button>`}
  if(S.stallSeg==='kosten'){const byK={};r.ko.forEach(x=>{byK[x.kategorie||'Sonstiges']=(byK[x.kategorie||'Sonstiges']||0)+n0(x.betrag)});list=`${Object.keys(byK).length?`<div class="card"><h2>Nach Kategorie</h2><div class="legend">${Object.entries(byK).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><span class="lab">${esc(k)}</span><span class="num" style="font-size:13px">${eur(v)}</span><span class="pct">${Math.round(v/(r.koSum||1)*100)} %</span></div>`).join('')}</div>${r.kg?`<span class="note">${nf(r.koSum/r.kg*100,2)} ct je kg abgelieferter Milch</span>`:''}</div>`:''}<div class="card tight">${r.ko.slice().sort((a,b)=>b.datum.localeCompare(a.datum)).map(x=>`<button class="row" data-act="skForm" data-id="${x.id}"><div class="main"><span class="t">${esc(x.kategorie)}</span><span class="sub">${fmtD(x.datum)}${x.notiz?' · '+esc(x.notiz):''}</span></div><span class="r">${eur(n0(x.betrag))}</span></button>`).join('')||'<div class="empty">Noch keine Stallkosten erfasst.</div>'}</div><button class="btn dash" data-act="skForm">+ Kosten erfassen</button>`}
  if(S.stallSeg==='herde')list=herdeView();
  return `<div class="page"><div class="head"><div><div class="eyebrow">Milchvieh · <select id="ysel" class="inp" style="height:30px;width:auto;padding:0 8px;font-size:13px;border-radius:8px" aria-label="Jahr">${years.map(v=>`<option${v===y?' selected':''}>${v}</option>`).join('')}</select></div><h1>Stall</h1></div></div>${banners()}
  <div class="hero"><div class="l">Einnahmen ${y}</div><div class="v">${eur(r.geld+r.dvSum)}</div><div class="s">Molkerei ${eur(r.geld)} · Direktvermarktung ${eur(r.dvSum)}</div><div class="steps"><span>Stallkosten <b>${eur(r.koSum)}</b></span><span>Saldo <b>${eur(r.saldo)}</b></span></div></div>
  <div class="grid2"><div class="tile"><span class="l">Milch abgeliefert</span><span class="v num">${nf(r.kg)} kg</span><span class="s">Ø ${nf(r.preis,2)} ct/kg</span></div><div class="tile"><span class="l">Milchleistung</span><span class="v num">${nf(r.leistung,1)}</span><span class="s">kg je Kuh und Tag · ${r.kuehe||'–'} Kühe</span></div></div>
  <div class="card"><div class="card-h"><h2>Einnahmen je Monat</h2><small><span class="dot" style="background:var(--pri);width:8px;height:8px"></span> Molkerei <span class="dot" style="background:var(--c-dueng);width:8px;height:8px;margin-left:6px"></span> Direkt</small></div>${chart}</div>
  <div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="tablist">${segs.map(([k,l])=>`<button role="tab" class="${S.stallSeg===k?'on':''}" data-act="stallSeg" data-k="${k}">${l}</button>`).join('')}</div>
  ${list}</div>`;
}

/* Betrieb */
function vBetrieb(){
  const segs=[['maschinen','Maschinen'],['mittel','Mittel'],['pacht','Pacht'],['schlaege','Schläge'],['mehr','Mehr']];
  const wj=curWJ();let body='';
  if(S.seg==='maschinen'){
    const use={};let tot=0;L('massnahmen').filter(m=>m.wj===wj).forEach(m=>{(m.maschinen||[]).forEach(y=>{const u=use[y.maschine_id]||(use[y.maschine_id]={ha:0,h:0,eur:0});u[y.abrechnung==='h'?'h':'ha']+=n0(y.menge);u.eur+=n0(y.menge)*n0(y.satz);tot+=n0(y.menge)*n0(y.satz)});tot+=n0(m.lohn_eur)});
    const fl=L('schlaege').reduce((a,s)=>a+n0(s.flaeche_ha),0);
    const ms=L('maschinen').sort((a,b)=>({eigen:0,mr:1,lohnunternehmer:2}[a.besitz]??3)-({eigen:0,mr:1,lohnunternehmer:2}[b.besitz]??3)||(a.name||'').localeCompare(b.name||''));
    body=`<div class="grid2"><div class="tile"><span class="l">Maschinenkosten WJ ${esc(wj)}</span><span class="v num">${eur(tot)}</span></div><div class="tile"><span class="l">je Hektar</span><span class="v num">${eur(fl?tot/fl:0)}/ha</span></div></div>
    ${ms.map(m=>{const u=use[m.id]||{ha:0,h:0};const b=BESITZ[m.besitz]||BESITZ.eigen;return `<button class="card" style="text-align:left;cursor:pointer;color:var(--fg);gap:10px" data-act="maschForm" data-id="${m.id}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:15px;font-weight:700">${esc(m.name)}</span><span class="muted" style="font-size:12px">${esc([m.typ,m.baujahr&&'Baujahr '+m.baujahr,m.info].filter(Boolean).join(' · '))}</span></div><span class="badge ${b[1]}">${b[0]}</span></div><div class="grid3"><div style="display:flex;flex-direction:column;gap:1px"><span class="muted" style="font-size:11px">Anschaffung</span><span class="num" style="font-size:13px">${n0(m.anschaffung)?eur(m.anschaffung):'—'}</span></div><div style="display:flex;flex-direction:column;gap:1px"><span class="muted" style="font-size:11px">Kostensatz</span><span class="num" style="font-size:13px">${eur(m.kostensatz)}/${m.einheit==='h'?'h':'ha'}</span></div><div style="display:flex;flex-direction:column;gap:1px"><span class="muted" style="font-size:11px">Auslastung</span><span class="num" style="font-size:13px">${m.einheit==='h'?nf(u.h,1)+' h':nf(u.ha,1)+' ha'}</span></div></div></button>`}).join('')||'<div class="card empty"><b>Noch keine Maschinen</b>Lege Traktor, Geräte, MR-Maschinen und Lohnunternehmer mit Kostensatz an.</div>'}
    <button class="btn dash" data-act="maschForm">+ Maschine anlegen</button>`;
  }
  if(S.seg==='mittel'){
    const q=S.msearch.toLowerCase();
    const ms=L('mittel').filter(m=>m.kategorie===S.mseg&&(!q||(m.name||'').toLowerCase().includes(q))).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    const ek=L('einkauf').sort((a,b)=>(b.datum||'').localeCompare(a.datum||'')).slice(0,5);
    body=`<div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))">${Object.entries(KATS).map(([k,l])=>`<button class="${S.mseg===k?'on':''}" data-act="mseg" data-k="${k}">${l}</button>`).join('')}</div>
    <label class="search" for="msearch">${svgI(I.search,18,2)}<input id="msearch" type="search" placeholder="Suchen" value="${esc(S.msearch)}"></label>
    <div class="card tight"><div style="display:flex;justify-content:space-between;padding:10px 0 6px;font-size:11px;color:var(--fg2);font-weight:700;text-transform:uppercase;letter-spacing:.05em"><span>${S.mseg==='saatgut'?'Sorte':'Mittel'}</span><span>Preis</span></div>
    ${ms.map(m=>{const p=lastPrice(m);const sub=[p&&p.ab?'Stand '+p.ab.slice(5,7)+'/'+p.ab.slice(0,4):'kein Preis',p&&p.haendler||m.haendler,m.kategorie==='duenger'&&m.n?nf(n0(m.n),0)+' % N':'',m.zulassung_bis?'Zulassung bis '+fmtD(m.zulassung_bis):''].filter(Boolean).join(' · ');return `<button class="row" data-act="mittelDetail" data-id="${m.id}"><div class="main"><span class="t">${esc(m.name)}</span><span class="sub">${esc(sub)}</span></div><span class="r">${p?nf(n0(p.preis),2)+' €/'+esc(m.einheit||''):'—'}</span></button>`}).join('')||'<div class="empty">Noch nichts angelegt.</div>'}</div>
    <button class="btn dash" data-act="mittelForm">+ ${{duenger:'Dünger',psm:'Pflanzenschutzmittel',saatgut:'Saatgut',sonstiges:'Betriebsmittel'}[S.mseg]} anlegen</button>
    ${CFG.fotos?`<button class="btn sec" data-act="assistant" data-mode="photo">${svgI(I.cam,18,2)} Rechnung / Lieferschein fotografieren</button>`:''}
    <div class="note" style="text-align:center">Ein neuer Preis gilt ab seinem Datum. Maßnahmen ab diesem Tag werden auf Wunsch neu berechnet.</div>
    ${ek.length?`<div class="card"><h2>Letzte Einkäufe</h2><div class="rows">${ek.map(e=>`<div class="row" style="cursor:default"><div class="main"><span class="t">${esc(e.haendler||'Einkauf')}</span><span class="sub">${fmtD(e.datum)} · ${(e.positionen||[]).map(p=>esc(p.name)).join(', ')}</span></div><span class="r">${eur(n0(e.summe))}</span></div>`).join('')}</div></div>`:''}`;
  }
  if(S.seg==='pacht'){
    const sch=L('schlaege').sort((a,b)=>(a.name||'').localeCompare(b.name||''));let sum=0,fl=0;
    const rows=sch.map(s=>{const p=pachtFor(s.id,wj);if(s.besitz==='pacht'&&p){sum+=n0(p.preis_eur_ha)*n0(s.flaeche_ha);fl+=n0(s.flaeche_ha)}return `<button class="row" data-act="pachtForm" data-sid="${s.id}" data-id="${p?p.id:''}"><div class="main"><span class="t">${esc(s.name)}</span><span class="sub">${fha(n0(s.flaeche_ha))} · ${s.besitz==='pacht'?(p?[p.ende?'bis '+p.ende.slice(0,4):'unbefristet',p.verpaechter].filter(Boolean).map(esc).join(' · '):'<span class="warn">Vertrag fehlt</span>'):'Eigentum'}</span></div><span class="r">${s.besitz==='pacht'&&p?eur(p.preis_eur_ha)+'/ha':'—'}</span></button>`}).join('');
    const soon=L('pacht').filter(p=>p.ende&&p.ende>=todayISO()&&p.ende<=String(new Date().getFullYear()+1)+'-12-31');
    body=`<div class="grid2"><div class="tile"><span class="l">Pacht gesamt / Jahr</span><span class="v num">${eur(sum)}</span><span class="s">${fha(fl)} gepachtet</span></div><div class="tile"><span class="l">Ø Pachtpreis</span><span class="v num">${eur(fl?sum/fl:0)}/ha</span><span class="s">${soon.length?soon.length+' Vertrag läuft bald aus':'keine Verträge laufen bald aus'}</span></div></div>
    <div class="card tight"><div style="display:flex;justify-content:space-between;padding:10px 0 6px;font-size:11px;color:var(--fg2);font-weight:700;text-transform:uppercase;letter-spacing:.05em"><span>Schlag</span><span>Pacht</span></div>${rows||'<div class="empty">Noch keine Schläge.</div>'}</div>
    <button class="btn dash" data-act="pachtForm">+ Pachtvertrag anlegen</button>`;
  }
  if(S.seg==='schlaege'){
    const sch=L('schlaege').sort((a,b)=>(a.name||'').localeCompare(b.name||''));const fl=sch.reduce((a,s)=>a+n0(s.flaeche_ha),0);
    body=`<div class="grid2"><div class="tile"><span class="l">Schläge</span><span class="v num">${sch.length}</span></div><div class="tile"><span class="l">Fläche</span><span class="v num">${fha(fl)}</span><span class="s">${fha(sch.filter(s=>s.besitz==='pacht').reduce((a,s)=>a+n0(s.flaeche_ha),0))} Pacht</span></div></div>
    <div class="card tight">${sch.map(s=>{const a=anbauFor(s.id,wj);return `<button class="row" data-act="schlag" data-id="${s.id}"><span class="dot" style="background:${kColor(a&&a.kultur)}"></span><div class="main"><span class="t">${esc(s.name)}</span><span class="sub">${[s.flurstueck&&'Flst. '+s.flurstueck,a&&a.kultur,s.besitz==='pacht'?'Pacht':'Eigentum',s.geo?'':'ohne Grenze'].filter(Boolean).map(esc).join(' · ')}</span></div><span class="r">${fha(n0(s.flaeche_ha))}</span></button>`}).join('')||'<div class="empty">Noch keine Schläge.</div>'}</div>
    <div class="grid2"><button class="btn dash" data-act="schlagForm">+ Schlag anlegen</button><button class="btn sec" style="height:48px" data-act="go" data-v="import">Importieren</button></div>`;
  }
  if(S.seg==='mehr'){
    const sk=L('sonstkosten').filter(k=>k.wj===wj).sort((a,b)=>(b.datum||'').localeCompare(a.datum||''));
    body=`<div class="card"><h2>Betrieb</h2><div class="fgrid">${F('set-name','Betriebsname',SET().name)}${F('set-kp','Pachtansatz Eigentum',SET().kalk_pacht,{type:'num',unit:'€/ha'})}</div><div class="note">Der Pachtansatz wird bei Eigentumsflächen als kalkulatorische Pacht abgezogen. 0 = kein Ansatz.</div><button class="btn sec sm" data-act="saveSettings" style="align-self:flex-start">Speichern</button></div>
    <div class="card"><div class="card-h"><h2>Sonstige Kosten ${esc(wj)}</h2><span class="num muted" style="font-size:13px">${eur(sk.reduce((a,k)=>a+n0(k.betrag),0))}</span></div><div class="note">Versicherung, Beiträge, Analysen … – optional einem Schlag zugeordnet.</div><div class="rows">${sk.map(k=>`<button class="row" data-act="skostForm" data-id="${k.id}"><div class="main"><span class="t">${esc(k.bezeichnung)}</span><span class="sub">${fmtD(k.datum)} · ${esc(k.schlag_id?D.schlaege[k.schlag_id]?.name:'ganzer Betrieb')}</span></div><span class="r">${eur(n0(k.betrag))}</span></button>`).join('')}</div><button class="btn dash" data-act="skostForm">+ Kosten erfassen</button></div>
    <div class="card"><h2>Daten</h2><div class="as-actions"><button class="btn sec sm" data-act="go" data-v="import">${svgI(I.dl,16,2)} Importieren</button>${DL?`<button class="btn pri sm" data-act="pdfDialog">Auswertung als PDF</button><button class="btn sec sm" data-act="exportCSV">Auswertung als CSV</button><button class="btn sec sm" data-act="exportMass">Maßnahmen als CSV</button><button class="btn sec sm" data-act="exportJSON">Sicherung (JSON)</button>`:'<span class="note">Export ist in dieser Ansicht nicht verfügbar.</span>'}</div></div>
    ${teamCard()}${botCard()}
    ${!L('schlaege').length&&!L('maschinen').length?`<div class="card"><h2>Beispieldaten</h2><div class="note">Zum Ausprobieren: 6 Beispielschläge mit Maßnahmen, Maschinen, Mitteln und Milchdaten laden. Später mit einem Tipp wieder entfernen.</div><button class="btn sec sm" data-act="demoLoad" style="align-self:flex-start">Beispieldaten laden</button></div>`:''}
    <div class="card"><h2>Konto</h2><div style="font-size:14px">${LOCAL?'Demo-Modus (nicht verbunden)':'Angemeldet als <b>'+esc(ME&&ME.email)+'</b> · Rolle: '+esc({admin:'Betriebsleitung',editor:'Mitarbeiter',leser:'Nur lesen'}[ROLE]||ROLE)}</div>${S.betriebe.length>1?`<select id="betriebsel" class="inp">${S.betriebe.map(b=>`<option value="${b.id}"${BETRIEB&&b.id===BETRIEB.id?' selected':''}>${esc(b.name)}</option>`).join('')}</select>`:''}${LOCAL?'':'<button class="btn ghost sm" data-act="logout" style="align-self:flex-start">Abmelden</button>'}</div></div>`;
  }
  return `<div class="page"><div class="head"><div><div class="eyebrow">${esc(betriebName())} · WJ ${wjSelect()}</div><h1>Betrieb</h1></div></div>${banners()}
  <div class="seg" style="grid-template-columns:repeat(5,minmax(0,1fr))" role="tablist">${segs.map(([k,l])=>`<button role="tab" class="${S.seg===k?'on':''}" data-act="seg" data-k="${k}">${l}</button>`).join('')}</div>${body}</div>`;
}

/* Team */
const ROLLEN={admin:'Betriebsleitung',editor:'Mitarbeiter (bearbeiten)',leser:'Nur lesen'};
function teamCard(){
  if(LOCAL)return `<div class="card"><h2>Team</h2><div class="note">Im Demo-Modus nicht verfügbar.</div></div>`;
  const admin=ROLE==='admin';const offen=(S.einladungen||[]).filter(e=>!e.benutzt_am&&e.gueltig_bis>new Date().toISOString());
  return `<div class="card"><h2>Team</h2><div class="rows">${S.members.map(m=>`<div class="member"><div class="main"><b>${esc(m.name||m.email)}</b>${m.name?`<div class="muted" style="font-size:12px">${esc(m.email)}</div>`:''}</div><span class="badge ${m.rolle==='leser'?'plan':m.rolle==='editor'?'mr':''}">${esc(ROLLEN[m.rolle]||m.rolle)}</span>${admin&&m.email!==ME.email?`<button class="icon-btn" style="width:36px;height:36px;border:none" data-act="memberDel" data-e="${esc(m.email)}" aria-label="Zugriff entfernen">${svgI(I.x,16,2)}</button>`:''}</div>`).join('')}</div>
   ${admin?`<div class="sub-h">Person einladen</div><div class="fgrid">${F('tm-name','Name',null,{ph:'z. B. Max'})}${F('tm-rolle','Rolle','editor',{type:'select',opts:Object.entries(ROLLEN)})}${F('tm-mail','Nur für diese E-Mail (optional)',null,{type:'email',full:true,ph:'leer = Link gilt für jede E-Mail'})}</div><button class="btn pri sm" data-act="inviteNew" style="align-self:flex-start">Einladungslink erstellen</button>
   ${S.neuLink?`<div class="note box" style="overflow-wrap:anywhere"><b>Neuer Einladungslink</b> (gilt einmal, 14 Tage):<br><span style="user-select:all">${esc(S.neuLink)}</span></div><div class="as-actions">${navigator.share?'<button class="btn pri sm" data-act="inviteShare">Teilen (WhatsApp, SMS …)</button>':''}<button class="btn sec sm" data-act="inviteCopy">Kopieren</button><a class="btn sec sm" href="mailto:?subject=${encodeURIComponent('Einladung zur Hof-App')}&body=${encodeURIComponent(inviteText(S.neuLink))}">Per E-Mail</a></div>`:''}
   ${offen.length?`<div class="sub-h">Offene Einladungen</div><div class="rows">${offen.map(e=>`<div class="member"><div class="main"><b>${esc(e.name||e.email||'ohne Namen')}</b><div class="muted" style="font-size:12px">${esc(ROLLEN[e.rolle]||e.rolle)} · gültig bis ${fmtD(e.gueltig_bis.slice(0,10))}${e.email?' · nur '+esc(e.email):''}</div></div><button class="btn ghost sm danger" data-act="inviteDel" data-c="${esc(e.code)}">Zurückziehen</button></div>`).join('')}</div>`:''}
   <div class="note">Nur wer einen Einladungslink öffnet, kann ein Konto erstellen. Er sieht nur diesen Betrieb – kein Claude-Konto nötig.</div>`:'<div class="note">Nur die Betriebsleitung kann Personen einladen.</div>'}</div>`;
}
const inviteText=l=>`Hallo,\n\nich habe dich zu unserer Hof-App (Ackerschlagkartei) eingeladen. Öffne diesen Link, tippe auf „Konto erstellen“, gib deine E-Mail und ein Passwort ein und bestätige den Link aus der E-Mail, die du dann bekommst:\n\n${l}\n\nDer Link gilt einmal und 14 Tage. Tipp: Danach im Browser „Zum Home-Bildschirm“ wählen.`;
async function loadInvites(){if(LOCAL||ROLE!=='admin')return;const {data}=await SB.from('einladungen').select('*').eq('betrieb_id',BETRIEB.id).order('erstellt',{ascending:false});S.einladungen=data||[]}
async function inviteNew(d,b){b.disabled=true;const a=new Uint8Array(22);crypto.getRandomValues(a);const code=[...a].map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'[x%57]).join('');const em=val('tm-mail').toLowerCase();if(em&&!/^\S+@\S+\.\S+$/.test(em)){b.disabled=false;return toast('Bitte eine gültige E-Mail-Adresse eingeben oder das Feld leer lassen.')}
  const {error}=await SB.from('einladungen').insert({code:code+'x'.repeat(Math.max(0,20-code.length)),betrieb_id:BETRIEB.id,rolle:val('tm-rolle'),email:em||null,name:val('tm-name')||null});b.disabled=false;if(error)return toast('Einladung fehlgeschlagen: '+error.message+' (7_einladungen.sql ausgeführt?)',8000);
  S.neuLink=appUrl()+'#einladung-'+code+'x'.repeat(Math.max(0,20-code.length));await loadInvites();render()}
async function memberDel(d,b){if(!b.dataset.c){b.dataset.c=1;b.innerHTML='<b style="font-size:11px;color:var(--bad)">Löschen?</b>';return}const {error}=await SB.from('mitglieder').delete().match({betrieb_id:BETRIEB.id,email:d.e});if(error)return toast('Entfernen fehlgeschlagen: '+error.message);await loadMembers();render();toast('Zugriff entfernt')}
async function demoLoad(d,b){b.disabled=true;try{const j=await (await fetch('beispieldaten.json')).json();for(const [c,docs] of Object.entries(j))for(const [id,doc] of Object.entries(docs))await put(c,id,doc);toast('Beispieldaten geladen')}catch(e){toast('Laden fehlgeschlagen.');b.disabled=false}}
async function inviteDel(d,b){if(!b.dataset.c2){b.dataset.c2=1;b.textContent='Wirklich?';return}const {error}=await SB.from('einladungen').delete().eq('code',d.c);if(error)return toast(error.message);await loadInvites();render();toast('Einladung zurückgezogen')}
function botCard(){
  if(LOCAL||ROLE!=='admin')return '';
  return `<div class="card"><h2>Claude-Zugang (Marktpreise)</h2><div class="note">Claude aktualisiert jeden Morgen die Marktpreise über dein Claude-Abo. Dafür braucht die Cloud-Aufgabe einen eigenen Zugangsschlüssel. Er erlaubt nur das Schreiben der Marktpreise sowie das Lesen von Eingangskorb und Stammdaten.</div>
   ${S.botToken?`<div class="note box" style="overflow-wrap:anywhere"><b>Neuer Schlüssel</b> (wird nur jetzt angezeigt):<br><span class="num" style="font-size:12px;user-select:all">${esc(S.botToken)}</span></div><button class="btn sec sm" data-act="copyBot" style="align-self:flex-start">Schlüssel kopieren</button><div class="note">Trage ihn in den Einstellungen der Cloud-Umgebung als Umgebungsvariable <b>HOF_BOT_TOKEN</b> ein (siehe Anleitung, Schritt 5).</div>`:''}
   <div class="as-actions"><button class="btn sec sm" data-act="botNew">Neuen Schlüssel erzeugen</button><button class="btn ghost sm danger" data-act="botRevoke">Alle Schlüssel sperren</button></div></div>`;
}
async function botNew(){const a=new Uint8Array(32);crypto.getRandomValues(a);const tok=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');const {error}=await SB.from('bot_tokens').insert({token:tok,betrieb_id:BETRIEB.id});if(error)return toast('Erzeugen fehlgeschlagen: '+error.message+' (2_claude_auswertung.sql ausgeführt?)');S.botToken=tok;render()}
async function botRevoke(d,b){if(!b.dataset.c){b.dataset.c=1;b.textContent='Wirklich sperren?';return}const {error}=await SB.from('bot_tokens').delete().eq('betrieb_id',BETRIEB.id);if(error)return toast('Sperren fehlgeschlagen: '+error.message);S.botToken=null;render();toast('Alle Schlüssel gesperrt')}

/* ---------- Formulare ---------- */
function F(id,label,v,o={}){
  v=v??'';let ctl;
  if(o.type==='select')ctl=`<select id="${id}">${o.opts.map(x=>{const [k,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(k)}"${String(k)===String(v)?' selected':''}>${esc(l)}</option>`}).join('')}</select>`;
  else if(o.type==='textarea')ctl=`<textarea id="${id}" rows="${o.rows||3}" placeholder="${esc(o.ph||'')}">${esc(v)}</textarea>`;
  else{const t=o.type==='num'?'text':(o.type||'text');ctl=`<input id="${id}" type="${t}"${o.type==='num'?' inputmode="decimal"':''} value="${esc(o.type==='num'?fmtIn(v):v)}" placeholder="${esc(o.ph||'')}"${o.list?` list="${o.list}"`:''} autocomplete="off">`}
  return `<label class="fld${o.full?' full':''}${o.cls?' '+o.cls:''}"><span>${esc(label)}${o.unit?` <i>(${esc(o.unit)})</i>`:''}</span>${ctl}</label>`;
}
function openSheet({title,body,save,saveLabel='Speichern',del:onDel,mount}){
  const el=$('#sheet');
  el.innerHTML=`<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sh-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="closeSheet" aria-label="Schließen">${svgI(I.x,20,2)}</button></div><div class="sh-body" id="shb">${body}</div>${save||onDel?`<div class="sh-foot">${onDel?'<button class="btn ghost danger" id="sh-del">Löschen</button>':''}${save?`<button class="btn pri" id="sh-save">${esc(saveLabel)}</button>`:''}</div>`:''}</div>`;
  el.hidden=false;
  if(save)$('#sh-save').onclick=async()=>{const b=$('#sh-save');b.disabled=true;try{const r=await save();if(r!==false)closeSheet()}finally{if(b.isConnected)b.disabled=false}};
  if(onDel){const b=$('#sh-del');b.onclick=async()=>{if(b.dataset.c){await onDel();closeSheet()}else{b.dataset.c=1;b.textContent='Wirklich löschen?'}}}
  if(mount)mount(el);
}
function closeSheet(){const el=$('#sheet');el.hidden=true;el.innerHTML='';stopRec()}
function need(cond,msg){if(!cond){toast(msg);return false}return true}

function schlagForm(id){
  const s=id?D.schlaege[id]:{besitz:'eigentum'};
  openSheet({title:id?'Schlag bearbeiten':'Neuer Schlag',body:`<div class="fgrid">${F('f-name','Name',s.name,{full:true,ph:'z. B. Lange Äcker'})}${F('f-fl','Fläche',s.flaeche_ha,{type:'num',unit:'ha'})}${F('f-bes','Besitz',s.besitz,{type:'select',opts:[['eigentum','Eigentum'],['pacht','Pacht']]})}${F('f-flst','Flurstück',s.flurstueck)}${F('f-gem','Gemarkung',s.gemarkung)}${F('f-bp','Bodenpunkte',s.bodenpunkte,{type:'num'})}${F('f-fnr','FIONA-Schlagnr.',s.fiona_nr)}${F('f-not','Notizen',s.notizen,{type:'textarea',full:true})}</div>${s.geo?'<div class="note box">Schlaggrenze ist hinterlegt.</div>':''}`,
   save:async()=>{if(!need(val('f-name'),'Bitte einen Namen eingeben.'))return false;const nid=id||uid();await put('schlaege',nid,{...s,name:val('f-name'),flaeche_ha:nval('f-fl')??0,besitz:val('f-bes'),flurstueck:val('f-flst'),gemarkung:val('f-gem'),bodenpunkte:nval('f-bp'),fiona_nr:val('f-fnr'),notizen:val('f-not')});if(!id){S.stack.push({view:S.view,sel:S.sel});S.view='schlag';S.sel=nid;render(true)}toast('Schlag gespeichert')},
   del:id?async()=>{await del('schlaege',id);L('anbau').filter(a=>a.schlag_id===id).forEach(a=>del('anbau',a.id));if(S.view==='schlag')back()}:null});
}
function kulturList(){const s=new Set(['Winterweizen','Wintergerste','Winterraps','Zuckerrüben','Silomais','Körnermais','Sommergerste','Dinkel','Roggen','Triticale','Hafer','Kartoffeln','Soja','Ackerbohnen','Grünland','Kleegras','Brache']);L('anbau').forEach(a=>a.kultur&&s.add(a.kultur));return `<datalist id="dl-kultur">${[...s].map(k=>`<option value="${esc(k)}">`).join('')}</datalist>`}
function anbauForm(sid){
  const wj=curWJ();const a=anbauFor(sid,wj)||{};const s=D.schlaege[sid];
  openSheet({title:`Anbau ${wj} · ${s.name}`,body:`${kulturList()}<div class="fgrid">${F('a-k','Kultur',a.kultur,{list:'dl-kultur'})}${F('a-s','Sorte',a.sorte)}${F('a-v','Vorfrucht',a.vorfrucht,{list:'dl-kultur'})}${F('a-p','Preis',a.preis_eur_dt,{type:'num',unit:'€/dt'})}${F('a-ep','Ertrag Plan',a.ertrag_plan,{type:'num',unit:'dt/ha'})}${F('a-ei','Ertrag Ist',a.ertrag_ist,{type:'num',unit:'dt/ha'})}${F('a-so','Sonstige Erlöse',a.sonstige_erloese,{type:'num',unit:'€/ha',full:true})}</div><div class="note">Sonstige Erlöse z. B. Strohverkauf oder schlagbezogene Prämien. Ist-Ertrag ersetzt den Plan-Ertrag, sobald er eingetragen ist.</div>`,
   save:async()=>{await put('anbau',a.id||uid(),{schlag_id:sid,wj,kultur:val('a-k'),sorte:val('a-s'),vorfrucht:val('a-v'),preis_eur_dt:nval('a-p'),ertrag_plan:nval('a-ep'),ertrag_ist:nval('a-ei'),sonstige_erloese:nval('a-so')});toast('Anbau gespeichert')},
   del:a.id?()=>del('anbau',a.id):null});
}
function schlagOpts(sel){return L('schlaege').sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(s=>[s.id,s.name])}
function pachtForm(id,sid){
  const p=id?D.pacht[id]:{schlag_id:sid||''};
  openSheet({title:id?'Pachtvertrag':'Neuer Pachtvertrag',body:`<div class="fgrid">${F('p-s','Schlag',p.schlag_id,{type:'select',opts:[['','– wählen –'],...schlagOpts()],full:true})}${F('p-v','Verpächter',p.verpaechter,{full:true})}${F('p-k','Kontakt',p.kontakt,{full:true,ph:'Adresse, Telefon, IBAN …'})}${F('p-pr','Pachtpreis',p.preis_eur_ha,{type:'num',unit:'€/ha'})}${F('p-z','Zahlungstermin',p.zahltermin,{ph:'z. B. 11.11.'})}${F('p-b','Beginn',p.beginn,{type:'date'})}${F('p-e','Ende',p.ende,{type:'date'})}${F('p-n','Notizen',p.notizen,{type:'textarea',full:true})}</div>`,
   save:async()=>{const s=val('p-s');if(!need(s,'Bitte einen Schlag wählen.'))return false;await put('pacht',id||uid(),{schlag_id:s,verpaechter:val('p-v'),kontakt:val('p-k'),preis_eur_ha:nval('p-pr')??0,zahltermin:val('p-z'),beginn:val('p-b'),ende:val('p-e'),notizen:val('p-n')});const sc=D.schlaege[s];if(sc&&sc.besitz!=='pacht')await put('schlaege',s,{...sc,besitz:'pacht'});toast('Pachtvertrag gespeichert')},
   del:id?()=>del('pacht',id):null});
}
function maschForm(id,pre){
  const m=id?D.maschinen[id]:{besitz:'eigen',einheit:'ha',...(pre||{})};
  openSheet({title:id?'Maschine bearbeiten':'Neue Maschine',body:`<div class="fgrid">${F('m-n','Bezeichnung',m.name,{full:true,ph:'z. B. Grubber 4 m'})}${F('m-t','Typ',m.typ,{ph:'Traktor, Grubber …'})}${F('m-b','Besitz',m.besitz,{type:'select',opts:Object.entries(BESITZ).map(([k,v])=>[k,v[0]])})}${F('m-ks','Kostensatz',m.kostensatz,{type:'num',unit:'€'})}${F('m-e','je',m.einheit,{type:'select',opts:[['ha','Hektar'],['h','Stunde']]})}${F('m-a','Anschaffungspreis',m.anschaffung,{type:'num',unit:'€'})}${F('m-bj','Baujahr',m.baujahr,{type:'num'})}${F('m-nd','Nutzungsdauer',m.nutzungsdauer,{type:'num',unit:'Jahre'})}${F('m-l','Flächenleistung',m.leistung_ha_h,{type:'num',unit:'ha/h'})}${F('m-i','Info',m.info,{full:true,ph:'z. B. Lohnunternehmen Name, Restwert …'})}</div><div class="note">Kostensatz inklusive Diesel, Reparatur und Abschreibung, oder der Preis des MR/Lohnunternehmers.</div>`,
   save:async()=>{if(!need(val('m-n'),'Bitte eine Bezeichnung eingeben.'))return false;await put('maschinen',id||uid(),{...m,name:val('m-n'),typ:val('m-t'),besitz:val('m-b'),kostensatz:nval('m-ks')??0,einheit:val('m-e'),anschaffung:nval('m-a'),baujahr:nval('m-bj'),nutzungsdauer:nval('m-nd'),leistung_ha_h:nval('m-l'),info:val('m-i'),demo:false});toast('Maschine gespeichert')},
   del:id?()=>del('maschinen',id):null});
}
function mittelForm(id){
  const m=id?D.mittel[id]:{kategorie:S.mseg,einheit:S.mseg==='psm'?'l':'kg'};const p=id?null:{};
  openSheet({title:id?'Mittel bearbeiten':'Neues Betriebsmittel',body:`<div class="fgrid">${F('i-n','Name',m.name,{full:true})}${F('i-k','Kategorie',m.kategorie,{type:'select',opts:Object.entries(KAT)})}${F('i-e','Einheit',m.einheit,{type:'select',opts:['kg','l','t','m³','U','Sack','Stück']})}${F('i-h','Händler',m.haendler)}${F('i-z','Zulassung bis (PSM)',m.zulassung_bis,{type:'date'})}${F('i-nn','N',m.n,{type:'num',unit:'%'})}${F('i-pp','P₂O₅',m.p,{type:'num',unit:'%'})}${F('i-kk','K₂O',m.k,{type:'num',unit:'%'})}${F('i-ss','S',m.s,{type:'num',unit:'%'})}${p?F('i-pr','Einkaufspreis',null,{type:'num',unit:'€ je Einheit'})+F('i-ab','gültig ab',todayISO(),{type:'date'}):''}</div>`,
   save:async()=>{if(!need(val('i-n'),'Bitte einen Namen eingeben.'))return false;const body={...m,name:val('i-n'),kategorie:val('i-k'),einheit:val('i-e'),haendler:val('i-h'),zulassung_bis:val('i-z'),n:nval('i-nn'),p:nval('i-pp'),k:nval('i-kk'),s:nval('i-ss')};if(p&&nval('i-pr')!=null)body.preise=[{ab:val('i-ab')||todayISO(),preis:nval('i-pr'),haendler:val('i-h')}];if(!body.preise)body.preise=[];await put('mittel',id||uid(),body);toast('Gespeichert')},
   del:id?()=>del('mittel',id):null});
}
function mittelDetail(id){
  const m=D.mittel[id];const ps=(m.preise||[]).slice().sort((a,b)=>(b.ab||'').localeCompare(a.ab||''));
  const used=L('massnahmen').filter(x=>(x.mittel||[]).some(y=>y.mittel_id===id));
  openSheet({title:m.name,body:`<div class="note">${esc(KAT[m.kategorie]||'')} · Einheit ${esc(m.einheit||'')}${m.haendler?' · '+esc(m.haendler):''} · in ${used.length} Maßnahmen verwendet</div>
   <div class="card tight">${ps.map((p,i)=>`<div class="row" style="cursor:default"><div class="main"><span class="t">ab ${fmtD(p.ab)}</span><span class="sub">${esc([p.haendler,p.menge?nf(n0(p.menge),0)+' '+(m.einheit||'')+' gekauft':''].filter(Boolean).join(' · '))}${i===0?' · aktuell':''}</span></div><span class="r">${nf(n0(p.preis),2)} €/${esc(m.einheit||'')}</span></div>`).join('')||'<div class="empty">Noch kein Preis hinterlegt.</div>'}</div>
   <div class="sub-h">Neuer Preis</div><div class="fgrid">${F('np-p','Preis',null,{type:'num',unit:'€/'+(m.einheit||'')})}${F('np-ab','gültig ab',todayISO(),{type:'date'})}${F('np-h','Händler',m.haendler)}${F('np-m','Menge gekauft',null,{type:'num',unit:m.einheit})}</div>
   <label style="display:flex;gap:10px;align-items:center;font-size:14px"><input type="checkbox" id="np-re" checked style="width:20px;height:20px"> Maßnahmen ab diesem Datum mit dem neuen Preis neu berechnen</label>
   <button class="btn sec sm" data-act="mittelEdit" data-id="${id}" style="align-self:flex-start">${svgI(I.edit,16,2)} Stammdaten bearbeiten</button>`,
   saveLabel:'Preis speichern',save:async()=>{const pr=nval('np-p');if(!need(pr!=null,'Bitte einen Preis eingeben.'))return false;await addPrice(id,{ab:val('np-ab')||todayISO(),preis:pr,haendler:val('np-h'),menge:nval('np-m')},$('#np-re').checked);toast('Preis gespeichert')}});
}
async function addPrice(id,p,recalc){
  const m=D.mittel[id];if(!m)return;
  await put('mittel',id,{...m,preise:[...(m.preise||[]),p]});
  if(recalc){for(const x of L('massnahmen')){if(!(x.datum>=p.ab))continue;let ch=false;const mit=(x.mittel||[]).map(y=>{if(y.mittel_id===id&&!y.preis_manuell){const np=priceAt(D.mittel[id],x.datum);if(np&&np.preis!==y.preis){ch=true;return {...y,preis:np.preis}}}return y});if(ch)await put('massnahmen',x.id,{...x,mittel:mit})}}
}

/* Maßnahme-Formular */
let MF=null;
function massForm(pre){
  const ed=pre&&pre.id?D.massnahmen[pre.id]:null;
  MF=ed?JSON.parse(JSON.stringify({...ed,schlag_ids:[ed.schlag_id]})):{schlag_ids:[],datum:todayISO(),typ:'bodenbearbeitung',status:'erledigt',titel:'',notizen:'',mittel:[],maschinen:[],lohn_eur:null,...(pre||{})};
  if(!MF.wj)MF.wj=wjOf(MF.datum,MF.typ);MF._wjAuto=!ed;
  openSheet({title:ed?'Maßnahme bearbeiten':'Maßnahme erfassen',body:'<div id="mfb"></div>',saveLabel:'Speichern',save:saveMass,del:ed?()=>del('massnahmen',ed.id):null,mount:()=>{drawMF();const b=$('#shb');b.addEventListener('input',mfInput);b.addEventListener('change',mfInput)}});
}
function mittelOpts(sel){const g={};L('mittel').sort((a,b)=>(a.name||'').localeCompare(b.name||'')).forEach(m=>(g[m.kategorie]||(g[m.kategorie]=[])).push(m));return `<option value="">– neues Mittel –</option>`+Object.entries(KAT).filter(([k])=>g[k]).map(([k,l])=>`<optgroup label="${l}">${g[k].map(m=>`<option value="${m.id}"${m.id===sel?' selected':''}>${esc(m.name)}</option>`).join('')}</optgroup>`).join('')}
function drawMF(){
  const ed=!!MF.id;const all=L('schlaege').sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const wjs=[...new Set([MF.wj,...wjList()])].sort().reverse();
  $('#mfb').innerHTML=`<div style="display:flex;flex-direction:column;gap:14px">
   <div class="fld"><span>Schlag${ed?'':'(e) – mehrere möglich'}</span><div class="chips wrap">${all.map(s=>`<button type="button" class="chip ${MF.schlag_ids.includes(s.id)?'on':''}" data-act="mfSchlag" data-id="${s.id}">${esc(s.name)} · ${nf(n0(s.flaeche_ha),1)}</button>`).join('')||'<span class="note">Erst einen Schlag anlegen.</span>'}</div></div>
   <div class="fgrid">${F('mf-titel','Bezeichnung',MF.titel,{full:true,ph:'z. B. Düngung N1'})}${F('mf-datum','Datum',MF.datum,{type:'date'})}${F('mf-typ','Art',MF.typ,{type:'select',opts:Object.entries(TYP).map(([k,v])=>[k,v[0]])})}${F('mf-status','Status',MF.status,{type:'select',opts:[['erledigt','erledigt'],['geplant','geplant']]})}${F('mf-wj','Wirtschaftsjahr',MF.wj,{type:'select',opts:wjs})}</div>
   <div class="sub-h">Mittel</div><div class="lines">${MF.mittel.map((x,i)=>{const mi=D.mittel[x.mittel_id];return `<div class="line"><button type="button" class="x" data-act="mfDelM" data-i="${i}" aria-label="Entfernen">${svgI(I.x,16,2)}</button>
     <label class="fld w3"><span>Mittel</span><select id="mm-id-${i}">${mittelOpts(x.mittel_id)}</select></label>
     ${!x.mittel_id?F('mm-name-'+i,'Name neues Mittel',x.name,{cls:'w2'})+F('mm-kat-'+i,'Kategorie',x.kategorie||'duenger',{type:'select',opts:Object.entries(KATS)}):''}
     ${F('mm-menge-'+i,'Menge/ha',x.menge_pro_ha,{type:'num'})}${!x.mittel_id?F('mm-einh-'+i,'Einheit',x.einheit||'kg',{type:'select',opts:['kg','l','t','m³','U','Sack','Stück']}):`<label class="fld"><span>Einheit</span><input value="${esc(mi?mi.einheit:x.einheit)}" disabled></label>`}${F('mm-preis-'+i,'Preis',x.preis,{type:'num',unit:'€/'+(mi?mi.einheit:x.einheit||'')})}
     <div class="cost" id="mm-c-${i}"></div></div>`}).join('')}<button type="button" class="btn sec sm" data-act="mfAddM" style="align-self:flex-start">+ Mittel</button></div>
   <div class="sub-h">Maschinen</div><div class="lines">${MF.maschinen.map((y,i)=>`<div class="line"><button type="button" class="x" data-act="mfDelG" data-i="${i}" aria-label="Entfernen">${svgI(I.x,16,2)}</button>
     <label class="fld w3"><span>Maschine</span><select id="mg-id-${i}"><option value="">– wählen –</option>${L('maschinen').sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=>`<option value="${m.id}"${m.id===y.maschine_id?' selected':''}>${esc(m.name)} (${nf(n0(m.kostensatz),0)} €/${m.einheit==='h'?'h':'ha'})</option>`).join('')}</select></label>
     ${F('mg-ab-'+i,'Abrechnung',y.abrechnung||'ha',{type:'select',opts:[['ha','€/ha'],['h','€/h']]})}${F('mg-menge-'+i,y.abrechnung==='h'?'Stunden':'Hektar',y.menge,{type:'num',ph:y.abrechnung==='h'?'h':'ganze Fläche'})}${F('mg-satz-'+i,'Satz',y.satz,{type:'num',unit:'€'})}
     <div class="cost" id="mg-c-${i}"></div></div>`).join('')}<button type="button" class="btn sec sm" data-act="mfAddG" style="align-self:flex-start">+ Maschine</button></div>
   <div class="fgrid">${F('mf-lohn','Lohn/Rechnung pauschal',MF.lohn_eur,{type:'num',unit:'€ je Schlag'})}${F('mf-not','Notizen',MF.notizen,{type:'textarea',full:true,rows:2})}</div>
   <div class="sum-box" id="mf-sum"></div></div>`;
  mfSum();
}
function mfRead(){
  MF.titel=val('mf-titel');const d=val('mf-datum');const t=val('mf-typ');
  if(MF._wjAuto&&(d!==MF.datum||t!==MF.typ)){MF.wj=wjOf(d,t);const s=$('#mf-wj');if(s){if(![...s.options].some(o=>o.value===MF.wj))s.add(new Option(MF.wj,MF.wj));s.value=MF.wj}}
  else MF.wj=val('mf-wj')||MF.wj;
  MF.datum=d;MF.typ=t;MF.status=val('mf-status');MF.notizen=val('mf-not');MF.lohn_eur=nval('mf-lohn');
  MF.mittel.forEach((x,i)=>{const id=val('mm-id-'+i);if(id!==x.mittel_id){x.mittel_id=id;const mi=D.mittel[id];if(mi){x.name=mi.name;x.kategorie=mi.kategorie;x.einheit=mi.einheit;const p=priceAt(mi,MF.datum);x.preis=p?p.preis:null;x.preis_manuell=false;x._redraw=true}}else{if(!id){x.name=val('mm-name-'+i);x.kategorie=val('mm-kat-'+i);x.einheit=val('mm-einh-'+i)}const pr=nval('mm-preis-'+i);if(pr!==x.preis){x.preis=pr;x.preis_manuell=true}}x.menge_pro_ha=nval('mm-menge-'+i)});
  MF.maschinen.forEach((y,i)=>{const id=val('mg-id-'+i);if(id!==y.maschine_id){y.maschine_id=id;const m=D.maschinen[id];if(m){y.name=m.name;y.abrechnung=m.einheit==='h'?'h':'ha';y.satz=n0(m.kostensatz);y._redraw=true}}else{const ab=val('mg-ab-'+i);if(ab!==y.abrechnung){y.abrechnung=ab;y._redraw=true}y.satz=nval('mg-satz-'+i)}y.menge=nval('mg-menge-'+i)});
}
function mfInput(e){if(!e.target.id)return;mfRead();if(MF.mittel.some(x=>x._redraw)||MF.maschinen.some(y=>y._redraw)||e.target.id.startsWith('mm-id')||e.target.id.startsWith('mg-id')){MF.mittel.forEach(x=>delete x._redraw);MF.maschinen.forEach(y=>delete y._redraw);if(e.type==='change'){const f=e.target.id;drawMF();const el=document.getElementById(f);el&&el.focus()}}else mfSum()}
function mfSum(){
  const fl=MF.schlag_ids.reduce((a,id)=>a+n0(D.schlaege[id]?.flaeche_ha),0);
  let mit=0,ma=0;
  MF.mittel.forEach((x,i)=>{const ph=n0(x.menge_pro_ha)*n0(x.preis);mit+=ph*fl;const c=$('#mm-c-'+i);if(c)c.innerHTML=`<span>${nf(ph,2)} €/ha</span><span>${eur(ph*fl)} gesamt</span>`});
  MF.maschinen.forEach((y,i)=>{let v=0;MF.schlag_ids.forEach(id=>{const sf=n0(D.schlaege[id]?.flaeche_ha);v+=(y.abrechnung==='h'?n0(y.menge):(y.menge!=null?n0(y.menge):sf))*n0(y.satz)});ma+=v;const c=$('#mg-c-'+i);if(c)c.innerHTML=`<span>${y.abrechnung==='h'?'Stunden je Schlag':'leer = ganze Schlagfläche'}</span><span>${eur(v)}</span>`});
  ma+=n0(MF.lohn_eur)*MF.schlag_ids.length;
  const el=$('#mf-sum');if(el)el.innerHTML=`<div class="big"><span>Kosten gesamt</span><span class="num">${eur(mit+ma)}</span></div><span>${MF.schlag_ids.length} Schlag/Schläge · ${fha(fl)} · ${fl?eur((mit+ma)/fl)+'/ha':''}</span><span class="muted">Mittel ${eur(mit)} · Maschinen & Lohn ${eur(ma)}</span>`;
}
async function saveMass(fromForm=true){
  if(fromForm)mfRead();
  if(!need(MF.schlag_ids.length,'Bitte mindestens einen Schlag auswählen.'))return false;
  // neue Mittel / Maschinen anlegen
  for(const x of MF.mittel){if(!x.mittel_id&&x.name){const ex=L('mittel').find(m=>m.name.toLowerCase()===x.name.toLowerCase());if(ex)x.mittel_id=ex.id;else{const nid=uid();await put('mittel',nid,{name:x.name,kategorie:x.kategorie||'sonstiges',einheit:x.einheit||'kg',preise:x.preis!=null?[{ab:MF.datum,preis:x.preis}]:[]});x.mittel_id=nid}}}
  for(const y of MF.maschinen){if(!y.maschine_id&&y.name){const ex=L('maschinen').find(m=>m.name.toLowerCase()===y.name.toLowerCase());if(ex)y.maschine_id=ex.id;else{const nid=uid();await put('maschinen',nid,{name:y.name,besitz:'eigen',einheit:y.abrechnung||'ha',kostensatz:n0(y.satz)});y.maschine_id=nid}}}
  const mittel=MF.mittel.filter(x=>x.mittel_id||x.name).map(x=>{const mi=D.mittel[x.mittel_id];return {mittel_id:x.mittel_id,name:mi?mi.name:x.name,kategorie:mi?mi.kategorie:x.kategorie,einheit:mi?mi.einheit:x.einheit,menge_pro_ha:n0(x.menge_pro_ha),preis:n0(x.preis),preis_manuell:!!x.preis_manuell}});
  const ty=MF.typ;const titel=MF.titel||TYP[ty][0];
  for(const sid of MF.schlag_ids){
    const sf=n0(D.schlaege[sid]?.flaeche_ha);
    const maschinen=MF.maschinen.filter(y=>y.maschine_id).map(y=>({maschine_id:y.maschine_id,name:D.maschinen[y.maschine_id]?.name||y.name,abrechnung:y.abrechnung||'ha',menge:y.abrechnung==='h'?n0(y.menge):(y.menge!=null?n0(y.menge):sf),satz:n0(y.satz)}));
    const id=MF.id&&sid===MF.schlag_id?MF.id:uid();
    await put('massnahmen',id,{schlag_id:sid,wj:MF.wj,datum:MF.datum,typ:ty,status:MF.status,titel,notizen:MF.notizen,mittel,maschinen,lohn_eur:MF.lohn_eur,quelle:MF.quelle||'manuell',von:MF.von});
  }
  if(MF.id&&!MF.schlag_ids.includes(MF.schlag_id))await del('massnahmen',MF.id);
  toast((MF.schlag_ids.length>1?`${MF.schlag_ids.length} Maßnahmen gespeichert`:'Maßnahme gespeichert')+(MF.wj!==curWJ()?` (WJ ${MF.wj})`:''));
}

/* Stall-Formulare */
function milchForm(id,pre){
  const m=id?D.milch[id]:{monat:new Date().toISOString().slice(0,7),...(pre||{})};
  openSheet({title:id?'Milchgeld bearbeiten':'Milchgeldabrechnung',body:`<div class="fgrid">${F('k-m','Monat',m.monat,{type:'month'})}${F('k-kg','Liefermenge',m.menge_kg,{type:'num',unit:'kg'})}${F('k-ct','Auszahlungspreis',m.preis_ct,{type:'num',unit:'ct/kg netto'})}${F('k-eur','Milchgeld',m.milchgeld_eur,{type:'num',unit:'€ netto',ph:'leer = berechnet'})}${F('k-f','Fett',m.fett,{type:'num',unit:'%'})}${F('k-e','Eiweiß',m.eiweiss,{type:'num',unit:'%'})}${F('k-z','Zellzahl',m.zellzahl,{type:'num',unit:'Tsd.'})}${F('k-ku','Kühe gemolken',m.kuehe,{type:'num',unit:'Ø'})}${F('k-g','Gesamtgemelk',m.gemelk_kg,{type:'num',unit:'kg, inkl. Direktverm.',full:true,ph:'optional'})}${F('k-mo','Molkerei',m.molkerei||SET().molkerei)}${F('k-n','Notiz',m.notiz)}</div><div class="note">Milchleistung = Gesamtgemelk (sonst Liefermenge) ÷ Kühe ÷ Tage im Monat.</div>`,
   save:async()=>{const mo=val('k-m');if(!need(/^\d{4}-\d{2}$/.test(mo),'Bitte einen Monat wählen.'))return false;const nid=id||('m'+mo);await put('milch',nid,{monat:mo,menge_kg:nval('k-kg'),preis_ct:nval('k-ct'),milchgeld_eur:nval('k-eur'),fett:nval('k-f'),eiweiss:nval('k-e'),zellzahl:nval('k-z'),kuehe:nval('k-ku'),gemelk_kg:nval('k-g'),molkerei:val('k-mo'),notiz:val('k-n')});if(id&&id!==nid)await del('milch',id);toast('Milchgeld gespeichert')},
   del:id?()=>del('milch',id):null});
}
function dvForm(id,pre){
  const x=id?D.dv[id]:{datum:todayISO(),kanal:'Hofladen',...(pre||{})};
  openSheet({title:id?'Einnahme bearbeiten':'Direktvermarktung',body:`<datalist id="dl-prod">${['Rohmilch','Käse','Joghurt','Butter','Quark','Rindfleisch','Kalbfleisch','Eier'].map(p=>`<option value="${p}">`).join('')}</datalist><div class="fgrid">${F('v-d','Datum',x.datum,{type:'date'})}${F('v-k','Verkauf über',x.kanal,{type:'select',opts:DVKANAL})}${F('v-p','Produkt',x.produkt,{list:'dl-prod',full:true})}${F('v-m','Menge',x.menge,{type:'num'})}${F('v-e','Einheit',x.einheit||'l',{type:'select',opts:['l','kg','Stück','Pakete']})}${F('v-b','Betrag',x.betrag,{type:'num',unit:'€',full:true})}${F('v-n','Notiz',x.notiz,{full:true})}</div>`,
   save:async()=>{if(!need(nval('v-b')!=null,'Bitte einen Betrag eingeben.'))return false;await put('dv',id||uid(),{datum:val('v-d'),kanal:val('v-k'),produkt:val('v-p'),menge:nval('v-m'),einheit:val('v-e'),betrag:nval('v-b'),notiz:val('v-n')});toast('Einnahme gespeichert')},
   del:id?()=>del('dv',id):null});
}
function skForm(id,pre){
  const x=id?D.stallkosten[id]:{datum:todayISO(),kategorie:'Kraftfutter',...(pre||{})};
  openSheet({title:id?'Stallkosten bearbeiten':'Stallkosten',body:`<div class="fgrid">${F('s-d','Datum',x.datum,{type:'date'})}${F('s-k','Kategorie',x.kategorie,{type:'select',opts:STALLKAT})}${F('s-b','Betrag',x.betrag,{type:'num',unit:'€ netto',full:true})}${F('s-n','Notiz',x.notiz,{full:true,ph:'z. B. Lieferant, Menge'})}</div>`,
   save:async()=>{if(!need(nval('s-b')!=null,'Bitte einen Betrag eingeben.'))return false;await put('stallkosten',id||uid(),{datum:val('s-d'),kategorie:val('s-k'),betrag:nval('s-b'),notiz:val('s-n')});toast('Kosten gespeichert')},
   del:id?()=>del('stallkosten',id):null});
}
/* ---------- Markt ---------- */
function marktHist(){return L('markt').filter(d=>d.id.startsWith('tag-')).sort((a,b)=>a.datum.localeCompare(b.datum))}
function spark(vals){if(vals.length<2)return '';const W=90,H=26,mx=Math.max(...vals),mn=Math.min(...vals);const x=k=>2+k*(W-4)/(vals.length-1),y=v=>H-3-(v-mn)/((mx-mn)||1)*(H-6);const up=vals[vals.length-1]>=vals[0];
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" style="flex-shrink:0"><path d="${vals.map((v,k)=>(k?'L':'M')+x(k).toFixed(1)+' '+y(v).toFixed(1)).join('')}" fill="none" stroke="${up?'var(--pri)':'var(--warn)'}" stroke-width="1.8"/><circle cx="${x(vals.length-1)}" cy="${y(vals[vals.length-1])}" r="2.5" fill="${up?'var(--pri)':'var(--warn)'}"/></svg>`}
function eigeneVergleiche(werte){
  const out=[];const find=re=>werte.find(w=>re.test((w.id||'')+' '+(w.name||'')));
  [[/kas/i,/\bkas\b|kalkammon/i],[/harnstoff/i,/harnstoff/i],[/\bdap\b/i,/\bdap\b/i],[/kali/i,/kali/i]].forEach(([mre,wre])=>{const mi=L('mittel').find(m=>mre.test(m.name||'')&&m.einheit==='kg');const w=find(wre);if(mi&&w&&n0(w.wert)){const p=lastPrice(mi);if(p){const eig=n0(p.preis)*1000;const diff=eig-n0(w.wert);out.push(`<div class="row" style="cursor:default"><div class="main"><span class="t">${esc(mi.name)}</span><span class="sub">dein Einkauf ${fmtD(p.ab)}: ${eur(eig)}/t · Markt ${eur(n0(w.wert))}/t</span></div><span class="r ${diff>0?'warn':''}">${diff>0?'+':''}${eur(diff)}/t</span></div>`)}}});
  const wjA=L('anbau').filter(a=>a.wj===curWJ());[[/weizen/i,/weizen/i],[/raps/i,/raps/i],[/mais/i,/mais/i],[/gerste/i,/gerste/i]].forEach(([kre,wre])=>{const a=wjA.find(x=>kre.test(x.kultur||'')&&n0(x.preis_eur_dt));const w=find(wre);if(a&&w&&n0(w.wert)&&/€\/t/.test(w.einheit||'')){const m=n0(w.wert)/10;out.push(`<div class="row" style="cursor:default"><div class="main"><span class="t">${esc(a.kultur)}</span><span class="sub">dein Planpreis ${nf(n0(a.preis_eur_dt),2)} €/dt · Markt ${nf(m,2)} €/dt</span></div><span class="r ${n0(a.preis_eur_dt)>m?'warn':''}">${n0(a.preis_eur_dt)>m?'über Markt':'unter Markt'}</span></div>`)}});
  return out.join('');
}
function vMarkt(){
  const m=D.markt.aktuell;const hist=marktHist();
  const head=`<div class="head"><div><div class="eyebrow">${m?'Stand '+fmtD(m.stand)+(m.aktualisiert?' · aktualisiert '+fmtD(m.aktualisiert.slice(0,10))+' '+m.aktualisiert.slice(11,16):''):'Preise für Landwirtschaft'}</div><h1>Markt</h1></div></div>`;
  if(!m)return `<div class="page">${head}<div class="card empty"><b>Noch keine Marktdaten</b>Claude trägt hier jeden Morgen die aktuellen Preise ein: Weizen, Raps, Mais und Gerste (Börse und Erzeugerpreise), Dünger (KAS, Harnstoff, DAP, Kali), Milchpreis, Agrardiesel und mehr.<span class="note">Das startet, sobald die Claude-Auswertung eingerichtet ist (Anleitung, Teil E).</span></div></div>`;
  const allW=(m.gruppen||[]).flatMap(g=>g.werte||[]);const verg=eigeneVergleiche(allW);
  return `<div class="page">${head}
  ${m.kommentar?`<div class="card" style="gap:6px"><h2>Kurz zusammengefasst</h2><div style="font-size:14px;line-height:1.5">${esc(m.kommentar)}</div></div>`:''}
  ${(m.gruppen||[]).map(g=>`<div class="card tight"><div style="padding:12px 0 6px"><h2>${esc(g.name)}</h2></div>${(g.werte||[]).map(w=>{const hv=hist.map(h=>h.werte&&h.werte[w.id]).filter(v=>typeof v==='number');const ch=w.vorher!=null&&n0(w.vorher)?(n0(w.wert)-n0(w.vorher))/n0(w.vorher)*100:null;
    return `<div class="row" style="cursor:default;align-items:center"><div class="main"><span class="t">${esc(w.name)}</span><span class="sub">${esc([w.ort,w.datum&&w.datum!==m.stand?'Stand '+fmtD(w.datum):'',w.quelle].filter(Boolean).join(' · '))}${w.url?` · <a href="${esc(w.url)}" target="_blank" rel="noopener">Quelle</a>`:''}</span></div>${spark(hv.slice(-30))}<span class="r">${w.wert!=null?nf(n0(w.wert),n0(w.wert)<100?2:0):'–'} ${esc(w.einheit||'')}${ch!=null?`<br><span style="font-size:11px" class="${ch<0?'warn':''}">${ch>=0?'▲':'▼'} ${nf(Math.abs(ch),1)} %</span>`:''}</span></div>`}).join('')}</div>`).join('')}
  ${verg?`<div class="card"><h2>Im Vergleich zu deinen Preisen</h2><div class="rows">${verg}</div></div>`:''}
  <div class="note">Die Werte sucht Claude täglich aus öffentlichen Quellen zusammen (z. B. Euronext/Matif, agrarheute, Landwirtschaftskammern, BLE). Sie dienen der Orientierung. Für Verträge die Preise bei deinem Händler prüfen.${m.hinweis?' '+esc(m.hinweis):''}</div></div>`;
}

/* ---------- Herdenmanagement ---------- */
const TEV={mlp:['Probemelken (MLP)','var(--pri)'],kalbung:['Kalbung','var(--c-dueng)'],besamung:['Besamung','var(--info)'],trocken:['Trockengestellt','var(--c-saat)'],behandlung:['Behandlung','var(--bad)'],abgang:['Abgang','var(--fg2)'],notiz:['Notiz','var(--c-sonst)']};
const addDays=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return isoOf(x)};
const daysBetween=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
const tierName=t=>t?(t.name||t.ohrmarke||'Tier'):'?';
function tierEv(id){return L('tierdaten').filter(e=>e.tier_id===id).sort((a,b)=>(a.datum||'').localeCompare(b.datum||''))}
function tierInfo(t){
  const ev=tierEv(t.id);const last=a=>{for(let i=ev.length-1;i>=0;i--)if(ev[i].art===a)return ev[i];return null};
  const k=last('kalbung');const kalb=k&&(!t.letzte_kalbung||k.datum>=t.letzte_kalbung)?k.datum:t.letzte_kalbung||null;
  const lakt=k&&n0(k.laktation)?n0(k.laktation):n0(t.laktation);
  const mlp=last('mlp');const bes=last('besamung');const besAkt=bes&&(!kalb||bes.datum>kalb)?bes:null;
  const heute=todayISO();const dim=kalb&&t.status!=='jungvieh'?daysBetween(kalb,heute):null;
  const erw=besAkt&&besAkt.tragend!=='nein'?addDays(besAkt.datum,285):null;const trockenAb=erw?addDays(erw,-56):null;
  const besCount=kalb?ev.filter(e=>e.art==='besamung'&&e.datum>kalb).length:0;
  const h=[];
  if(t.status!=='abgang'){
    if(mlp&&n0(mlp.zellzahl)>200&&daysBetween(mlp.datum,heute)<60)h.push(['Zellzahl '+nf(n0(mlp.zellzahl))+' Tsd.','warn']);
    if(t.status==='laktierend'&&trockenAb&&daysBetween(heute,trockenAb)<=14)h.push([daysBetween(heute,trockenAb)<0?'Trockenstellen überfällig':'Trockenstellen am '+fmtD(trockenAb),'warn']);
    if(erw&&daysBetween(heute,erw)<=21&&daysBetween(heute,erw)>=-10)h.push(['Kalbung erwartet '+fmtD(erw),'mr']);
    if(t.status==='laktierend'&&dim!=null&&dim>=60&&!besAkt)h.push(['Besamen ('+dim+'. Tag)','mr']);
    if(besAkt&&besAkt.tragend!=='ja'&&besAkt.tragend!=='nein'&&daysBetween(besAkt.datum,heute)>=35)h.push(['Trächtigkeit prüfen','mr']);
    const wz=[...ev].reverse().find(e=>e.art==='behandlung'&&e.wartezeit_bis&&e.wartezeit_bis>=heute);if(wz)h.push(['Wartezeit bis '+fmtD(wz.wartezeit_bis),'warn']);
  }
  return {ev,kalb,lakt,mlp,besAkt,dim,erw,trockenAb,besCount,hinweise:h};
}
function herdeView(){
  const heute=todayISO();const alle=L('tiere');const f=S.herdeF||'aktiv';const q=(S.herdeQ||'').toLowerCase();
  const list=alle.filter(t=>(f==='aktiv'?t.status!=='abgang':f==='alle'?true:t.status===f)&&(!q||(t.name||'').toLowerCase().includes(q)||(t.ohrmarke||'').toLowerCase().includes(q))).map(t=>({t,i:tierInfo(t)}));
  const key=S.herdeSort||'name';
  list.sort((a,b)=>key==='milch'?n0(b.i.mlp&&b.i.mlp.milch_kg)-n0(a.i.mlp&&a.i.mlp.milch_kg):key==='zellzahl'?n0(b.i.mlp&&b.i.mlp.zellzahl)-n0(a.i.mlp&&a.i.mlp.zellzahl):key==='dim'?n0(b.i.dim)-n0(a.i.dim):tierName(a.t).localeCompare(tierName(b.t)));
  const lakt=alle.filter(t=>t.status==='laktierend').map(t=>tierInfo(t)).filter(i=>i.mlp&&daysBetween(i.mlp.datum,heute)<=45);
  const avg=k=>{const v=lakt.map(i=>n0(i.mlp[k])).filter(Boolean);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0};
  const cnt=st=>alle.filter(x=>x.status===st).length;
  const todo=alle.filter(t=>t.status!=='abgang').map(t=>({t,h:tierInfo(t).hinweise})).filter(x=>x.h.length);
  return `<div class="grid3"><div class="tile"><span class="l">Laktierend</span><span class="v num">${cnt('laktierend')}</span></div><div class="tile"><span class="l">Trocken</span><span class="v num">${cnt('trocken')}</span></div><div class="tile"><span class="l">Jungvieh</span><span class="v num">${cnt('jungvieh')}</span></div></div>
  <div class="card"><div class="card-h"><h2>Herden-Ø letzte MLP</h2><small>${lakt.length} Kühe</small></div>${lakt.length?`<div class="grid2" style="gap:8px"><div class="tile soft"><span class="l">Milch</span><span class="num">${nf(avg('milch_kg'),1)} kg</span></div><div class="tile soft"><span class="l">Zellzahl</span><span class="num ${avg('zellzahl')>200?'warn':''}">${nf(avg('zellzahl'))} Tsd.</span></div><div class="tile soft"><span class="l">Fett</span><span class="num">${nf(avg('fett'),2)} %</span></div><div class="tile soft"><span class="l">Eiweiß</span><span class="num">${nf(avg('eiweiss'),2)} %</span></div></div>`:'<span class="note">Noch keine Probemelk-Daten der letzten 45 Tage.</span>'}
   <div class="as-actions"><button class="btn pri sm" data-act="mlpBulk">MLP für alle erfassen</button><button class="btn sec sm" data-act="tierForm">+ Tier</button></div></div>
  ${todo.length?`<div class="card"><h2>Zu tun</h2><div class="rows">${todo.map(x=>`<button class="row" data-act="tier" data-id="${x.t.id}"><div class="main"><span class="t">${esc(tierName(x.t))}</span><span class="sub">${x.h.map(h=>`<span class="badge ${h[1]}" style="margin:2px 4px 0 0;display:inline-block">${esc(h[0])}</span>`).join('')}</span></div></button>`).join('')}</div></div>`:''}
  <label class="search" for="herdeq">${svgI(I.search,18,2)}<input id="herdeq" type="search" placeholder="Name oder Ohrmarke" value="${esc(S.herdeQ||'')}"></label>
  <div class="chips">${[['aktiv','Herde'],['laktierend','Laktierend'],['trocken','Trocken'],['jungvieh','Jungvieh'],['abgang','Abgänge']].map(([k,l])=>`<button class="chip ${f===k?'on':''}" data-act="herdeF" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="chips">${[['name','A–Z'],['milch','Milch'],['zellzahl','Zellzahl'],['dim','Laktationstag']].map(([k,l])=>`<button class="chip ${key===k?'on':''}" data-act="herdeSort" data-k="${k}" style="height:30px;font-size:12px">↕ ${l}</button>`).join('')}</div>
  <div class="card tight">${list.map(({t,i})=>`<button class="row" data-act="tier" data-id="${t.id}"><div class="main"><span class="t">${esc(tierName(t))}${t.name&&t.ohrmarke?` <span class="muted" style="font-weight:400;font-size:12px">${esc(t.ohrmarke)}</span>`:''}</span><span class="sub">${[t.status==='jungvieh'?(t.geburt?'geb. '+fmtD(t.geburt):'Jungvieh'):i.lakt?i.lakt+'. Lakt.':'',i.dim!=null&&t.status==='laktierend'?i.dim+'. Tag':'',t.status==='trocken'?'trocken':'',i.erw?'Kalbung ~'+fmtD(i.erw):''].filter(Boolean).join(' · ')}${i.hinweise.length?' · <span class="warn">'+esc(i.hinweise[0][0])+'</span>':''}</span></div>${i.mlp?`<span class="r">${nf(n0(i.mlp.milch_kg),1)} kg<br><span class="muted" style="font-size:11px">${n0(i.mlp.fett)?nf(n0(i.mlp.fett),1)+'/'+nf(n0(i.mlp.eiweiss),1)+' %':''}</span></span>`:''}</button>`).join('')||'<div class="empty">Keine Tiere in dieser Ansicht.</div>'}</div>
  <button class="btn dash" data-act="tierForm">+ Tier anlegen</button>`;
}
function vTier(){
  const t=D.tiere[S.sel];const backB=`<button class="back" data-act="back">${svgI(I.back,20,2)}Herde</button>`;
  if(!t)return `<div class="page">${backB}<div class="empty">Dieses Tier gibt es nicht mehr.</div></div>`;
  const i=tierInfo(t);const mlps=i.ev.filter(e=>e.art==='mlp'&&n0(e.milch_kg));
  let chart='';
  if(mlps.length>=2){const pts=mlps.slice(-12);const W=320,H=110,mx=Math.max(...pts.map(e=>n0(e.milch_kg)))*1.1,mn=Math.min(...pts.map(e=>n0(e.milch_kg)))*0.8;const x=k=>12+k*(W-24)/(pts.length-1),y=v=>H-8-(v-mn)/(mx-mn||1)*(H-24);
    chart=`<div class="card"><div class="card-h"><h2>Milchleistung</h2><small>kg je Probemelken</small></div><svg class="chart" viewBox="0 0 ${W} ${H+16}" width="100%" role="img" aria-label="Verlauf Milchleistung"><path d="${pts.map((e,k)=>(k?'L':'M')+x(k).toFixed(1)+' '+y(n0(e.milch_kg)).toFixed(1)).join('')}" fill="none" stroke="var(--pri)" stroke-width="2.5"/>${pts.map((e,k)=>`<circle cx="${x(k)}" cy="${y(n0(e.milch_kg))}" r="${k===pts.length-1?4.5:3}" fill="var(--pri)"/>`).join('')}<text x="${x(pts.length-1)}" y="${y(n0(pts[pts.length-1].milch_kg))-9}" text-anchor="end" style="font-weight:700;fill:var(--fg)">${nf(n0(pts[pts.length-1].milch_kg),1)} kg</text>${pts.map((e,k)=>k%Math.ceil(pts.length/6)===0||k===pts.length-1?`<text x="${x(k)}" y="${H+12}" text-anchor="middle">${fmtD(e.datum).slice(0,5)}</text>`:'').join('')}</svg></div>`}
  const alter=t.geburt?Math.floor(daysBetween(t.geburt,todayISO())/365.25):null;
  return `<div class="page">${backB}
  <div class="head"><div><h1>${esc(tierName(t))}</h1><div class="eyebrow">${[t.name&&t.ohrmarke?esc(t.ohrmarke):'',esc(t.rasse||''),alter!=null?alter+' Jahre':''].filter(Boolean).join(' · ')} <span class="badge ${t.status==='trocken'?'mr':t.status==='jungvieh'||t.status==='abgang'?'plan':''}">${esc(t.status||'')}</span></div></div><button class="icon-btn" data-act="tierForm" data-id="${t.id}" aria-label="Stammdaten bearbeiten">${svgI(I.edit,20,2)}</button></div>
  ${i.hinweise.length?`<div style="display:flex;gap:6px;flex-wrap:wrap">${i.hinweise.map(h=>`<span class="badge ${h[1]}">${esc(h[0])}</span>`).join('')}</div>`:''}
  <div class="grid2"><div class="tile"><span class="l">Laktation</span><span class="v num">${i.lakt||'–'}</span><span class="s">${i.kalb?'Kalbung '+fmtD(i.kalb):'keine Kalbung erfasst'}</span></div>
   <div class="tile"><span class="l">Laktationstag</span><span class="v num">${i.dim!=null&&t.status==='laktierend'?i.dim:'–'}</span><span class="s">${i.besAkt?'besamt '+fmtD(i.besAkt.datum)+(i.besAkt.tragend==='ja'?' · tragend':i.besAkt.tragend==='nein'?' · nicht tragend':''):'nicht besamt'}</span></div>
   <div class="tile"><span class="l">Letzte MLP</span><span class="v num">${i.mlp?nf(n0(i.mlp.milch_kg),1)+' kg':'–'}</span><span class="s">${i.mlp?[fmtD(i.mlp.datum),n0(i.mlp.fett)?'F '+nf(n0(i.mlp.fett),2)+' %':'',n0(i.mlp.eiweiss)?'E '+nf(n0(i.mlp.eiweiss),2)+' %':'',n0(i.mlp.zellzahl)?'ZZ '+nf(n0(i.mlp.zellzahl)):''].filter(Boolean).join(' · '):''}</span></div>
   <div class="tile"><span class="l">Erw. Kalbung</span><span class="v num" style="font-size:16px">${i.erw?fmtD(i.erw):'–'}</span><span class="s">${i.trockenAb?'trockenstellen ab '+fmtD(i.trockenAb):''}</span></div></div>
  ${chart}
  <div class="card"><h2>Erfassen</h2><div class="as-actions">${['mlp','kalbung','besamung','trocken','behandlung','notiz','abgang'].map(a=>`<button class="btn sec sm" data-act="evForm" data-tier="${t.id}" data-art="${a}">+ ${TEV[a][0].replace(' (MLP)','')}</button>`).join('')}</div></div>
  <div class="card"><h2>Verlauf</h2><div class="rows">${i.ev.slice().reverse().map(e=>`<button class="row" data-act="evForm" data-tier="${t.id}" data-art="${e.art}" data-id="${e.id}"><span class="dot" style="background:${TEV[e.art]?TEV[e.art][1]:'var(--c-sonst)'}"></span><div class="main"><span class="t">${esc(TEV[e.art]?TEV[e.art][0]:e.art)}</span><span class="sub">${fmtD(e.datum)} · ${esc(evDetail(e))}</span></div></button>`).join('')||'<div class="empty">Noch keine Einträge.</div>'}</div></div>
  ${t.notiz?`<div class="card"><h2>Notizen</h2><div style="font-size:14px;white-space:pre-wrap">${esc(t.notiz)}</div></div>`:''}</div>`;
}
function evDetail(e){
  if(e.art==='mlp')return [n0(e.milch_kg)?nf(n0(e.milch_kg),1)+' kg':'',n0(e.fett)?'Fett '+nf(n0(e.fett),2)+' %':'',n0(e.eiweiss)?'Eiweiß '+nf(n0(e.eiweiss),2)+' %':'',n0(e.zellzahl)?'ZZ '+nf(n0(e.zellzahl))+' Tsd.':'',n0(e.harnstoff)?'Harnstoff '+nf(n0(e.harnstoff)):''].filter(Boolean).join(' · ');
  if(e.art==='kalbung')return [e.laktation?e.laktation+'. Laktation':'',e.kalb_geschlecht?(e.kalb_geschlecht==='w'?'Kuhkalb':'Bullenkalb'):'',e.kalb_ohrmarke||'',e.verlauf||''].filter(Boolean).join(' · ');
  if(e.art==='besamung')return [e.bulle?'Bulle '+e.bulle:'',e.tragend==='ja'?'tragend':e.tragend==='nein'?'nicht tragend':'Trächtigkeit offen'].filter(Boolean).join(' · ');
  if(e.art==='behandlung')return [e.diagnose,e.medikament,e.wartezeit_bis?'Wartezeit bis '+fmtD(e.wartezeit_bis):'',n0(e.kosten)?eur(n0(e.kosten)):''].filter(Boolean).join(' · ');
  if(e.art==='abgang')return [e.grund,n0(e.erloes)?eur(n0(e.erloes)):''].filter(Boolean).join(' · ');
  return e.notiz||'';
}
function tierForm(id){
  const x=id?D.tiere[id]:{status:'laktierend'};
  openSheet({title:id?tierName(x):'Neues Tier',body:`<div class="fgrid">${F('t-n','Name',x.name)}${F('t-o','Ohrmarke',x.ohrmarke,{ph:'DE 08 …'})}${F('t-r','Rasse',x.rasse,{ph:'Fleckvieh, HF, Braunvieh …'})}${F('t-s','Status',x.status,{type:'select',opts:['laktierend','trocken','jungvieh','abgang']})}${F('t-g','Geburt',x.geburt,{type:'date'})}${F('t-v','Vater',x.vater)}${F('t-k','Letzte Kalbung',x.letzte_kalbung,{type:'date'})}${F('t-l','Laktation Nr.',x.laktation,{type:'num'})}${F('t-no','Notizen',x.notiz,{type:'textarea',full:true})}</div><div class="note">Kalbungen, Besamungen und Probemelken erfasst du danach im Tier selbst. Letzte Kalbung und Laktation werden dabei automatisch fortgeschrieben.</div>`,
   save:async()=>{if(!need(val('t-n')||val('t-o'),'Bitte Name oder Ohrmarke eingeben.'))return false;const nid=id||uid();await put('tiere',nid,{...x,name:val('t-n'),ohrmarke:val('t-o'),rasse:val('t-r'),status:val('t-s'),geburt:val('t-g'),vater:val('t-v'),letzte_kalbung:val('t-k'),laktation:nval('t-l'),notiz:val('t-no')});if(!id){S.stack.push({view:S.view,sel:S.sel});S.view='tier';S.sel=nid;render(true)}toast('Gespeichert')},
   del:id?async()=>{await del('tiere',id);for(const e of tierEv(id))await del('tierdaten',e.id);if(S.view==='tier')back()}:null});
}
function evForm(tierId,art,id){
  const t=D.tiere[tierId];const e=id?D.tierdaten[id]:{datum:todayISO(),art};const i=tierInfo(t);
  const f={mlp:F('e-kg','Milch',e.milch_kg,{type:'num',unit:'kg/Tag'})+F('e-f','Fett',e.fett,{type:'num',unit:'%'})+F('e-e','Eiweiß',e.eiweiss,{type:'num',unit:'%'})+F('e-z','Zellzahl',e.zellzahl,{type:'num',unit:'Tsd./ml'})+F('e-h','Harnstoff',e.harnstoff,{type:'num',unit:'ppm'}),
    kalbung:F('e-l','Laktation Nr.',e.laktation??((i.lakt||0)+1),{type:'num'})+F('e-v','Verlauf',e.verlauf||'leicht',{type:'select',opts:['leicht','mittel','schwer','Kaiserschnitt','Totgeburt']})+F('e-kg2','Kalb',e.kalb_geschlecht||'w',{type:'select',opts:[['w','Kuhkalb'],['m','Bullenkalb']]})+F('e-ko','Ohrmarke Kalb',e.kalb_ohrmarke)+(id?'':`<label class="fld full" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" id="e-neu" style="width:20px;height:20px" checked><span style="font-size:14px;color:var(--fg)">Kuhkalb als Jungvieh anlegen</span></label>`),
    besamung:F('e-b','Bulle',e.bulle)+F('e-t','Trächtig',e.tragend||'offen',{type:'select',opts:[['offen','noch offen'],['ja','ja, tragend'],['nein','nein']]})+F('e-bt','Besamungstechniker / Kosten',e.notiz,{full:true}),
    trocken:F('e-n','Notiz',e.notiz,{full:true,ph:'z. B. Trockensteller'}),
    behandlung:F('e-d','Diagnose',e.diagnose,{full:true,ph:'z. B. Mastitis hinten links'})+F('e-m','Medikament',e.medikament,{full:true})+F('e-w','Wartezeit Milch bis',e.wartezeit_bis,{type:'date'})+F('e-k','Kosten',e.kosten,{type:'num',unit:'€'})+(id?'':`<label class="fld full" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" id="e-sk" style="width:20px;height:20px" checked><span style="font-size:14px;color:var(--fg)">Kosten als Stallkosten (Tierarzt) buchen</span></label>`),
    abgang:F('e-g','Grund',e.grund||'Verkauf',{type:'select',opts:['Verkauf','Schlachtung','Verendet','Sonstiges']})+F('e-er','Erlös',e.erloes,{type:'num',unit:'€'}),
    notiz:F('e-n','Notiz',e.notiz,{type:'textarea',full:true})}[art]||'';
  openSheet({title:(id?'':'')+TEV[art][0]+' · '+tierName(t),body:`<div class="fgrid">${F('e-dat','Datum',e.datum,{type:'date'})}${f}</div>`,
   save:async()=>{const d={tier_id:tierId,art,datum:val('e-dat')||todayISO()};
     if(art==='mlp'){Object.assign(d,{milch_kg:nval('e-kg'),fett:nval('e-f'),eiweiss:nval('e-e'),zellzahl:nval('e-z'),harnstoff:nval('e-h')});if(d.milch_kg==null)return need(false,'Bitte die Milchmenge eingeben.')}
     if(art==='kalbung')Object.assign(d,{laktation:nval('e-l'),verlauf:val('e-v'),kalb_geschlecht:val('e-kg2'),kalb_ohrmarke:val('e-ko')});
     if(art==='besamung')Object.assign(d,{bulle:val('e-b'),tragend:val('e-t'),notiz:val('e-bt')});
     if(art==='trocken'||art==='notiz')d.notiz=val('e-n');
     if(art==='behandlung')Object.assign(d,{diagnose:val('e-d'),medikament:val('e-m'),wartezeit_bis:val('e-w'),kosten:nval('e-k')});
     if(art==='abgang')Object.assign(d,{grund:val('e-g'),erloes:nval('e-er')});
     const nid=id||uid();await put('tierdaten',nid,{...(e||{}),...d});
     if(!id){const up={...t};if(art==='kalbung'){up.status='laktierend';up.letzte_kalbung=d.datum;up.laktation=d.laktation}if(art==='trocken')up.status='trocken';if(art==='abgang')up.status='abgang';if(art==='mlp')up.mlp_kg=d.milch_kg;if(JSON.stringify(up)!==JSON.stringify(t))await put('tiere',t.id,up);
       if(art==='kalbung'&&$('#e-neu')&&$('#e-neu').checked&&d.kalb_geschlecht==='w')await put('tiere',uid(),{name:'',ohrmarke:d.kalb_ohrmarke||('Kalb von '+tierName(t)),status:'jungvieh',geburt:d.datum,rasse:t.rasse||'',mutter:t.id});
       if(art==='behandlung'&&n0(d.kosten)&&$('#e-sk')&&$('#e-sk').checked)await put('stallkosten',uid(),{datum:d.datum,kategorie:'Tierarzt & Medikamente',betrag:n0(d.kosten),notiz:tierName(t)+': '+(d.diagnose||'Behandlung')});}
     toast('Gespeichert')},
   del:id?()=>del('tierdaten',id):null});
}
function mlpBulk(){
  const kuehe=L('tiere').filter(t=>t.status==='laktierend').sort((a,b)=>tierName(a).localeCompare(tierName(b)));
  if(!kuehe.length)return toast('Keine laktierenden Kühe angelegt.');
  openSheet({title:'Probemelken für alle',body:`${F('mb-dat','Datum',todayISO(),{type:'date'})}<div class="note">Nur Kühe mit eingetragener Milchmenge werden gespeichert. Kommas gehen auch (z. B. 4,15).</div>
   <div class="scroll-x"><table class="tbl" style="font-size:13px"><thead><tr><th>Kuh</th><th>Milch kg</th><th>Fett %</th><th>Eiweiß %</th><th>ZZ Tsd.</th></tr></thead><tbody>${kuehe.map(t=>`<tr><td style="white-space:normal;min-width:90px"><b>${esc(tierName(t))}</b></td>${['kg','f','e','z'].map(k=>`<td><input id="mb-${k}-${t.id}" class="inp" inputmode="decimal" style="height:38px;width:68px;padding:0 6px"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
   saveLabel:'Alle speichern',save:async()=>{const d=val('mb-dat')||todayISO();let n=0;for(const t of kuehe){const kg=nval('mb-kg-'+t.id);if(kg==null)continue;await put('tierdaten',uid(),{tier_id:t.id,art:'mlp',datum:d,milch_kg:kg,fett:nval('mb-f-'+t.id),eiweiss:nval('mb-e-'+t.id),zellzahl:nval('mb-z-'+t.id)});await put('tiere',t.id,{...t,mlp_kg:kg});n++}toast(n+' Probemelk-Ergebnisse gespeichert')}});
}
function skostForm(id,pre){
  const x=id?D.sonstkosten[id]:{datum:todayISO(),...(pre||{})};
  openSheet({title:'Sonstige Kosten',body:`<div class="fgrid">${F('o-b','Bezeichnung',x.bezeichnung,{full:true})}${F('o-d','Datum',x.datum,{type:'date'})}${F('o-e','Betrag',x.betrag,{type:'num',unit:'€'})}${F('o-s','Schlag',x.schlag_id||'',{type:'select',opts:[['','ganzer Betrieb'],...schlagOpts()],full:true})}</div>`,
   save:async()=>{if(!need(val('o-b')&&nval('o-e')!=null,'Bitte Bezeichnung und Betrag eingeben.'))return false;await put('sonstkosten',id||uid(),{bezeichnung:val('o-b'),datum:val('o-d'),wj:wjOf(val('o-d')),betrag:nval('o-e'),schlag_id:val('o-s')||null});toast('Gespeichert')},
   del:id?()=>del('sonstkosten',id):null});
}

/* ---------- Assistent: Sprache & Foto ---------- */
let REC=null,AS={img:null,out:null,busy:false,ctrl:null,pos:null};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function stopRec(){if(REC){const r=REC;REC=null;try{r.stop()}catch(e){}}const b=$('#as-rec');if(b)b.classList.remove('rec')}
function openAssistant(mode){
  AS={img:null,out:null,busy:false,ctrl:null,pos:null};
  const voice=mode!=='photo'&&!!SR;
  openSheet({title:mode==='photo'?'Beleg fotografieren':'Was hast du gemacht?',body:`
   ${voice?`<button id="as-rec" class="recbtn" data-act="asMic" aria-label="Aufnahme starten oder stoppen">${svgI(I.mic,36,2)}</button><div class="note" id="as-hint" style="text-align:center">Sprich einfach los – zum Beenden nochmal tippen.</div>`:''}
   <textarea id="as-text" class="inp" rows="3" placeholder="${voice?'Hier erscheint, was du sagst – du kannst es auch korrigieren':'z. B. Heute Lange Äcker gegrubbert mit dem Grubber 4 m'}"></textarea>
   <div class="as-actions">${CFG.fotos?`<label class="btn sec" for="as-file" style="cursor:pointer">${svgI(I.cam,18,2)} Foto</label>`:''}<input type="file" id="as-file" accept="image/*" hidden><button class="btn pri" style="flex:1" data-act="asGo">${svgI(I.send,18,2)} Auswerten</button></div>
   <div id="as-loc" class="note"></div><div id="as-img"></div><div id="as-out" style="display:flex;flex-direction:column;gap:10px"></div>
   <div class="note">Beispiele: „Heute Lange Äcker gegrubbert mit dem Grubber“ · „Bachwiese 220 Kilo KAS gestreut“ · „Im Hofladen 40 Liter Milch für 60 Euro verkauft“</div>`,
   mount:()=>{const f=$('#as-file');f.onchange=()=>{const file=f.files&&f.files[0];if(!file)return;AS.img=file;$('#as-img').innerHTML=`<img class="thumb" src="${URL.createObjectURL(file)}" alt="Ausgewähltes Foto">`;asGo()};
     if(mode==='photo')setTimeout(()=>f.click(),50);else if(!voice)setTimeout(()=>$('#as-text').focus(),60);
     if(navigator.geolocation&&L('schlaege').some(x=>x.geo))navigator.geolocation.getCurrentPosition(p=>{AS.pos=[p.coords.longitude,p.coords.latitude];const sc=schlagAt(AS.pos[0],AS.pos[1]);AS.here=sc||null;const el=$('#as-loc');if(el)el.textContent=sc?'📍 Du stehst auf: '+sc.name:''},()=>{},{enableHighAccuracy:true,timeout:8000,maximumAge:60000})}});
  if(voice)startRec();
}
function startRec(){
  const ta=$('#as-text'),b=$('#as-rec');if(!ta||!SR)return;
  try{
    const r=new SR();REC=r;r.lang='de-DE';r.interimResults=true;r.continuous=true;r.maxAlternatives=1;
    const base=ta.value?ta.value.trim()+' ':'';let finalTxt='';
    r.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalTxt+=t+' ';else interim+=t}ta.value=(base+finalTxt+interim).replace(/\s+/g,' ').trimStart()};
    r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast('Mikrofon nicht erlaubt. Bitte in den Einstellungen des Browsers für diese Seite freigeben (iPhone: Einstellungen → Safari → Mikrofon; außerdem Siri & Diktieren einschalten).',7000)}else if(e.error==='no-speech')toast('Nichts gehört – nochmal tippen und sprechen.');else if(e.error!=='aborted')toast('Spracherkennung: '+e.error)};
    r.onend=()=>{const was=REC===r;REC=null;if(b)b.classList.remove('rec');const h=$('#as-hint');if(h)h.textContent='Zum erneuten Sprechen tippen.';if(was!==null&&ta.value.trim()&&!AS.busy&&!AS.out)asGo()};
    r.start();if(b)b.classList.add('rec');const h=$('#as-hint');if(h)h.textContent='Ich höre zu … zum Beenden tippen.';
  }catch(e){REC=null;toast('Spracherkennung konnte nicht starten.')}
}
function asMic(){if(REC){stopRec()}else{AS.out=null;startRec()}}
function ctxForAI(){
  const wj=curWJ();
  return {heute:todayISO(),wirtschaftsjahr:wj,
   schlaege:L('schlaege').map(s=>({id:s.id,name:s.name,ha:n0(s.flaeche_ha),flurstueck:s.flurstueck||undefined,kultur:anbauFor(s.id,wj)?.kultur||undefined})),
   maschinen:L('maschinen').map(m=>({id:m.id,name:m.name,abrechnung:m.einheit==='h'?'h':'ha',satz:n0(m.kostensatz)})),
   mittel:L('mittel').map(m=>({id:m.id,name:m.name,kategorie:m.kategorie,einheit:m.einheit,preis:lastPrice(m)?.preis}))};
}
const AI_SCHEMA=`{"aktionen":[ /* eine oder mehrere, je nach Inhalt */
 {"art":"massnahme","schlag_ids":["id",...],"datum":"YYYY-MM-DD","typ":"bodenbearbeitung|aussaat|duengung|pflanzenschutz|ernte|sonstiges","status":"erledigt|geplant","titel":"kurz","notizen":"",
  "mittel":[{"mittel_id":"id oder null","name":"Name","kategorie":"duenger|psm|saatgut|sonstiges","menge_pro_ha":Zahl,"einheit":"kg|l|t|m³|U","preis":Zahl oder null}],
  "maschinen":[{"maschine_id":"id oder null","name":"Name","abrechnung":"ha|h","menge":Zahl oder null}]},
 {"art":"einkauf","datum":"YYYY-MM-DD","haendler":"","summe":Zahl,"positionen":[{"mittel_id":"id oder null","name":"","kategorie":"duenger|psm|saatgut|sonstiges","menge":Zahl,"einheit":"kg|l|t|U","preis_einheit":Zahl}]},
 {"art":"milch","monat":"YYYY-MM","menge_kg":Zahl,"preis_ct":Zahl,"milchgeld_eur":Zahl,"fett":Zahl,"eiweiss":Zahl,"zellzahl":Zahl,"kuehe":Zahl,"molkerei":""},
 {"art":"direktvermarktung","datum":"YYYY-MM-DD","produkt":"","menge":Zahl,"einheit":"l|kg|Stück","betrag":Zahl,"kanal":"Hofladen|Milchtankstelle|Wochenmarkt|Lieferung|Sonstiges"},
 {"art":"stallkosten","datum":"YYYY-MM-DD","kategorie":"${STALLKAT.join('|')}","betrag":Zahl,"notiz":""},
 {"art":"kosten","datum":"YYYY-MM-DD","bezeichnung":"","betrag":Zahl,"schlag_id":"id oder null"}
],"hinweis":"kurzer Satz auf Deutsch: was du verstanden hast oder was fehlt"}`;
async function asGo(){
  if(AS.busy)return;const text=val('as-text');
  if(!text&&!AS.img)return toast('Bitte etwas sagen, tippen oder ein Foto wählen.');
  stopRec();
  if(!(CFG.kiFunktion&&SAMPLE&&navigator.onLine)){if(AS.img)return toInbox();AS.out=parseLocal(text);AS.out.aktionen.forEach(a=>a._id=uid());drawAS();return}
  return asGoKI();
}
async function asGoKI(){
  if(AS.busy)return;const text=val('as-text');
  if(!text&&!AS.img)return toast('Bitte etwas sagen, tippen oder ein Foto wählen.');
  if(!SAMPLE)return asMsg('Die KI-Auswertung ist im Demo-Modus nicht verfügbar. Sobald die App mit Supabase verbunden ist, funktioniert sie.');
  if(AS.img&&!S.imgOK)return asMsg('Fotos können in dieser Ansicht nicht an die KI gesendet werden.');
  stopRec();AS.busy=true;asMsg('<span class="spin"></span> Wird ausgewertet …');
  const prompt=`Du bist die Erfassungshilfe einer Ackerschlagkartei mit Milchvieh-Stall auf einem landwirtschaftlichen Betrieb in Deutschland. Wandle die Eingabe in strukturierte Buchungen um.
Regeln:
- Ordne Schläge, Maschinen und Mittel den IDs aus den Stammdaten zu (unscharf: Tippfehler, Kurzformen, Spracherkennungsfehler). Unbekanntes: id null und Name übernehmen.
- Datum: „heute“=${todayISO()}, „gestern“ usw. relativ dazu. Ohne Angabe: heute.
- Grubbern, Pflügen, Eggen, Mulchen, Walzen = bodenbearbeitung. Streuen von Dünger, Gülle, Mist = duengung. Spritzen = pflanzenschutz. Drillen/Säen/Legen = aussaat. Dreschen/Häckseln/Roden = ernte.
- Maschinen: Menge bei Abrechnung ha = null (ganze Fläche), bei h = Stunden je Schlag, sonst null.
- Mittel-Menge immer je Hektar. Wird eine Gesamtmenge genannt, durch die Fläche des Schlags teilen. Preis nur setzen, wenn genannt oder auf dem Beleg.
- Rechnung/Lieferschein für Dünger, PSM, Saatgut → art "einkauf" mit Netto-Preis je Einheit. Milchgeldabrechnung → art "milch" (Netto). Futter, Tierarzt usw. → "stallkosten". Verkäufe ab Hof → "direktvermarktung".
- Erfinde nichts. Fehlt Wesentliches (z. B. Schlag unklar), trotzdem die Aktion liefern und es im hinweis sagen.
Stammdaten: ${JSON.stringify(ctxForAI())}${AS.here?'\nGPS: Der Nutzer steht gerade auf dem Schlag "'+AS.here.name+'" (id '+AS.here.id+'). Wenn kein Schlag genannt wird oder von „hier“/„dieser Fläche“ die Rede ist, nimm diesen Schlag.':''}
${text?'Eingabe: """'+text+'"""':'Keine Texteingabe.'}${AS.img?'\nDas Foto ist ein Beleg oder eine Notiz vom Betrieb (Rechnung, Lieferschein, Milchgeldabrechnung, Etikett o. ä.). Lies es aus.':''}
Antworte NUR mit JSON in genau dieser Form (Kommentare weglassen):
${AI_SCHEMA}`;
  try{AS.ctrl=new AbortController();const r=await SAMPLE.json(prompt,{modelTier:AS.img?'default':'default',signal:AS.ctrl.signal,images:AS.img?[AS.img]:undefined,cache:false});AS.out=r&&Array.isArray(r.aktionen)?r:{aktionen:[],hinweis:'Ich konnte nichts erkennen.'};AS.out.aktionen.forEach(a=>a._id=uid());drawAS()}
  catch(e){const c=e&&e.code;asMsg(c==='offline'?'Du bist offline. Der Text bleibt stehen – auswerten, sobald wieder Netz da ist, oder über „+ Neu“ von Hand erfassen.':c==='rate_limited'?'Gerade zu viele Anfragen – bitte gleich noch einmal.':c==='not_member'?'Du bist für diesen Betrieb nicht freigeschaltet.':c==='no_api_key'?'Der KI-Schlüssel ist in Supabase noch nicht hinterlegt (siehe Anleitung).':'Das hat nicht geklappt ('+esc(c||'Fehler')+'). Bitte nochmal versuchen.')}
  finally{AS.busy=false}
}
function asMsg(h){const o=$('#as-out');if(o)o.innerHTML=`<div class="note box">${h}</div>`}
function asDesc(a){
  const sn=id=>D.schlaege[id]?.name||'?';
  if(a.art==='massnahme')return {k:'Maßnahme · '+(TYP[a.typ]?.[0]||a.typ),t:(a.titel||TYP[a.typ]?.[0]||'Maßnahme')+' · '+fmtD(a.datum),li:[(a.schlag_ids||[]).length?'Schlag: '+a.schlag_ids.map(sn).join(', '):'<span class="warn">Kein Schlag erkannt</span>',...(a.mittel||[]).map(x=>`${esc(x.name)} ${nf(n0(x.menge_pro_ha),1)} ${esc(x.einheit||'')}/ha${x.preis!=null?' × '+nf(n0(x.preis),2)+' €':''}${x.mittel_id?'':' <i>(neu)</i>'}`),...(a.maschinen||[]).map(y=>`${esc(y.name)}${y.menge?' · '+nf(n0(y.menge),1)+' '+(y.abrechnung==='h'?'h':'ha'):''}${y.maschine_id?'':' <i>(neu)</i>'}`),a.status==='geplant'?'Status: geplant':'']};
  if(a.art==='einkauf')return {k:'Einkauf → Preise',t:(a.haendler||'Einkauf')+' · '+fmtD(a.datum)+(a.summe?' · '+eur(a.summe):''),li:(a.positionen||[]).map(p=>`${esc(p.name)}: ${nf(n0(p.menge),1)} ${esc(p.einheit||'')} × ${nf(n0(p.preis_einheit),2)} €${p.mittel_id?'':' <i>(neues Mittel)</i>'}`)};
  if(a.art==='milch')return {k:'Milchgeld',t:(a.monat?MON[+a.monat.slice(5,7)-1]+' '+a.monat.slice(0,4):'Monat?'),li:[a.menge_kg?nf(a.menge_kg)+' kg':'',a.preis_ct?nf(a.preis_ct,2)+' ct/kg':'',a.milchgeld_eur?eur(a.milchgeld_eur):'',a.fett?'Fett '+nf(a.fett,2)+' %':'',a.eiweiss?'Eiweiß '+nf(a.eiweiss,2)+' %':''].filter(Boolean)};
  if(a.art==='direktvermarktung')return {k:'Direktvermarktung',t:(a.produkt||'Verkauf')+' · '+eur(n0(a.betrag)),li:[fmtD(a.datum),a.menge?nf(n0(a.menge),1)+' '+esc(a.einheit||''):'',esc(a.kanal||'')].filter(Boolean)};
  if(a.art==='stallkosten')return {k:'Stallkosten',t:(a.kategorie||'Kosten')+' · '+eur(n0(a.betrag)),li:[fmtD(a.datum),esc(a.notiz||'')].filter(Boolean)};
  if(a.art==='kosten')return {k:'Sonstige Kosten',t:(a.bezeichnung||'Kosten')+' · '+eur(n0(a.betrag)),li:[fmtD(a.datum),a.schlag_id?sn(a.schlag_id):'ganzer Betrieb']};
  return {k:a.art,t:'Unbekannt',li:[]};
}
function drawAS(){
  const o=$('#as-out');if(!o)return;const acts=AS.out.aktionen;
  o.innerHTML=`${AS.out.hinweis?`<div class="note box">${esc(AS.out.hinweis)}</div>`:''}${acts.map(a=>{const d=asDesc(a);return `<div class="as-card ${a._done?'done':''}"><span class="k">${esc(d.k)}</span><span class="t">${esc(d.t)}</span>${d.li.length?`<ul>${d.li.map(l=>`<li>${l}</li>`).join('')}</ul>`:''}${a._done?'<span class="note">✓ übernommen</span>':`<div class="as-actions"><button class="btn pri sm" data-act="asSave" data-id="${a._id}">Übernehmen</button><button class="btn sec sm" data-act="asEdit" data-id="${a._id}">Bearbeiten</button></div>`}</div>`}).join('')}${acts.filter(a=>!a._done).length>1?`<button class="btn pri" data-act="asSaveAll">Alle übernehmen</button>`:''}${CFG.fotos&&!AS.img&&val('as-text')&&!acts.some(a=>a._done)?`<button class="btn ghost sm" data-act="asInbox" style="align-self:flex-start">Stattdessen an Claude schicken (Auswertung innerhalb 1 Std.)</button>`:''}`;
}
const fixIds=(col,id)=>id&&D[col][id]?id:null;
async function asApply(a,edit){
  if(a.art==='massnahme'){
    const sids=(a.schlag_ids||[]).filter(id=>D.schlaege[id]);
    const pre={schlag_ids:sids,datum:a.datum||todayISO(),typ:TYP[a.typ]?a.typ:'sonstiges',status:a.status==='geplant'?'geplant':'erledigt',titel:a.titel||'',notizen:a.notizen||'',quelle:AS.img?'foto':'sprache',
      mittel:(a.mittel||[]).map(x=>{const id=fixIds('mittel',x.mittel_id);const mi=D.mittel[id];const p=mi?priceAt(mi,a.datum):null;return {mittel_id:id||'',name:mi?mi.name:x.name,kategorie:mi?mi.kategorie:(KAT[x.kategorie]?x.kategorie:'sonstiges'),einheit:mi?mi.einheit:x.einheit||'kg',menge_pro_ha:n0(x.menge_pro_ha),preis:x.preis!=null?n0(x.preis):(p?p.preis:null),preis_manuell:x.preis!=null}}),
      maschinen:(a.maschinen||[]).map(y=>{const id=fixIds('maschinen',y.maschine_id);const m=D.maschinen[id];return {maschine_id:id||'',name:m?m.name:y.name,abrechnung:m?(m.einheit==='h'?'h':'ha'):(y.abrechnung==='h'?'h':'ha'),menge:y.menge!=null?n0(y.menge):null,satz:m?n0(m.kostensatz):0}})};
    if(edit||!sids.length){closeSheet();massForm(pre);if(!sids.length)toast('Bitte den Schlag auswählen.');return 'form'}
    MF={...pre,wj:wjOf(pre.datum,pre.typ)};
    // unbekannte Maschinen ohne Namen raus
    MF.maschinen=MF.maschinen.filter(y=>y.maschine_id||y.name);
    await saveMass(false);return true;
  }
  if(a.art==='einkauf'){
    if(edit){closeSheet();const p=(a.positionen||[])[0];if(p){const id=fixIds('mittel',p.mittel_id);if(id){mittelDetail(id);setTimeout(()=>{$('#np-p').value=fmtIn(p.preis_einheit);$('#np-ab').value=a.datum||todayISO();$('#np-h').value=a.haendler||'';$('#np-m').value=fmtIn(p.menge)},30);return 'form'}}S.seg='mittel';go('betrieb');return 'form'}
    const pos=[];
    for(const p of a.positionen||[]){let id=fixIds('mittel',p.mittel_id);if(!id&&p.name){const ex=L('mittel').find(m=>m.name.toLowerCase()===p.name.toLowerCase());id=ex?ex.id:null;if(!id){id=uid();await put('mittel',id,{name:p.name,kategorie:KAT[p.kategorie]?p.kategorie:'sonstiges',einheit:p.einheit||'kg',haendler:a.haendler||'',preise:[]})}}
      if(id&&p.preis_einheit!=null)await addPrice(id,{ab:a.datum||todayISO(),preis:n0(p.preis_einheit),haendler:a.haendler||'',menge:n0(p.menge)},true);
      pos.push({mittel_id:id,name:p.name,menge:n0(p.menge),einheit:p.einheit,preis_einheit:n0(p.preis_einheit)})}
    await put('einkauf',uid(),{datum:a.datum||todayISO(),haendler:a.haendler||'',summe:n0(a.summe)||pos.reduce((s,p)=>s+p.menge*p.preis_einheit,0),positionen:pos});toast('Einkauf und Preise gespeichert');return true;
  }
  if(a.art==='milch'){const pre={monat:a.monat,menge_kg:a.menge_kg,preis_ct:a.preis_ct,milchgeld_eur:a.milchgeld_eur,fett:a.fett,eiweiss:a.eiweiss,zellzahl:a.zellzahl,kuehe:a.kuehe,molkerei:a.molkerei};const ex=L('milch').find(m=>m.monat===a.monat);if(edit||!a.monat){closeSheet();milchForm(ex?ex.id:null,pre);return 'form'}await put('milch',ex?ex.id:'m'+a.monat,{...(ex||{}),...Object.fromEntries(Object.entries(pre).filter(([k,v])=>v!=null&&v!==''))});toast('Milchgeld gespeichert');return true}
  if(a.art==='direktvermarktung'){const pre={datum:a.datum||todayISO(),produkt:a.produkt,menge:a.menge,einheit:a.einheit,betrag:a.betrag,kanal:DVKANAL.includes(a.kanal)?a.kanal:'Hofladen'};if(edit||a.betrag==null){closeSheet();dvForm(null,pre);return 'form'}await put('dv',uid(),pre);toast('Einnahme gespeichert');return true}
  if(a.art==='stallkosten'){const pre={datum:a.datum||todayISO(),kategorie:STALLKAT.includes(a.kategorie)?a.kategorie:'Sonstiges',betrag:a.betrag,notiz:a.notiz};if(edit||a.betrag==null){closeSheet();skForm(null,pre);return 'form'}await put('stallkosten',uid(),pre);toast('Kosten gespeichert');return true}
  if(a.art==='kosten'){const pre={datum:a.datum||todayISO(),bezeichnung:a.bezeichnung,betrag:a.betrag,schlag_id:fixIds('schlaege',a.schlag_id)};if(edit||a.betrag==null){closeSheet();skostForm(null,pre);return 'form'}await put('sonstkosten',uid(),{...pre,wj:wjOf(pre.datum)});toast('Kosten gespeichert');return true}
  return false;
}

/* ---------- Eigene Spracherkennung (ohne KI, kostenlos) ---------- */
const nrm=t=>String(t||'').toLowerCase().replace(/(\d)\.(\d{3})(?!\d)/g,'$1$2').replace(/€/g,' euro ').replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/(\d)\s*,\s*(\d)/g,'$1.$2').replace(/[^a-z0-9.\s/]/g,' ').replace(/(\D)\.|\.(\D)/g,'$1 $2').replace(/\s+/g,' ').trim();
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m||!n)return m||n;let prev=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[n]}
const sim=(a,b)=>!a||!b?0:1-lev(a,b)/Math.max(a.length,b.length);
function phraseScore(words,name){const nw=name.split(' ').filter(Boolean);if(!nw.length)return 0;let best=0;for(let k=Math.max(1,nw.length-1);k<=nw.length+1;k++)for(let i=0;i+k<=words.length;i++){const sc=sim(words.slice(i,i+k).join(' '),name);if(sc>best)best=sc}return best}
const TOOLS=[['grubb','grubber','Grubbern','bodenbearbeitung'],['pflueg','pflug','Pflügen','bodenbearbeitung'],['pflug','pflug','Pflügen','bodenbearbeitung'],['geeggt','egge','Eggen','bodenbearbeitung'],['eggen','egge','Eggen','bodenbearbeitung'],['mulch','mulcher','Mulchen','bodenbearbeitung'],['gewalzt','walze','Walzen','bodenbearbeitung'],['walzen','walze','Walzen','bodenbearbeitung'],['stoppel','grubber','Stoppelbearbeitung','bodenbearbeitung'],['gedrillt','drill','Aussaat','aussaat'],['drillen','drill','Aussaat','aussaat'],['gesaet','drill','Aussaat','aussaat'],['saeen','drill','Aussaat','aussaat'],['aussaat','drill','Aussaat','aussaat'],['eingesaet','drill','Aussaat','aussaat'],['gelegt','leg','Legen','aussaat'],['gespritzt','spritze','Pflanzenschutz','pflanzenschutz'],['spritzen','spritze','Pflanzenschutz','pflanzenschutz'],['herbizid','spritze','Herbizid','pflanzenschutz'],['fungizid','spritze','Fungizid','pflanzenschutz'],['insektizid','spritze','Insektizid','pflanzenschutz'],['gestreut','streuer','Düngung','duengung'],['streuen','streuer','Düngung','duengung'],['gedueng','streuer','Düngung','duengung'],['duengen','streuer','Düngung','duengung'],['guelle','guelle','Gülle','duengung'],['mist','miststreuer','Mist','duengung'],['gekalkt','streuer','Kalkung','duengung'],['gedrosch','drescher','Ernte','ernte'],['dreschen','drescher','Ernte','ernte'],['gehaeckselt','haecksler','Ernte','ernte'],['gerodet','roder','Ernte','ernte'],['geerntet','drescher','Ernte','ernte'],['ernte','drescher','Ernte','ernte'],['gemaeht','maehwerk','Mähen','ernte'],['gepresst','presse','Pressen','ernte']];
const UNITS={kilo:'kg',kilogramm:'kg',kg:'kg',liter:'l',l:'l',tonnen:'t',tonne:'t',t:'t',kubik:'m³',kubikmeter:'m3',m3:'m³',einheiten:'U',einheit:'U',u:'U',sack:'Sack',saecke:'Sack',doppelzentner:'dz',dz:'dz'};
const WTAGE=['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'];
const MONATE=['januar','februar','maerz','april','mai','juni','juli','august','september','oktober','november','dezember'];
const isoOf=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
function parseDatum(t,raw){const d=new Date();let geplant=false;
  if(/\bvorgestern\b/.test(t))d.setDate(d.getDate()-2);else if(/\bgestern\b/.test(t))d.setDate(d.getDate()-1);else if(/\buebermorgen\b/.test(t)){d.setDate(d.getDate()+2);geplant=true}else if(/\bmorgen\b/.test(t)&&!/heute morgen/.test(t)){d.setDate(d.getDate()+1);geplant=true}
  let m=String(raw||'').match(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/);
  const mn=t.match(/\b(\d{1,2})\s(januar|februar|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/);if(!m&&mn)m=[0,mn[1],String(MONATE.indexOf(mn[2])+1)];
  if(m&&+m[2]>=1&&+m[2]<=12&&+m[1]>=1&&+m[1]<=31){let y=m[3]?+m[3]:d.getFullYear();if(y<100)y+=2000;const x=new Date(y,+m[2]-1,+m[1]);if(x>new Date())geplant=true;return {datum:isoOf(x),geplant}}
  const wt=WTAGE.findIndex(w=>new RegExp('\\b(am |letzten )?'+w+'\\b').test(t));if(wt>=0){let diff=(d.getDay()-wt+7)%7;d.setDate(d.getDate()-diff)}
  if(/\b(geplant|plane|planen|naechste woche|soll)\b/.test(t))geplant=true;
  return {datum:isoOf(d),geplant}}
function parseLocal(raw){
  const t=nrm(raw);const words=t.split(' ');const out=[];const notes=[];
  const euroM=t.match(/(\d+(?:\.\d+)?)\s*(euro|eur)\b/);const euro=euroM?+euroM[1]:null;
  const {datum,geplant}=parseDatum(t,raw);
  // Stall & Direktvermarktung
  if(euro!=null&&/(verkauf|hofladen|milchtankstelle|wochenmarkt|\bmarkt\b|direktverm|ab hof)/.test(t)){
    const prod=[['kaese','Käse'],['joghurt','Joghurt'],['butter','Butter'],['quark','Quark'],['fleisch','Rindfleisch'],['eier','Eier'],['milch','Rohmilch']].find(([k])=>t.includes(k));
    const mm=t.match(/(\d+(?:\.\d+)?)\s*(liter|l|kilo|kg|stueck|pakete)\b/);
    out.push({art:'direktvermarktung',datum,produkt:prod?prod[1]:'',menge:mm?+mm[1]:null,einheit:mm?({liter:'l',l:'l',kilo:'kg',kg:'kg',stueck:'Stück',pakete:'Pakete'}[mm[2]]):'l',betrag:euro,kanal:/milchtankstelle/.test(t)?'Milchtankstelle':/markt/.test(t)?'Wochenmarkt':/liefer/.test(t)?'Lieferung':'Hofladen'});
    return {aktionen:out,hinweis:'Als Einnahme aus der Direktvermarktung erkannt.'}}
  if(euro!=null&&/(milchgeld|molkerei)/.test(t)){const mi=MONATE.findIndex(x=>t.includes(x));const d=new Date();let mon=mi>=0?mi:d.getMonth()-1,y=d.getFullYear();if(mon<0){mon=11;y--}if(mi>=0&&mi>d.getMonth())y--;const kg=t.match(/(\d+(?:\.\d+)?)\s*(kilo|kg|liter)\b/);const ct=t.match(/(\d+(?:\.\d+)?)\s*cent\b/);
    out.push({art:'milch',monat:y+'-'+String(mon+1).padStart(2,'0'),milchgeld_eur:euro,menge_kg:kg?+kg[1]:null,preis_ct:ct?+ct[1]:null});return {aktionen:out,hinweis:'Als Milchgeld erkannt.'}}
  const sk=[['tierarzt','Tierarzt & Medikamente'],['medikament','Tierarzt & Medikamente'],['besamung','Besamung'],['mineral','Mineralfutter'],['kraftfutter','Kraftfutter'],['grundfutter','Grundfutter'],['futter','Kraftfutter'],['einstreu','Einstreu'],['strom','Energie & Wasser'],['wasser','Energie & Wasser'],['melk','Melktechnik']].find(([k])=>t.includes(k));
  if(euro!=null&&sk){out.push({art:'stallkosten',datum,kategorie:sk[1],betrag:euro,notiz:raw.trim().slice(0,120)});return {aktionen:out,hinweis:'Als Stallkosten erkannt.'}}
  // Ackerbau: Schläge
  const sc=L('schlaege').map(s=>({s,v:phraseScore(words,nrm(s.name))})).sort((a,b)=>b.v-a.v);
  let schl=sc.filter(x=>x.v>=0.86).map(x=>x.s);if(!schl.length&&sc[0]&&sc[0].v>=0.74)schl=[sc[0].s];
  const fl=t.match(/flurstueck\s*(?:nummer\s*)?([0-9/]+)/);if(fl){const f=L('schlaege').find(s=>nrm(s.flurstueck)===fl[1]);if(f&&!schl.includes(f))schl.push(f)}
  if(!schl.length&&AS.here&&/(hier|diese[mnr]? flaeche|diesem schlag|da\b)/.test(t)||!schl.length&&AS.here){schl=[AS.here];notes.push('Schlag über deinen Standort erkannt: '+AS.here.name+'.')}
  // Art der Arbeit
  const tool=TOOLS.find(([k])=>words.some(w=>w.startsWith(k)||w.includes(k)));
  let typ=tool?tool[3]:null;
  // Mittel
  const amounts=[...t.matchAll(/(\d+(?:\.\d+)?)\s*(kilogramm|kilo|kg|liter|l|tonnen|tonne|t|kubikmeter|kubik|m3|einheiten|einheit|u|saecke|sack|doppelzentner|dz)\b(\s*(pro|je|\/|per)\s*(hektar|ha))?/g)].map(m=>({v:+m[1],u:UNITS[m[2]],perHa:!!m[3],idx:m.index,end:m.index+m[0].length}));
  const mitteln=[];
  L('mittel').forEach(mi=>{const tok=nrm(mi.name).split(' ').filter(w=>w.length>=3&&!/^\d/.test(w));if(!tok.length)return;const main=tok[0];let bi=-1,bv=0;words.forEach((w,i)=>{const v=sim(w,main);if(v>bv){bv=v;bi=i}});if(bv>=(main.length<=4?0.99:0.84))mitteln.push({mi,main,full:phraseScore(words,nrm(mi.name)),pos:words.slice(0,bi).join(' ').length})});
  {const best={};mitteln.forEach(m=>{if(!best[m.main]||m.full>best[m.main].full)best[m.main]=m});mitteln.splice(0,mitteln.length,...Object.values(best))}
  mitteln.sort((a,b)=>a.pos-b.pos);
  const totalHa=schl.reduce((a,s)=>a+n0(s.flaeche_ha),0);
  const mittelOut=[];
  amounts.forEach((am,i)=>{if(am.u==='dz')return;let m=mitteln[i]||null;let name='';if(!m){const after=t.slice(am.end).trim().split(' ').filter(w=>!['pro','je','hektar','ha','von','mit','an'].includes(w))[0]||'';if(after&&after.length>=3&&!/^\d/.test(after)){const ex=L('mittel').find(x=>sim(nrm(x.name).split(' ')[0],after)>=0.84);if(ex)m={mi:ex};else name=after.toUpperCase().length<=4?after.toUpperCase():after[0].toUpperCase()+after.slice(1)}}
    let menge=am.v;if(am.u==='t'){menge*=1000}const unit=am.u==='t'?'kg':am.u;const near=t.slice(Math.max(0,am.idx-25),am.end+35);const perHa=am.perHa||/(pro|je|per|\/)\s*(hektar|ha)\b/.test(near);const total=!perHa&&(am.u==='t'||am.u==='m³'||/\b(insgesamt|gesamt|total|zusammen)\b/.test(near));if(total){if(totalHa){menge=menge/totalHa;notes.push(`${nf(am.v,1)} ${am.u} gesamt → ${nf(menge,1)} ${unit}/ha umgerechnet.`)}else notes.push('Gesamtmenge ohne Fläche – bitte je ha prüfen.')}else if(!perHa)notes.push(`${nf(am.v,1)} ${am.u} als Menge je Hektar übernommen.`)
    if(m){const p=priceAt(m.mi,datum);mittelOut.push({mittel_id:m.mi.id,name:m.mi.name,kategorie:m.mi.kategorie,menge_pro_ha:+menge.toFixed(3),einheit:m.mi.einheit,preis:p?p.preis:null})}
    else if(name)mittelOut.push({mittel_id:null,name,kategorie:typ==='pflanzenschutz'?'psm':typ==='aussaat'?'saatgut':typ==='duengung'||!typ?'duenger':'sonstiges',menge_pro_ha:+menge.toFixed(3),einheit:unit,preis:null})});
  mitteln.forEach(m=>{if(!mittelOut.some(x=>x.mittel_id===m.mi.id)){const p=priceAt(m.mi,datum);mittelOut.push({mittel_id:m.mi.id,name:m.mi.name,kategorie:m.mi.kategorie,menge_pro_ha:0,einheit:m.mi.einheit,preis:p?p.preis:null});notes.push('Menge für '+m.mi.name+' fehlt.')}});
  if(!typ&&mittelOut.length){const k=mittelOut[0].kategorie;typ={duenger:'duengung',psm:'pflanzenschutz',saatgut:'aussaat'}[k]||'sonstiges'}
  // Maschinen
  const machOut=[];const hours=t.match(/(\d+(?:\.\d+)?)\s*(stunden|stunde|std)\b/);
  L('maschinen').forEach(m=>{const nm=nrm(m.name);const tok=nm.split(' ').filter(w=>w.length>=4&&!/^\d/.test(w));const said=tok.some(k=>words.some(w=>sim(w,k)>=0.84||(k.length>=6&&w.includes(k))));const implied=tool&&nm.includes(tool[1]);if(said||implied)machOut.push({m,said})});
  let masch=machOut.filter(x=>x.said);if(!masch.length&&machOut.length)masch=[machOut[0]];
  const maschinen=masch.map(({m})=>({maschine_id:m.id,name:m.name,abrechnung:m.einheit==='h'?'h':'ha',menge:m.einheit==='h'?(hours?+hours[1]:null):null}));
  if(hours&&!maschinen.some(x=>x.abrechnung==='h'))notes.push(nf(+hours[1],1)+' Stunden genannt – bitte einer Maschine mit Stundensatz zuordnen.');
  if(!typ&&!schl.length&&!mittelOut.length&&!maschinen.length)return {aktionen:[],hinweis:'Das konnte ich nicht zuordnen. Formuliere es etwas anders (z. B. „Schlag, Arbeit, Maschine“) oder erfasse es über „+ Neu“ von Hand.'};
  typ=typ||'sonstiges';
  const titel=tool?(tool[2]==='Düngung'&&mittelOut[0]?'Düngung '+mittelOut[0].name:tool[2]):(typ==='duengung'&&mittelOut[0]?'Düngung '+mittelOut[0].name:TYP[typ][0]);
  if(!schl.length)notes.unshift('Schlag nicht erkannt – bitte bei „Bearbeiten“ auswählen.');
  out.push({art:'massnahme',schlag_ids:schl.map(s=>s.id),datum,typ,status:geplant?'geplant':'erledigt',titel,notizen:raw.trim(),mittel:mittelOut,maschinen});
  return {aktionen:out,hinweis:notes.join(' ')};
}

/* ---------- Eingangskorb (Fotos & Texte für Claude) ---------- */
async function toInbox(){
  const text=val('as-text');const it={typ:AS.img?'foto':'text',text,status:'neu',erstellt:new Date().toISOString(),schlag_hier:AS.here?AS.here.id:null};
  if(AS.img){try{const j=await toJpeg(AS.img,1400,.72);it.bild=j.data;it.media_type=j.media_type}catch(e){return toast('Das Foto konnte nicht gelesen werden.')}}
  const ok=await put('eingang',uid(),it);if(!ok)return;
  closeSheet();toast(LOCAL?'Gespeichert. Im Demo-Modus wertet Claude den Eingangskorb nicht aus.':'Im Eingangskorb. Claude wertet es bis zur nächsten vollen Stunde aus.',4500);
}
const inboxOpen=()=>L('eingang').filter(x=>x.status!=='erledigt');
function inboxCard(){const l=inboxOpen();if(!l.length)return '';const b=l.filter(x=>x.status==='bereit').length,w=l.filter(x=>x.status==='neu').length,f=l.filter(x=>x.status==='fehler').length;
  return `<button class="card" data-act="inbox" style="text-align:left;cursor:pointer;color:var(--fg);border-color:${b?'var(--pri)':'var(--line)'}"><div class="card-h"><h2>Eingangskorb</h2>${b?`<span class="badge">${b} bereit</span>`:''}</div><span class="muted" style="font-size:13px">${[b?b+' Vorschlag'+(b>1?'e':'')+' zum Übernehmen':'',w?w+' wartet auf Claude':'',f?f+' nicht lesbar':''].filter(Boolean).join(' · ')}</span></button>`}
function openInbox(){openSheet({title:'Eingangskorb',body:'<div id="ibx" style="display:flex;flex-direction:column;gap:12px"></div>',mount:drawInbox})}
function drawInbox(){
  const el=$('#ibx');if(!el)return;const l=inboxOpen().sort((a,b)=>(b.erstellt||'').localeCompare(a.erstellt||''));
  if(!l.length){el.innerHTML='<div class="empty">Alles erledigt.</div>';return}
  el.innerHTML=l.map(x=>{const v=x.vorschlag||{};const acts=(v.aktionen||[]);
    return `<div class="card" style="gap:10px"><div style="display:flex;gap:10px;align-items:flex-start">${x.bild?`<img src="data:${x.media_type||'image/jpeg'};base64,${x.bild}" alt="Foto" style="width:64px;height:64px;object-fit:cover;border-radius:10px;flex-shrink:0">`:''}<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px"><span class="muted" style="font-size:12px">${fmtD((x.erstellt||'').slice(0,10))} ${(x.erstellt||'').slice(11,16)} · ${x.typ==='foto'?'Foto':'Text'}</span>${x.text?`<span style="font-size:14px">${esc(x.text)}</span>`:''}<span class="badge ${x.status==='neu'?'plan':x.status==='fehler'?'warn':''}" style="align-self:flex-start">${{neu:'wartet auf Claude',bereit:'Vorschlag bereit',fehler:'nicht lesbar'}[x.status]||x.status}</span></div></div>
     ${v.hinweis?`<div class="note box">${esc(v.hinweis)}</div>`:''}
     ${acts.map((a,i)=>{const d=asDesc(a);return `<div class="as-card ${a._done?'done':''}"><span class="k">${esc(d.k)}</span><span class="t">${esc(d.t)}</span>${d.li.length?`<ul>${d.li.map(z=>`<li>${z}</li>`).join('')}</ul>`:''}${a._done?'<span class="note">✓ übernommen</span>':`<div class="as-actions"><button class="btn pri sm" data-act="ibSave" data-id="${x.id}" data-i="${i}">Übernehmen</button><button class="btn sec sm" data-act="ibEdit" data-id="${x.id}" data-i="${i}">Bearbeiten</button></div>`}</div>`}).join('')}
     <div class="as-actions">${x.status==='neu'&&x.text?`<button class="btn sec sm" data-act="ibLocal" data-id="${x.id}">Jetzt selbst auswerten</button>`:''}<button class="btn ghost sm danger" data-act="ibDrop" data-id="${x.id}">${acts.length&&acts.every(a=>a._done)?'Erledigt – entfernen':'Verwerfen'}</button></div></div>`}).join('');
}
async function ibMark(id,i){const x=D.eingang[id];if(!x)return;const v=JSON.parse(JSON.stringify(x.vorschlag||{aktionen:[]}));v.aktionen[i]._done=true;const done=v.aktionen.every(a=>a._done);if(done)await del('eingang',id);else await put('eingang',id,{...x,vorschlag:v});drawInbox()}

/* ---------- Import ---------- */
const IMP_SRC=[{id:'mr',k:'MR',name:'Maschinenring Ackerschlagkartei',f:'Export als CSV / Excel',acc:'.csv,.txt,.xlsx,.xls'},{id:'geo',k:'SHP',name:'Schlaggrenzen',f:'Shape (ZIP), GeoJSON, KML',acc:'.zip,.geojson,.json,.kml'},{id:'fiona',k:'FIO',name:'Flächenantrag (FIONA)',f:'Shape-Export der Schläge (ZIP)',acc:'.zip,.geojson,.json'},{id:'iso',k:'ISO',name:'Terminal / Farm-Software',f:'ISO-XML, agrirouter – folgt',acc:''}];
const FIELDS={
  schlaege:[['name','Schlagname',/schlag.?(name|bez)|^name$|bezeichnung|feldname|^schlag$/i],['flurstueck','Flurstück',/flur|flst/i],['gemarkung','Gemarkung',/gemark/i],['flaeche_ha','Fläche (ha)',/fl(ä|ae|a)che|gr(ö|oe)(ß|ss)e|^ha$|area/i],['fiona_nr','Schlagnummer',/schlag.?n(r|um)|^snr|^nr$/i],['besitz','Besitz (Eigentum/Pacht)',/besitz|eigentum|pacht.?art/i],['kultur','Kultur',/kultur|frucht|nutzung|crop/i],['sorte','Sorte',/sorte/i],['vorfrucht','Vorfrucht',/vorfrucht/i],['verpaechter','Verpächter',/verp(ä|ae)chter|eigent(ü|ue)mer/i],['pachtpreis','Pachtpreis €/ha',/pacht.?(preis|zins)|pacht$/i]],
  massnahmen:[['schlag','Schlag',/schlag|feld/i],['datum','Datum',/datum|date|tag/i],['typ','Art der Maßnahme',/art|typ|ma(ß|ss)nahme$|kategorie/i],['titel','Bezeichnung',/bezeichnung|titel|ma(ß|ss)nahme.?(name|bez)/i],['mittel','Mittel/Produkt',/mittel|produkt|d(ü|ue)nger|psm/i],['menge','Menge je ha',/menge|aufwand|dosis/i],['einheit','Einheit',/einheit|unit/i],['preis','Preis je Einheit',/preis|kosten.?je/i],['maschine','Maschine',/maschine|ger(ä|ae)t/i],['notizen','Notizen',/notiz|bemerk|kommentar/i]],
  geo:[['name','Schlagname',/schlag.?(name|bez)|^name$|bezeichnung|feldbez|^schlag$|flurname/i],['fiona_nr','Schlagnummer',/schlag.?n|^snr|^nr$|schlagnr/i],['flurstueck','Flurstück',/flur|flst|flik/i],['flaeche_ha','Fläche (ha)',/fl(ä|ae|a)che|gr(ö|oe)(ß|ss)e|area|^ha$/i],['kultur','Nutzung/Kultur',/nutz|kultur|frucht|nc_|code/i]]
};
function vImport(){
  const imp=S.imp||(S.imp={src:'mr',kind:'schlaege'});const src=IMP_SRC.find(x=>x.id===imp.src);
  const isGeo=imp.src==='geo'||imp.src==='fiona';const kind=isGeo?'geo':imp.kind;const fields=FIELDS[kind];
  const vorl=L('vorlagen').filter(v=>v.src===imp.src&&v.kind===kind);
  let mapping='',preview='';
  if(imp.headers){
    mapping=`<div class="card"><div class="card-h"><h2>Spalten zuordnen</h2>${SAMPLE?`<button class="btn ghost sm" data-act="impAI">KI-Vorschlag</button>`:''}</div>
    ${vorl.length?`<select id="imp-vorl" class="inp"><option value="">Vorlage laden …</option>${vorl.map(v=>`<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>`:''}
    ${fields.map(([k,l])=>`<div class="maprow"><select id="map-${k}" aria-label="Spalte für ${esc(l)}"><option value="">– nicht vorhanden –</option>${imp.headers.map(h=>`<option${imp.map[k]===h?' selected':''}>${esc(h)}</option>`).join('')}</select>${svgI('M5 12h14M13 6l6 6-6 6',16,2)}<span style="font-weight:600">${esc(l)}</span></div>`).join('')}
    <button class="btn ghost sm" data-act="impSaveVorl" style="align-self:flex-start">Zuordnung als Vorlage speichern</button></div>`;
    const pv=impPreview();
    preview=`<div class="card"><div class="card-h"><h2>Vorschau</h2><small>${pv.rows.length} Zeilen · ${pv.neu} neu · ${pv.upd} vorhanden${pv.skip?` · ${pv.skip} ohne Zuordnung`:''}</small></div><div class="scroll-x"><table class="tbl"><thead><tr><th></th>${pv.cols.map(c=>`<th>${esc(c[1])}</th>`).join('')}</tr></thead><tbody>${pv.rows.slice(0,12).map(r=>`<tr><td><span class="badge ${r._st==='neu'?'':r._st==='skip'?'warn':'mr'}">${r._st==='neu'?'neu':r._st==='skip'?'fehlt':'Update'}</span></td>${pv.cols.map(c=>`<td>${esc(c[0]==='flaeche_ha'&&r[c[0]]!=null?nf(n0(r[c[0]]),2):r[c[0]]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${pv.rows.length>12?`<span class="note">… und ${pv.rows.length-12} weitere</span>`:''}${kind!=='massnahmen'?`<span class="note">Vorhandene Schläge werden anhand von Name, Flurstück oder Schlagnummer erkannt und ergänzt statt doppelt angelegt.${isGeo?' Die Kultur wird für WJ '+esc(curWJ())+' übernommen.':''}</span>`:'<span class="note">Maßnahmen werden dem Schlag mit passendem Namen zugeordnet. Unbekannte Mittel werden neu angelegt.</span>'}</div>
    <button class="btn pri" data-act="impRun" ${imp.running?'disabled':''}>${imp.running?'<span class="spin"></span> Import läuft … '+(imp.prog||''):'Jetzt importieren ('+(pv.neu+pv.upd)+')'}</button>`;
  }
  return `<div class="page"><button class="back" data-act="back">${svgI(I.back,20,2)}Zurück</button>
  <div class="head"><div><h1>Daten importieren</h1><div class="muted" style="font-size:14px">Schläge, Maßnahmen und Grenzen aus der bestehenden Ackerschlagkartei übernehmen</div></div></div>${banners()}
  <div style="display:flex;flex-direction:column;gap:8px">${IMP_SRC.map(q=>`<button class="src-btn ${imp.src===q.id?'on':''}" data-act="impSrc" data-k="${q.id}"><span class="k">${q.k}</span><span style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:700">${q.name}</span><span class="muted" style="font-size:12px">${q.f}</span></span></button>`).join('')}</div>
  ${imp.src==='iso'?`<div class="card"><h2>Noch nicht verfügbar</h2><span class="note">ISO-XML (TASKDATA.XML) und agrirouter kommen in einem späteren Schritt. Schick mir gern eine Beispieldatei von deinem Terminal.</span></div>`:`
  ${imp.src==='mr'?`<div class="seg" style="grid-template-columns:1fr 1fr"><button class="${imp.kind==='schlaege'?'on':''}" data-act="impKind" data-k="schlaege">Schläge</button><button class="${imp.kind==='massnahmen'?'on':''}" data-act="impKind" data-k="massnahmen">Maßnahmen</button></div>`:''}
  <label class="drop" for="imp-file">${svgI('M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4',30,1.8)}<span style="font-size:15px;font-weight:700">${imp.file?esc(imp.file):'Datei hochladen'}</span><span class="muted" style="font-size:12px">${imp.loading?'<span class="spin"></span> wird gelesen …':esc(src.f)}</span><input type="file" id="imp-file" accept="${src.acc}"></label>
  ${imp.err?`<div class="banner">${esc(imp.err)}</div>`:''}
  ${imp.src==='fiona'&&!imp.headers?`<div class="note box">In FIONA: Flächen → Export → „Shape exportieren“. Die ZIP-Datei mit .shp, .dbf, .shx und .prj hier hochladen. Koordinaten in ETRS89/UTM32 werden automatisch umgerechnet.</div>`:''}
  ${mapping}${preview}`}</div>`;
}
const scripts={};
function loadScript(src){return scripts[src]||(scripts[src]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>{delete scripts[src];no(new Error('Bibliothek konnte nicht geladen werden'))};document.head.appendChild(s)}))}
function parseCSV(t){
  t=t.replace(/^﻿/,'');const first=t.split(/\r?\n/)[0]||'';const cnt=c=>first.split(c).length;const sep=[';','\t',','].sort((a,b)=>cnt(b)-cnt(a))[0];
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===sep){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x!==''))rows.push(row);row=[]}else f+=c}
  row.push(f);if(row.some(x=>x!==''))rows.push(row);return rows;
}
async function impFile(file){
  const imp=S.imp;imp.file=file.name;imp.err=null;imp.headers=null;imp.loading=true;render();
  try{
    const ext=file.name.toLowerCase().split('.').pop();let rows=[],feats=null;
    if(['csv','txt'].includes(ext)){let txt=await file.text();if(txt.includes('\uFFFD')){const buf=await file.arrayBuffer();txt=new TextDecoder('windows-1252').decode(buf)}const r=parseCSV(txt);const h=r[0].map((x,i)=>x.trim()||'Spalte '+(i+1));rows=r.slice(1).map(a=>Object.fromEntries(h.map((k,i)=>[k,(a[i]??'').trim()])))}
    else if(['xlsx','xls'].includes(ext)){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false,dateNF:'yyyy-mm-dd'})}
    else if(ext==='zip'){await loadScript('https://unpkg.com/shpjs@4.0.4/dist/shp.min.js');let g=await shp(await file.arrayBuffer());if(Array.isArray(g))g={features:g.flatMap(x=>x.features||[])};feats=g.features}
    else if(['geojson','json'].includes(ext)){const g=JSON.parse(await file.text());feats=g.type==='FeatureCollection'?g.features:g.type==='Feature'?[g]:[{type:'Feature',properties:{},geometry:g}]}
    else if(ext==='kml'){feats=parseKML(await file.text())}
    else throw new Error('Dateityp .'+ext+' wird nicht unterstützt.');
    if(feats){feats=feats.filter(f=>f&&f.geometry&&/Polygon/.test(f.geometry.type)).map(f=>({...f,geometry:toWGS(f.geometry)}));if(!feats.length)throw new Error('Keine Flächen (Polygone) in der Datei gefunden.');rows=feats.map((f,i)=>({...Object.fromEntries(Object.entries(f.properties||{}).map(([k,v])=>[k,v==null?'':String(v).trim()])),_geo:f.geometry,_i:i}))}
    if(!rows.length)throw new Error('Die Datei enthält keine Datenzeilen.');
    imp.rows=rows;imp.headers=Object.keys(rows[0]).filter(k=>!k.startsWith('_'));
    const kind=imp.src==='mr'?imp.kind:'geo';imp.map={};
    FIELDS[kind].forEach(([k,l,re])=>{const h=imp.headers.find(h=>re.test(h));if(h&&!Object.values(imp.map).includes(h))imp.map[k]=h});
  }catch(e){imp.err=(e&&e.message)||'Die Datei konnte nicht gelesen werden.'}
  imp.loading=false;render();
}
function parseKML(t){const x=new DOMParser().parseFromString(t,'text/xml');return [...x.getElementsByTagName('Placemark')].map(p=>{const props={};const n=p.getElementsByTagName('name')[0];if(n)props.name=n.textContent.trim();[...p.getElementsByTagName('SimpleData')].forEach(d=>props[d.getAttribute('name')]=d.textContent);[...p.getElementsByTagName('Data')].forEach(d=>{const v=d.getElementsByTagName('value')[0];if(v)props[d.getAttribute('name')]=v.textContent});const polys=[...p.getElementsByTagName('Polygon')].map(pg=>{const ring=el=>el?el.getElementsByTagName('coordinates')[0].textContent.trim().split(/\s+/).map(c=>c.split(',').slice(0,2).map(Number)):null;const o=ring(pg.getElementsByTagName('outerBoundaryIs')[0]);const inn=[...pg.getElementsByTagName('innerBoundaryIs')].map(ring);return [o,...inn]});if(!polys.length)return null;return {type:'Feature',properties:props,geometry:polys.length===1?{type:'Polygon',coordinates:polys[0]}:{type:'MultiPolygon',coordinates:polys}}}).filter(Boolean)}
function utm32(E,N){const a=6378137,f=1/298.257222101,k0=.9996,e2=f*(2-f),ep2=e2/(1-e2),x=E-5e5,y=N,M=y/k0,mu=M/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256)),e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2));const p1=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu);const C1=ep2*Math.cos(p1)**2,T1=Math.tan(p1)**2,N1=a/Math.sqrt(1-e2*Math.sin(p1)**2),R1=a*(1-e2)/(1-e2*Math.sin(p1)**2)**1.5,D=x/(N1*k0);const lat=p1-(N1*Math.tan(p1)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720);const lon=(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/Math.cos(p1);return [9+lon*180/Math.PI,lat*180/Math.PI]}
function toWGS(g){const conv=c=>{let [x,y]=c;if(Math.abs(x)>1000){if(x>3e7)x-=32e6;return utm32(x,y)}return [x,y]};const r6=c=>[+c[0].toFixed(6),+c[1].toFixed(6)];const mp=r=>r.map(c=>r6(conv(c)));return g.type==='Polygon'?{type:'Polygon',coordinates:g.coordinates.map(mp)}:{type:'MultiPolygon',coordinates:g.coordinates.map(p=>p.map(mp))}}
function ringArea(c){let a=0;const R=6378137,rad=Math.PI/180;for(let i=0;i<c.length-1;i++){const p1=c[i],p2=c[i+1];a+=(p2[0]-p1[0])*rad*(2+Math.sin(p1[1]*rad)+Math.sin(p2[1]*rad))}return Math.abs(a*R*R/2)}
const geomHa=g=>polysOf(g).reduce((s,p)=>s+p.reduce((t,r,i)=>t+(i?-1:1)*ringArea(r),0),0)/1e4;
function impReadMap(){const imp=S.imp;const kind=imp.src==='mr'?imp.kind:'geo';FIELDS[kind].forEach(([k])=>{const v=val('map-'+k);if(v)imp.map[k]=v;else delete imp.map[k]})}
function findSchlag(r){const nm=(r.name||'').toLowerCase();return L('schlaege').find(s=>(nm&&(s.name||'').toLowerCase()===nm)||(r.flurstueck&&s.flurstueck&&s.flurstueck===r.flurstueck&&(!nm||!s.name))||(r.fiona_nr&&s.fiona_nr&&String(s.fiona_nr)===String(r.fiona_nr)))}
function impPreview(){
  const imp=S.imp;const kind=imp.src==='mr'?imp.kind:'geo';const fields=FIELDS[kind].filter(([k])=>imp.map[k]);
  const rows=imp.rows.map(raw=>{const r={};fields.forEach(([k])=>r[k]=raw[imp.map[k]]);if(raw._geo){r._geo=raw._geo;if(!r.flaeche_ha||!n0(r.flaeche_ha))r.flaeche_ha=+geomHa(raw._geo).toFixed(4);else{let v=n0(r.flaeche_ha);if(v>500)v=v/1e4;r.flaeche_ha=v}if(!r.name)r.name=r.fiona_nr?'Schlag '+r.fiona_nr:'Fläche '+(raw._i+1)}
    if(kind==='massnahmen'){const s=L('schlaege').find(s=>(s.name||'').toLowerCase()===String(r.schlag||'').toLowerCase());r._sid=s&&s.id;r._st=s?'neu':'skip'}else{const ex=findSchlag(r);r._ex=ex;r._st=ex?'upd':'neu'}return r});
  const cols=fields.map(([k,l])=>[k,l]);if(kind==='geo'&&!imp.map.flaeche_ha)cols.push(['flaeche_ha','Fläche (berechnet)']);if(kind==='geo'&&!imp.map.name)cols.unshift(['name','Name']);
  return {rows,cols,neu:rows.filter(r=>r._st==='neu').length,upd:rows.filter(r=>r._st==='upd').length,skip:rows.filter(r=>r._st==='skip').length};
}
const parseDate=v=>{v=String(v||'').trim();let m;if(m=v.match(/^(\d{4})-(\d{2})-(\d{2})/))return m[0];if(m=v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)){const y=m[3].length===2?'20'+m[3]:m[3];return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}return todayISO()};
const guessTyp=v=>{v=String(v||'').toLowerCase();if(/d(ü|ue)ng|streu|g(ü|ue)lle|kas|harnstoff/.test(v))return 'duengung';if(/pflanzenschutz|spritz|herbiz|fungiz|insektiz|psm/.test(v))return 'pflanzenschutz';if(/saat|drill|leg/.test(v))return 'aussaat';if(/ernte|drusch|dresch|h(ä|ae)cksel|roden/.test(v))return 'ernte';if(/grubb|pfl(ü|ue)g|egge|boden|mulch|walz|stoppel/.test(v))return 'bodenbearbeitung';return 'sonstiges'};
async function impRun(){
  impReadMap();const imp=S.imp;const pv=impPreview();const kind=imp.src==='mr'?imp.kind:'geo';const wj=curWJ();
  if(!CANWRITE)return toast('Du hast nur Leserechte.');
  if(kind!=='massnahmen'&&!imp.map.name&&kind!=='geo')return toast('Bitte zuerst die Spalte „Schlagname“ zuordnen.');
  imp.running=true;let done=0;const todo=pv.rows.filter(r=>r._st!=='skip');render();
  for(const r of todo){
    if(kind==='massnahmen'){
      let mittel=[];if(r.mittel){let mi=L('mittel').find(m=>m.name.toLowerCase()===String(r.mittel).toLowerCase());if(!mi){const id=uid();const typ=guessTyp(r.typ||r.titel);mi={id,name:r.mittel,kategorie:typ==='duengung'?'duenger':typ==='pflanzenschutz'?'psm':typ==='aussaat'?'saatgut':'sonstiges',einheit:r.einheit||'kg',preise:r.preis?[{ab:parseDate(r.datum),preis:n0(r.preis)}]:[]};await put('mittel',id,mi)}const p=r.preis?n0(r.preis):priceAt(mi,parseDate(r.datum))?.preis;mittel=[{mittel_id:mi.id,name:mi.name,kategorie:mi.kategorie,einheit:mi.einheit,menge_pro_ha:n0(r.menge),preis:n0(p),preis_manuell:!!r.preis}]}
      let maschinen=[];if(r.maschine){const m=L('maschinen').find(m=>m.name.toLowerCase()===String(r.maschine).toLowerCase());if(m)maschinen=[{maschine_id:m.id,name:m.name,abrechnung:m.einheit==='h'?'h':'ha',menge:m.einheit==='h'?0:n0(D.schlaege[r._sid].flaeche_ha),satz:n0(m.kostensatz)}]}
      const d=parseDate(r.datum);const typ=guessTyp(r.typ||r.titel||r.mittel);
      await put('massnahmen',uid(),{schlag_id:r._sid,datum:d,wj:wjOf(d,typ),typ,status:'erledigt',titel:r.titel||r.typ||TYP[typ][0],notizen:r.notizen||(r.maschine&&!maschinen.length?'Maschine: '+r.maschine:''),mittel,maschinen,quelle:'import'});
    }else{
      const ex=r._ex;const id=ex?ex.id:uid();const base=ex?{...ex}:{besitz:'eigentum'};
      const upd={name:base.name||r.name,flurstueck:r.flurstueck||base.flurstueck||'',gemarkung:r.gemarkung||base.gemarkung||'',fiona_nr:r.fiona_nr||base.fiona_nr||'',flaeche_ha:r.flaeche_ha!=null&&r.flaeche_ha!==''?n0(r.flaeche_ha):n0(base.flaeche_ha)};
      if(r.besitz)upd.besitz=/pacht/i.test(r.besitz)?'pacht':'eigentum';if(r.verpaechter||r.pachtpreis)upd.besitz='pacht';
      if(r._geo)upd.geo=JSON.stringify(r._geo);
      await put('schlaege',id,{...base,...upd,demo:false});
      if(r.kultur||r.sorte||r.vorfrucht){const a=anbauFor(id,wj);await put('anbau',a?a.id:uid(),{...(a||{}),schlag_id:id,wj,kultur:r.kultur||(a&&a.kultur)||'',sorte:r.sorte||(a&&a.sorte)||'',vorfrucht:r.vorfrucht||(a&&a.vorfrucht)||''})}
      if(r.verpaechter||r.pachtpreis){const p=L('pacht').find(p=>p.schlag_id===id);await put('pacht',p?p.id:uid(),{...(p||{}),schlag_id:id,verpaechter:r.verpaechter||(p&&p.verpaechter)||'',preis_eur_ha:r.pachtpreis?n0(r.pachtpreis):n0(p&&p.preis_eur_ha)})}
    }
    done++;imp.prog=done+'/'+todo.length;if(done%5===0)render();
  }
  imp.running=false;toast(`${done} Datensätze importiert`);S.imp={src:imp.src,kind:imp.kind};render();
}
async function impAI(){
  impReadMap();const imp=S.imp;const kind=imp.src==='mr'?imp.kind:'geo';
  toast('KI ordnet die Spalten zu …',4000);
  try{const r=await SAMPLE.json(`Ordne die Spalten einer exportierten Datei (Ackerschlagkartei/Flächenantrag, Deutschland) den Zielfeldern zu. Zielfelder: ${JSON.stringify(FIELDS[kind].map(([k,l])=>({feld:k,bedeutung:l})))}. Spalten mit Beispielwerten: ${JSON.stringify(imp.headers.map(h=>({spalte:h,beispiele:imp.rows.slice(0,3).map(x=>x[h])})))}. Antworte nur mit JSON: {"feld":"Spaltenname oder null", ...} für jedes Zielfeld. Jede Spalte höchstens einmal.`,{modelTier:'quick'});
    FIELDS[kind].forEach(([k])=>{if(r&&r[k]&&imp.headers.includes(r[k]))imp.map[k]=r[k];else if(r&&r[k]===null)delete imp.map[k]});render();toast('Zuordnung vorgeschlagen – bitte prüfen')}
  catch(e){toast('KI-Vorschlag nicht möglich ('+(e&&e.code||'Fehler')+')')}
}

/* ---------- PDF-Auswertung ---------- */
const PDFLIB=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
function pdfDialog(sid){
  const wjs=wjList();
  openSheet({title:sid?'Schlag als PDF':'Auswertung als PDF',body:`<div class="fgrid">${F('pdf-wj','Wirtschaftsjahr',curWJ(),{type:'select',opts:wjs})}</div>
   ${sid?'':`<label style="display:flex;gap:10px;align-items:center;font-size:15px;min-height:44px"><input type="checkbox" id="pdf-einzeln" checked style="width:22px;height:22px"> Je Schlag eine eigene Seite mit Deckungsbeitrag und allen Maßnahmen</label>`}
   <div class="note">Das PDF enthält ${sid?'die Stammdaten, Pacht, Deckungsbeitragsrechnung und alle Maßnahmen dieses Schlags':'Betriebsübersicht, Kostenstruktur, Deckungsbeitrag je Kultur und eine Tabelle aller Schläge'}. Es wird auf deinem Gerät erstellt und gespeichert.</div>`,
   saveLabel:'PDF erstellen',save:async()=>{const b=$('#sh-save');b.innerHTML='<span class="spin"></span> wird erstellt …';try{await makePDF({wj:val('pdf-wj'),nur:sid||null,einzeln:sid?true:!!($('#pdf-einzeln')&&$('#pdf-einzeln').checked)})}catch(e){toast('PDF konnte nicht erstellt werden: '+(e&&e.message||e),8000);return false}}});
}
async function makePDF(o){
  for(const u of PDFLIB)await loadScript(u);
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  const wj=o.wj;const t=farm(wj);const G=[47,93,58],GR=[91,102,93];const M=14;const W=210-2*M;
  const e0=n=>nf(Math.round(n))+' €';const eha=(x,fl)=>fl?nf(Math.round(x/fl))+' €/ha':'-';
  const heute=new Date();const dstr=fmtD(isoOf(heute)).replace(/(\d\d)$/,'20$1');
  const kopf=(titel,unter)=>{doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(24,36,27);doc.text(titel,M,20);doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(...GR);doc.text(unter,M,26.5);doc.setDrawColor(...G);doc.setLineWidth(.6);doc.line(M,29.5,M+W,29.5);return 36};
  const h2=(txt,y)=>{doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(24,36,27);doc.text(txt,M,y);return y+3};
  const tab=(y,head,body,extra={})=>{doc.autoTable({startY:y,head:[head],body,margin:{left:M,right:M},theme:'striped',styles:{font:'helvetica',fontSize:9,cellPadding:1.8,textColor:[24,36,27]},headStyles:{fillColor:G,textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[243,244,239]},...extra});return doc.lastAutoTable.finalY+8};
  const R=(cols)=>Object.fromEntries(cols.map(c=>[c,{halign:'right'}]));
  const unter=betriebName()+' · Wirtschaftsjahr '+wj+' · Stand '+dstr;
  const stufen=(r,fl)=>[['Erlöse',e0(r.erloes),eha(r.erloes,fl)],['- Saatgut',e0(r.saatgut),eha(r.saatgut,fl)],['- Dünger',e0(r.duenger),eha(r.duenger,fl)],['- Pflanzenschutz',e0(r.psm),eha(r.psm,fl)],['- Sonstiges',e0(r.sonst),eha(r.sonst,fl)],['= Deckungsbeitrag I',e0(r.db1),eha(r.db1,fl)],['- Maschinen & Lohn',e0(r.masch),eha(r.masch,fl)],['= Deckungsbeitrag II',e0(r.db2),eha(r.db2,fl)],['- Pacht / Pachtansatz',e0(r.pacht),eha(r.pacht,fl)],['= Ergebnis nach Pacht',e0(r.np),eha(r.np,fl)]];
  const fett={didParseCell:d=>{if(d.section==='body'&&/^=/.test(d.row.raw[0])){d.cell.styles.fontStyle='bold';if(/nach Pacht/.test(d.row.raw[0]))d.cell.styles.fillColor=[227,236,223]}}};
  let first=true;
  if(!o.nur){
    let y=kopf('Betriebswirtschaftliche Auswertung',unter);
    y=h2('Betriebsergebnis Ackerbau',y+2);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...GR);doc.text(`${t.n} Schläge · ${nf(t.fl,2)} ha${t.anyIst?' · Erlöse aus Ist-Erträgen, sonst Plan':' · Erlöse aus Plan-Erträgen'}`,M,y+3);
    y=tab(y+6,['Position','gesamt','je ha'],stufen(t,t.fl),{columnStyles:R([1,2]),...fett});
    const costs=[['Pacht',t.pacht],['Maschinen & Lohn',t.masch],['Dünger',t.duenger],['Pflanzenschutz',t.psm],['Saatgut',t.saatgut],['Sonstiges',t.sonst]];const tot=t.kosten||1;
    y=h2('Kostenstruktur',y);y=tab(y+2,['Kostenart','gesamt','je ha','Anteil'],costs.map(([k,v])=>[k,e0(v),eha(v,t.fl),nf(v/tot*100,0)+' %']),{columnStyles:R([1,2,3])});
    const byK={};t.rows.forEach(r=>{const k=r.kultur||'ohne Kultur';const c=byK[k]||(byK[k]={k,fl:0,erloes:0,kosten:0,np:0,n:0});c.fl+=r.fl;c.erloes+=r.erloes;c.kosten+=r.kosten;c.np+=r.np;c.n++});
    if(y>230){doc.addPage();y=20}
    y=h2('Deckungsbeitrag je Kultur',y);y=tab(y+2,['Kultur','Schläge','Fläche','Erlös/ha','Kosten/ha','nach Pacht/ha','nach Pacht gesamt'],Object.values(byK).sort((a,b)=>b.np/b.fl-a.np/a.fl).map(c=>[c.k,String(c.n),nf(c.fl,2)+' ha',eha(c.erloes,c.fl),eha(c.kosten,c.fl),eha(c.np,c.fl),e0(c.np)]),{columnStyles:R([1,2,3,4,5,6])});
    doc.addPage('a4','landscape');
    doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(24,36,27);doc.text('Alle Schläge · Wirtschaftsjahr '+wj,M,16);
    const rows=t.rows.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    doc.autoTable({startY:21,margin:{left:M,right:M},theme:'striped',styles:{font:'helvetica',fontSize:8,cellPadding:1.5},headStyles:{fillColor:G,textColor:255},alternateRowStyles:{fillColor:[243,244,239]},
      head:[['Schlag','Kultur','Fläche','Besitz','Erlös','Direktkosten','DB I','Masch./Lohn','DB II','Pacht','nach Pacht','nach Pacht/ha']],
      body:[...rows.map(r=>[r.name||'',r.kultur||'-',nf(r.fl,2),D.schlaege[r.id].besitz==='pacht'?'Pacht':'Eigentum',e0(r.erloes),e0(r.direkt),e0(r.db1),e0(r.masch),e0(r.db2),e0(r.pacht),e0(r.np),eha(r.np,r.fl)]),['Summe Betrieb','',nf(t.fl,2),'',e0(t.erloes),e0(t.direkt),e0(t.db1),e0(t.masch),e0(t.db2),e0(t.pacht),e0(t.np),eha(t.np,t.fl)]],
      columnStyles:R([2,4,5,6,7,8,9,10,11]),didParseCell:d=>{if(d.section==='body'&&d.row.index===rows.length){d.cell.styles.fontStyle='bold';d.cell.styles.fillColor=[227,236,223]}}});
    first=false;
  }
  if(o.einzeln){
    const ids=o.nur?[o.nur]:t.rows.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(r=>r.id);
    for(const sid of ids){
      const s=D.schlaege[sid];const r=calc(sid,wj);const a=r.anbau||{};const p=r.vertrag;
      if(!first)doc.addPage('a4','portrait');first=false;
      let y=kopf('Schlag: '+(s.name||''),unter);
      const info=[['Fläche',nf(r.fl,2)+' ha'],['Flurstück / Gemarkung',[s.flurstueck,s.gemarkung].filter(Boolean).join(' · ')||'-'],['Besitz',s.besitz==='pacht'?'Pacht':'Eigentum'],
        ...(s.besitz==='pacht'?[['Verpächter',p&&p.verpaechter||'-'],['Pachtpreis',p?nf(n0(p.preis_eur_ha),0)+' €/ha · '+e0(r.pacht)+' im Jahr':'-'],['Laufzeit',p?[p.beginn&&'ab '+fmtD(p.beginn),p.ende&&'bis '+fmtD(p.ende)].filter(Boolean).join(' ')||'unbefristet':'-']]:[]),
        ['Kultur / Sorte',[a.kultur,a.sorte].filter(Boolean).join(' · ')||'-'],['Vorfrucht',a.vorfrucht||'-'],['Ertrag',r.ertrag?nf(r.ertrag,1)+' dt/ha ('+(r.ist?'Ist':'Plan')+') × '+nf(r.preis,2)+' €/dt':'-']];
      doc.autoTable({startY:y,body:info,margin:{left:M,right:M},theme:'plain',styles:{font:'helvetica',fontSize:9.5,cellPadding:1.2},columnStyles:{0:{fontStyle:'bold',cellWidth:48,textColor:GR}}});
      y=doc.lastAutoTable.finalY+7;
      y=h2('Deckungsbeitragsrechnung',y);y=tab(y+2,['Position','Schlag gesamt','je ha'],stufen(r,r.fl),{columnStyles:R([1,2]),...fett});
      const ms=L('massnahmen').filter(m=>m.schlag_id===sid&&m.wj===wj).sort((x,z)=>(x.datum||'').localeCompare(z.datum||''));
      if(y>235){doc.addPage();y=20}
      y=h2('Maßnahmen ('+ms.length+')',y);
      if(ms.length){const sum=ms.reduce((q,m)=>q+massCost(m).total,0);
        tab(y+2,['Datum','Maßnahme','Mittel / Maschinen','Kosten','je ha'],[...ms.map(m=>{const c=massCost(m);return [fmtD(m.datum),(m.titel||TYP[m.typ]?.[0]||'')+(m.status==='geplant'?' (geplant)':''),massDetail(m).replace(/×/g,'x'),e0(c.total),eha(c.total,c.fl)]}),['','Summe','',e0(sum),eha(sum,r.fl)]],{columnStyles:{0:{cellWidth:20},2:{cellWidth:78},3:{halign:'right'},4:{halign:'right'}},didParseCell:d=>{if(d.section==='body'&&d.row.raw[1]==='Summe')d.cell.styles.fontStyle='bold'}})}
      else{doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...GR);doc.text('Keine Maßnahmen erfasst.',M,y+5)}
    }
  }
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){doc.setPage(i);const pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight();doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GR);doc.text('Ackerschlagkartei · '+betriebName(),M,ph-8);doc.text('Seite '+i+' von '+n,pw-M,ph-8,{align:'right'})}
  const name=o.nur?('Schlag_'+(D.schlaege[o.nur].name||'').replace(/[^A-Za-z0-9ÄÖÜäöüß_-]+/g,'_')+'_'+wj.replace('/','-')):('Auswertung_'+wj.replace('/','-'));
  await DL.save({filename:name+'.pdf',data:doc.output('blob')});toast('PDF erstellt');
}

/* ---------- Export ---------- */
const csvCell=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const csv=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n');
const dn=n=>nf(n,2).replace(/\./g,'');
async function saveFile(filename,data){if(!DL)return toast('Export ist hier nicht verfügbar.');try{const r=await DL.save({filename,data});if(r&&r.status==='saved')toast('Datei gespeichert')}catch(e){if(e&&e.code!=='cancelled'&&e.code!=='declined')toast('Export nicht möglich ('+(e&&e.code||'Fehler')+')')}}
function exportCSV(){const wj=curWJ();const t=farm(wj);const rows=[['Schlag','Fläche ha','Kultur','Erlös €','Saatgut €','Dünger €','PSM €','Sonstiges €','DB I €','Maschinen & Lohn €','DB II €','Pacht €','nach Pacht €','nach Pacht €/ha']];t.rows.forEach(r=>rows.push([r.name,dn(r.fl),r.kultur,dn(r.erloes),dn(r.saatgut),dn(r.duenger),dn(r.psm),dn(r.sonst),dn(r.db1),dn(r.masch),dn(r.db2),dn(r.pacht),dn(r.np),dn(r.ha.np)]));rows.push(['Summe Betrieb',dn(t.fl),'',dn(t.erloes),dn(t.saatgut),dn(t.duenger),dn(t.psm),dn(t.sonst),dn(t.db1),dn(t.masch),dn(t.db2),dn(t.pacht),dn(t.np),dn(t.fl?t.np/t.fl:0)]);saveFile(`Auswertung_${wj.replace('/','-')}.csv`,csv(rows))}
function exportMass(){const wj=curWJ();const rows=[['Datum','Schlag','Art','Bezeichnung','Status','Mittel','Maschinen','Kosten €','Kosten €/ha']];L('massnahmen').filter(m=>m.wj===wj).sort((a,b)=>(a.datum||'').localeCompare(b.datum||'')).forEach(m=>{const c=massCost(m);rows.push([m.datum,D.schlaege[m.schlag_id]?.name||'',TYP[m.typ]?.[0]||m.typ,m.titel,m.status,(m.mittel||[]).map(x=>`${x.name} ${fmtIn(x.menge_pro_ha)} ${x.einheit}/ha`).join(', '),(m.maschinen||[]).map(y=>y.name).join(', '),dn(c.total),dn(c.perHa)])});saveFile(`Massnahmen_${wj.replace('/','-')}.csv`,csv(rows))}
function exportJSON(){const o={};COLS.forEach(c=>o[c]=L(c));saveFile(`Ackerschlagkartei_Sicherung_${todayISO()}.json`,JSON.stringify(o,null,1))}

/* ---------- Aktionen ---------- */
const ACT={
  tab:d=>{S.sel=null;S.listOpen=false;go(d.v)},go:d=>go(d.v,{push:true}),back,
  schlag:d=>go('schlag',{push:true,sel:d.id}),selClear:()=>{S.sel=null;render()},listToggle:()=>{S.listOpen=!S.listOpen;S.sel=null;render()},
  mapK:d=>{S.mapK=d.k;S.sel=null;MAP.vb=null;render()},zoom:d=>zoomMap(+d.z),fit:()=>{MAP.vb=null;MAP.gkey='';render()},locate,layers:layersSheet,drawUndo,drawSave,drawCancel:()=>{S.draw=null;MAP.gkey='';render()},startDraw:d=>startDraw(d.id),base:d=>{setBase(d.k);closeSheet()},flur:(d,t)=>setFlur(t.checked),
  mf:d=>{S.mf=d.t;render()},seg:d=>{S.seg=d.k;ls.set('seg',d.k);render(true)},mseg:d=>{S.mseg=d.k;render()},stallSeg:d=>{S.stallSeg=d.k;render()},
  asInbox:()=>toInbox(),inbox:openInbox,
  ibSave:async(d,b)=>{const x=D.eingang[d.id];const a=x&&x.vorschlag&&x.vorschlag.aktionen[+d.i];if(!a)return;b.disabled=true;const r=await asApply(a,false);if(r===true)await ibMark(d.id,+d.i);else{b.disabled=false;if(r==='form')ibMark(d.id,+d.i)}},
  ibEdit:async d=>{const x=D.eingang[d.id];const a=x&&x.vorschlag&&x.vorschlag.aktionen[+d.i];if(!a)return;await ibMark(d.id,+d.i);asApply(a,true)},
  ibDrop:async d=>{await del('eingang',d.id);drawInbox()},
  ibLocal:async d=>{const x=D.eingang[d.id];if(!x)return;const r=parseLocal(x.text);await put('eingang',x.id,{...x,status:r.aktionen.length?'bereit':'fehler',vorschlag:r});drawInbox()},
  closeSheet,assistant:d=>openAssistant(d.mode),fabMic:()=>openAssistant('voice'),asMic,asGo,reload:()=>location.reload(),logout:async()=>{if(SB)await SB.auth.signOut();ls.set('cache',null);location.reload()},signIn,signUp,forgotPw,setPw,newBetrieb,authMode:d=>{S.authMode=d.m;render(true)},authBack:()=>{S.auth='login';S.authMode='login';render(true)},
  asSave:async(d,b)=>{const a=AS.out.aktionen.find(x=>x._id===d.id);if(!a)return;b.disabled=true;const r=await asApply(a,false);if(r===true){a._done=true;drawAS()}else if(r===false)b.disabled=false},
  asEdit:d=>{const a=AS.out.aktionen.find(x=>x._id===d.id);if(a)asApply(a,true)},
  asSaveAll:async(d,b)=>{b.disabled=true;for(const a of AS.out.aktionen){if(a._done)continue;const r=await asApply(a,false);if(r==='form')return;if(r===true)a._done=true}drawAS()},
  schlagForm:d=>schlagForm(d.id),anbauForm:d=>anbauForm(d.id),pachtForm:d=>pachtForm(d.id||null,d.sid),maschForm:d=>maschForm(d.id),
  mittelForm:()=>mittelForm(),mittelDetail:d=>mittelDetail(d.id),mittelEdit:d=>{closeSheet();mittelForm(d.id)},
  massNew:d=>massForm(d.sid?{schlag_ids:[d.sid]}:{schlag_ids:S.view==='massnahmen'&&S.ms?[S.ms]:[]}),massEdit:d=>massForm({id:d.id}),
  mfSchlag:d=>{mfRead();const ed=!!MF.id;if(ed)MF.schlag_ids=[d.id];else MF.schlag_ids=MF.schlag_ids.includes(d.id)?MF.schlag_ids.filter(x=>x!==d.id):[...MF.schlag_ids,d.id];drawMF()},
  mfAddM:()=>{mfRead();MF.mittel.push({mittel_id:'',name:'',kategorie:{duengung:'duenger',pflanzenschutz:'psm',aussaat:'saatgut'}[MF.typ]||'sonstiges',einheit:'kg',menge_pro_ha:null,preis:null});drawMF()},
  mfDelM:d=>{mfRead();MF.mittel.splice(+d.i,1);drawMF()},
  mfAddG:()=>{mfRead();MF.maschinen.push({maschine_id:'',abrechnung:'ha',menge:null,satz:null});drawMF()},
  mfDelG:d=>{mfRead();MF.maschinen.splice(+d.i,1);drawMF()},
  milchForm:d=>milchForm(d.id),dvForm:d=>dvForm(d.id),skForm:d=>skForm(d.id),tierForm:d=>tierForm(d.id),tier:d=>go('tier',{push:true,sel:d.id}),evForm:d=>evForm(d.tier,d.art,d.id||null),mlpBulk,herdeF:d=>{S.herdeF=d.k;render()},herdeSort:d=>{S.herdeSort=d.k;render()},skostForm:d=>skostForm(d.id),
  saveSettings:async()=>{await put('settings','main',{...SET(),name:val('set-name'),kalk_pacht:nval('set-kp')??0});toast('Gespeichert')},
  exportCSV,exportMass,exportJSON,
  demoDel:async(d,b)=>{if(!b.dataset.c){b.dataset.c=1;b.textContent='Wirklich alle löschen?';return}b.disabled=true;for(const c of COLS){for(const x of L(c)){if(x.demo)await del(c,x.id)}}toast('Beispieldaten entfernt')},
  impSrc:d=>{S.imp={src:d.k,kind:S.imp?.kind||'schlaege'};render()},impKind:d=>{S.imp={src:'mr',kind:d.k};render()},
  impRun,impAI,pdfDialog:d=>pdfDialog(d.id||null),inviteNew,inviteDel,inviteCopy:()=>{navigator.clipboard&&navigator.clipboard.writeText(S.neuLink).then(()=>toast('Link kopiert'),()=>toast('Bitte den Link markieren und kopieren.'))},inviteShare:()=>{navigator.share({title:'Einladung zur Hof-App',text:inviteText(S.neuLink)}).catch(()=>{})},botNew,botRevoke,copyBot:()=>{navigator.clipboard&&navigator.clipboard.writeText(S.botToken||'').then(()=>toast('Kopiert'),()=>toast('Bitte den Schlüssel markieren und kopieren.'))},memberDel,demoLoad,copyLink:()=>{const u=location.origin+location.pathname;navigator.clipboard&&navigator.clipboard.writeText(u).then(()=>toast('Link kopiert'),()=>toast(u))},
  impSaveVorl:async()=>{impReadMap();const imp=S.imp;const kind=imp.src==='mr'?imp.kind:'geo';await put('vorlagen',uid(),{src:imp.src,kind,map:imp.map,name:(imp.file||'Vorlage')+' · '+fmtD(todayISO())});toast('Vorlage gespeichert')}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;const f=ACT[t.dataset.act];if(f){if(t.tagName!=='INPUT')e.preventDefault();f(t.dataset,t,e)}});
document.addEventListener('change',e=>{const id=e.target.id;
  if(id==='wjsel'){if(e.target.value==='__neu'){e.target.value=curWJ();wjAdd();return}S.wj=e.target.value;ls.set('wj',S.wj);render()}
  else if(id==='betriebsel'){BETRIEB=S.betriebe.find(b=>b.id===e.target.value);ls.set('betrieb',BETRIEB.id);loadBetrieb()}
  else if(id==='ysel'){S.stallYear=+e.target.value;render()}
  else if(id==='msel'){S.ms=e.target.value;render()}
  else if(id==='imp-file'){const f=e.target.files&&e.target.files[0];if(f)impFile(f)}
  else if(id==='imp-vorl'){const v=D.vorlagen[e.target.value];if(v){S.imp.map={...v.map};render()}}
  else if(id&&id.startsWith('map-')){impReadMap();render()}
});
document.addEventListener('input',e=>{const id=e.target.id;if(id==='mapq'){S.mapQ=e.target.value;S.sel=null;MAP.vb=null;render()}else if(id==='msearch'){S.msearch=e.target.value;render()}else if(id==='herdeq'){S.herdeQ=e.target.value;render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#sheet').hidden)closeSheet()});
window.addEventListener('resize',()=>{if(S.view==='karte'){MAP.vb=null;render()}});

boot();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
