/* ECO PANTAS — satu sumber kebenaran untuk sesi, progres, dan timer. */
export const STORAGE_KEY = 'ecoPantasSession_v6';
export const SESSION_LIMIT_SECONDS = 7 * 60;
export const DIGITAL_STATIONS = ['mata', 'hati', 'tangan'];
export const STATIONS = [
  { key:'mata', title:'Mata Alam', short:'Mata', icon:'👀', badge:'badgemataalam.png', href:'stasiun/mata.html', tint:'#eaf4d4', mode:'Jelajah interaktif + puzzle susun gambar', description:'Jelajahi kebun, sungai, dan kampung; lalu susun kembali gambar lingkungan sehat.' },
  { key:'hati', title:'Hati Peduli', short:'Hati', icon:'💚', badge:'badgehatipeduli.png', href:'stasiun/hati.html', tint:'#fae8df', mode:'Engklek Pintar · kuis bergambar 20 soal', description:'Jawab pertanyaan tentang alam, sampah, hemat air, sopan santun, dan gotong royong.' },
  { key:'tangan', title:'Tangan Terampil', short:'Tangan', icon:'👐', badge:'badgetanganterampil.png', href:'stasiun/tangan.html', tint:'#def0ed', mode:'Misi pilah 15 benda · sentuh atau seret', description:'Pilah benda ke kelompok organik, daur ulang/guna ulang, dan residu.' },
  { key:'aksi-nyata', title:'Gotong Royong Cilik', short:'Aksi nyata', icon:'🌼', badge:'badgeksatriagotongroyong.png', href:'stasiun/aksi-nyata.html', tint:'#f9edce', mode:'Checklist aksi nyata bersama pendamping', description:'Pilih aksi yang benar-benar dilakukan di rumah atau sekolah dengan guru/orang tua.' }
];
const LEGACY_KEYS = ['ecoGameSession_v5', 'ecoGameSession_v4'];
const STATION_ALIASES = { mata:['mata','observation','observe','challenge3','challenge-3','puzzle'], hati:['hati','care','feeling','challenge2','challenge-2','quiz'], tangan:['tangan','sorting','challenge1','challenge-1','trash'], 'aksi-nyata':['aksi','aksi-nyata','action','exploration','challenge4','challenge-4'] };
const now = () => Date.now();
// Memory fallback keeps the game usable when browser storage is unavailable.
let memorySession = null;

function readStoredValues(key){
  const values=[];
  for(const storageName of ['localStorage','sessionStorage']){
    try{
      const storage=globalThis[storageName];
      const value=storage?.getItem(key);
      if(value!==null&&value!==undefined&&!values.includes(value))values.push(value);
    }catch(e){/* Try the other storage backend. */}
  }
  return values;
}
function writeStoredValue(key,value){
  let written=false;
  for(const storageName of ['localStorage','sessionStorage']){
    try{const storage=globalThis[storageName];storage?.setItem(key,value);if(storage)written=true;}catch(e){/* Keep trying other backends; memory remains the final fallback. */}
  }
  return written;
}
function defaultSession(){
  return { schemaVersion:6, createdAt:now(), startedAt:null, deadlineAt:null, digitalFinishedAt:null, status:'ready', completed:{mata:false,hati:false,tangan:false,'aksi-nyata':false}, badges:[], activities:{mata:{},hati:{},tangan:{},'aksi-nyata':{}}, attempts:[], childName:'', lastUpdatedAt:now() };
}
function asTimestamp(value){
  if(value===undefined||value===null||value==='') return null;
  if(typeof value==='number' && Number.isFinite(value)) return value < 1e11 ? value*1000 : value;
  if(typeof value==='string') { const n=Number(value); if(Number.isFinite(n)) return n < 1e11 ? n*1000 : n; const d=Date.parse(value); return Number.isNaN(d)?null:d; }
  return null;
}
function bool(v){ return v===true || v===1 || v==='true' || v==='completed' || v==='done'; }
function findLegacyCompletion(old, station){
  const aliases=STATION_ALIASES[station]||[station];
  const scan=(obj, depth=0)=>{
    if(!obj||typeof obj!=='object'||depth>4) return false;
    if(Array.isArray(obj)){
      for(const item of obj){
        if(item&&typeof item==='object'){
          const label=JSON.stringify(item).toLowerCase().replace(/[^a-z0-9]/g,'');
          const isDone=bool(item.completed)||bool(item.complete)||bool(item.done)||bool(item.isComplete)||bool(item.status);
          if(isDone&&aliases.some(a=>label.includes(a.replace(/[^a-z0-9]/g,'')))) return true;
        }
      }
    }
    for(const [k,v] of Object.entries(obj)){
      const nk=k.toLowerCase().replace(/[^a-z0-9]/g,'');
      if(aliases.some(a=>nk.includes(a.replace(/[^a-z0-9]/g,''))) && (bool(v)|| (v&&typeof v==='object'&&(bool(v.completed)||bool(v.complete)||bool(v.done)||bool(v.isComplete))))) return true;
      if(k.toLowerCase().includes('completed') && Array.isArray(v)){
        if(v.some(x=>aliases.some(a=>String(x).toLowerCase().includes(a)))) return true;
        const oldChallengeNumber={'mata':[3],'hati':[2],'tangan':[1],'aksi-nyata':[4]};
        if((oldChallengeNumber[station]||[]).some(n=>v.some(x=>Number(x)===n||String(x).toLowerCase()===`challenge${n}`))) return true;
      }
      if(v&&typeof v==='object'&&scan(v,depth+1)) return true;
    }
    return false;
  };
  return scan(old);
}
function normalizeStationKey(key){
  const normalized=String(key||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  for(const [station,aliases] of Object.entries(STATION_ALIASES)){
    if(aliases.some(alias=>alias.toLowerCase().replace(/[^a-z0-9]/g,'')===normalized))return station;
  }
  return STATIONS.some(st=>st.key.replace(/[^a-z0-9]/g,'')===normalized)
    ? STATIONS.find(st=>st.key.replace(/[^a-z0-9]/g,'')===normalized).key : null;
}
function legacyTimer(old, mode){
  const oldStart=asTimestamp(old.startedAt ?? old.startTime ?? old.startTimestamp ?? old.started ?? old.start_time);
  const oldDeadline=asTimestamp(old.deadlineAt ?? old.endTime ?? old.endTimestamp ?? old.deadline);
  let remaining=Number(old.remainingSeconds ?? old.timeLeftSeconds ?? old.timeRemaining ?? old.remainingTime);
  if(Number.isFinite(remaining)&&remaining>SESSION_LIMIT_SECONDS&&remaining<=SESSION_LIMIT_SECONDS*1000)remaining=Math.ceil(remaining/1000);
  if(!(Number.isFinite(remaining)&&remaining>0&&remaining<=SESSION_LIMIT_SECONDS))remaining=null;
  if(mode==='deadline'&&oldDeadline&&oldDeadline>0)return {startedAt:oldStart||Math.max(0,oldDeadline-SESSION_LIMIT_SECONDS*1000),deadlineAt:oldDeadline};
  if(mode==='remaining'&&remaining!==null)return {startedAt:oldStart||now()-(SESSION_LIMIT_SECONDS-remaining)*1000,deadlineAt:now()+remaining*1000};
  if(mode==='start'&&oldStart&&oldStart>0)return {startedAt:oldStart,deadlineAt:oldStart+SESSION_LIMIT_SECONDS*1000};
  return null;
}
function migrateLegacy(){
  const candidates=[];
  for(const key of LEGACY_KEYS){
    for(const raw of readStoredValues(key)){
      try{
        if(!raw)continue;
        const old=JSON.parse(raw);
        if(old&&typeof old==='object'&&!Array.isArray(old)&&!candidates.some(item=>item.key===key&&JSON.stringify(item.old)===JSON.stringify(old)))candidates.push({key,old});
      }catch(e){/* Ignore malformed legacy keys and keep checking the other format. */}
    }
  }
  if(!candidates.length){
    const fresh=defaultSession();memorySession=fresh;
    writeStoredValue(STORAGE_KEY,JSON.stringify(fresh));
    return fresh;
  }

  const s=defaultSession();
  // Merge both formats: v5 may own the timer while v4 may still own challenge progress.
  for(const station of Object.keys(s.completed)){
    s.completed[station]=candidates.some(({old})=>findLegacyCompletion(old,station));
  }
  // Merge activity data from the older key first, then allow v5 to override shared fields.
  for(const {old} of [...candidates].reverse()){
    if(old.activities&&typeof old.activities==='object'){
      for(const [rawKey,value] of Object.entries(old.activities)){
        const station=normalizeStationKey(rawKey);
        if(station&&value&&typeof value==='object')s.activities[station]={...(s.activities[station]||{}),...value};
      }
    }
    if(old.progress&&typeof old.progress==='object'){
      for(const station of Object.keys(s.completed)){
        if(old.progress[station]!==undefined&&bool(old.progress[station]))s.completed[station]=true;
      }
    }
    if(Array.isArray(old.attempts))s.attempts.push(...old.attempts);
    if(typeof old.childName==='string'&&!s.childName)s.childName=old.childName.slice(0,40);
  }
  s.attempts=s.attempts.slice(-200);

  // Prefer an explicit deadline from v5/v4, then remaining time, and finally start time.
  let timer=null;
  for(const mode of ['deadline','remaining','start']){
    for(const {old} of candidates){
      timer=legacyTimer(old,mode);
      if(timer)break;
    }
    if(timer)break;
  }
  if(timer){
    s.startedAt=timer.startedAt;s.deadlineAt=timer.deadlineAt;
    s.status=s.deadlineAt<=now()?'timeup':'playing';
  }else if(candidates.some(({old})=>['timeup','expired'].includes(String(old.status||'').toLowerCase()))){
    s.status='timeup';s.deadlineAt=null;
  }else if(Object.values(s.completed).some(Boolean)||candidates.some(({old})=>['playing','active','running'].includes(String(old.status||'').toLowerCase()))){
    // If a legacy format kept progress but omitted its timer, give the resumed journey one clean deadline.
    s.startedAt=now();s.deadlineAt=s.startedAt+SESSION_LIMIT_SECONDS*1000;s.status='playing';
  }
  s.migratedFrom=candidates.map(x=>x.key).join('+');
  s.lastUpdatedAt=now();
  if(DIGITAL_STATIONS.every(k=>s.completed[k])){
    s.deadlineAt=null;
    if(s.completed['aksi-nyata']){s.status='completed';s.finishedAt=now();}
    else{s.status='offline';s.digitalFinishedAt=now();}
  }
  memorySession=s;
  writeStoredValue(STORAGE_KEY,JSON.stringify(s));
  return s;
}
function normalize(raw){
  const d=defaultSession();
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const s={...d,...source};
  s.schemaVersion=6;
  s.completed=Object.fromEntries(Object.keys(d.completed).map(k=>[k,source.completed?.[k]===true]));
  s.activities=Object.fromEntries(Object.keys(d.activities).map(k=>[k,{...(d.activities[k]||{}),...(source.activities?.[k]&&typeof source.activities[k]==='object'?source.activities[k]:{})}]));
  s.badges=Array.isArray(source.badges)?[...new Set(source.badges.filter(k=>STATIONS.some(st=>st.key===k)))]:[];
  s.attempts=Array.isArray(source.attempts)?source.attempts.slice(-200):[];
  s.childName=typeof source.childName==='string'?source.childName.slice(0,40):'';
  const sourceUpdatedAt=Number(source.lastUpdatedAt);
  s.lastUpdatedAt=Number.isFinite(sourceUpdatedAt)&&sourceUpdatedAt>0?sourceUpdatedAt:0;
  const validStatuses=['ready','playing','offline','completed','timeup'];
  if(!validStatuses.includes(s.status))s.status='ready';
  if(s.status==='playing'&&(!Number.isFinite(Number(s.deadlineAt))||Number(s.deadlineAt)<=0)){
    s.status='timeup';s.deadlineAt=null;s.timedOutAt=now();
  }
  if(DIGITAL_STATIONS.every(k=>s.completed[k])){
    s.deadlineAt=null;
    if(s.completed['aksi-nyata']){s.status='completed';}
    else{s.status='offline';s.digitalFinishedAt=s.digitalFinishedAt||now();}
  }
  if(s.completed['aksi-nyata']){s.status='completed';s.deadlineAt=null;}
  return s;
}
export function getSession(){
  const candidates=[];
  // The in-memory copy may be newer when writes were blocked after an earlier read.
  if(memorySession&&typeof memorySession==='object'){
    const stamp=Number(memorySession.lastUpdatedAt);
    candidates.push({session:memorySession,updatedAt:Number.isFinite(stamp)?stamp:0,source:'memory'});
  }
  for(const raw of readStoredValues(STORAGE_KEY)){
    try{
      const parsed=JSON.parse(raw);
      if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))continue;
      const normalized=normalize(parsed);
      const stamp=Number(parsed.lastUpdatedAt);
      candidates.push({session:normalized,updatedAt:Number.isFinite(stamp)&&stamp>0?stamp:0,source:'storage'});
    }catch(e){/* Try other copies before migrating legacy state. */}
  }
  if(candidates.length){
    // Prefer the newest persisted/in-memory revision; memory wins ties to avoid losing a just-made change.
    candidates.sort((a,b)=>b.updatedAt-a.updatedAt||(a.source==='memory'?-1:b.source==='memory'?1:0));
    memorySession=candidates[0].session;
    writeStoredValue(STORAGE_KEY,JSON.stringify(memorySession));
    return memorySession;
  }
  return migrateLegacy();
}
function persist(session){
  session.lastUpdatedAt=now();memorySession=session;
  writeStoredValue(STORAGE_KEY,JSON.stringify(session));
  try{window.dispatchEvent(new CustomEvent('eco:sessionchange',{detail:session}));}catch(e){}
  return session;
}
export function updateSession(mutator){ const session=getSession(); mutator(session); return persist(session); }
export function startNewJourney(childName=''){
  const s=defaultSession(); s.status='playing'; s.startedAt=now(); s.deadlineAt=s.startedAt+SESSION_LIMIT_SECONDS*1000; s.childName=String(childName||'').trim().slice(0,40); persist(s); return s;
}
export function resetJourney(){ const s=defaultSession(); persist(s); return s; }
export function remainingSeconds(){
  const s=getSession();
  if(s.status!=='playing')return 0;
  const deadline=Number(s.deadlineAt);
  if(!Number.isFinite(deadline)||deadline<=0){
    updateSession(v=>{if(v.status==='playing'){v.status='timeup';v.deadlineAt=null;v.timedOutAt=now();}});
    return 0;
  }
  const left=Math.max(0,Math.ceil((deadline-now())/1000));
  if(left===0){updateSession(v=>{if(v.status==='playing'){v.status='timeup';v.deadlineAt=null;v.timedOutAt=now();}});}
  return left;
}
export function formatTime(seconds){const m=Math.floor(Math.max(0,seconds)/60);const s=Math.max(0,seconds)%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
export function digitalStationsComplete(session=getSession()){return DIGITAL_STATIONS.every(k=>session.completed[k]);}
export function isStationUnlocked(key, session=getSession()){
  const order=STATIONS.map(s=>s.key); const index=order.indexOf(key);
  if(index<0) return false;
  if(session.completed[key]) return true;
  if(session.status==='timeup'||session.status==='ready') return false;
  if(key==='mata') return session.status==='playing'||session.status==='offline'||session.status==='completed';
  if(key==='hati') return !!session.completed.mata;
  if(key==='tangan') return !!session.completed.hati;
  if(key==='aksi-nyata') return digitalStationsComplete(session)&&(session.status==='offline'||session.status==='completed');
  return false;
}
export function saveActivity(station, patch){return updateSession(s=>{s.activities[station]={...(s.activities[station]||{}),...patch};});}
export function recordAttempt(station, details={}){
  return updateSession(s=>{s.attempts.push({station,at:now(),...details}); if(s.attempts.length>200)s.attempts=s.attempts.slice(-200);});
}
export function completeStation(key, details={}){
  if(!STATIONS.some(st=>st.key===key))return getSession();
  let current=getSession();
  if(current.status==='playing'&&(!Number.isFinite(Number(current.deadlineAt))||Number(current.deadlineAt)<=now())){
    remainingSeconds();current=getSession();
  }
  // Do not award progress for locked stations or after the digital deadline.
  if(!current.completed[key]){
    if(DIGITAL_STATIONS.includes(key)&&(!isStationUnlocked(key,current)||current.status!=='playing'))return current;
    if(key==='aksi-nyata'&&(!digitalStationsComplete(current)||!['offline','completed'].includes(current.status)))return current;
  }
  return updateSession(s=>{
    if(!s.completed[key]) s.completed[key]=true;
    const def=STATIONS.find(x=>x.key===key); if(def&&!s.badges.includes(key))s.badges.push(key);
    s.activities[key]={...(s.activities[key]||{}),...details,completedAt:now()};
    if(DIGITAL_STATIONS.every(k=>s.completed[k]) && s.status==='playing'){s.status='offline';s.digitalFinishedAt=now();s.deadlineAt=null;}
    if(s.completed['aksi-nyata']){s.status='completed';s.finishedAt=now();s.deadlineAt=null;}
  });
}
export function getProgress(session=getSession()){return Object.values(session.completed).filter(Boolean).length;}
export function currentStep(session=getSession()){
  for(const s of STATIONS){if(!session.completed[s.key]) return s;}
  return null;
}
export function asset(name){return new URL(`../assets/images/${name}`,import.meta.url).href;}
export function svgAsset(path){return new URL(`../assets/svg/${path}`,import.meta.url).href;}
export function gameAsset(path){return new URL(`../assets/games/${path}`,import.meta.url).href;}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
