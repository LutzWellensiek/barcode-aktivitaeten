import * as db from './db.js';
import * as outbox from './outbox.js';
import {groupRequest,validateEndpoint} from './group-bridge.js';
import {validTheme} from './theme-data.js';
import {FEATURES,VILLAGE,personKey,cleanName,groupStats} from './freebies.js';
let config=null,confirmed={entries:[],votes:{},villages:{}},cached=false,loadPromise=null,lastRead=0,lastFullRead=0,generation=0,hasSnapshot=false;
try{config=globalThis.google?.script?.run?{native:true}:JSON.parse(localStorage.getItem('unterwegs-group')||'null');}catch{}
export const isHosted=()=>!!globalThis.google?.script?.run;
export const isGroup=()=>!!config;
export const isCached=()=>cached;
export const connectionConfig=()=>config;
export const pendingOperations=()=>outbox.pendingJobs();
export const hasPending=()=>pendingOperations().length>0;
export const entryPending=id=>pendingOperations().some(j=>j.action==='add'&&j.data.entry.id===id);
export const operationQueue=outbox;
function signal(detail={}){window.dispatchEvent(new CustomEvent('draussen-sync',{detail}));}
function accept(next){if(!next?.entries)return;if(Number.isFinite(next.revision)&&Number.isFinite(confirmed.revision)&&next.revision<confirmed.revision)return;confirmed=next;hasSnapshot=true;cached=false;generation++;}
export function getSnapshot(){const state={...confirmed,entries:[...confirmed.entries],themes:{...confirmed.themes},sounds:{...confirmed.sounds}};for(const job of pendingOperations().sort((a,b)=>a.createdAt-b.createdAt)){const d=job.data;if(job.action==='add'){if(!state.entries.some(e=>e.id===d.entry.id||d.entry.barcode&&e.barcode===d.entry.barcode))state.entries.push({...d.entry,_pending:true});}else if(job.action==='delete')state.entries=state.entries.filter(e=>e.id!==d.id);else if(job.action==='reset')state.entries=state.entries.filter(e=>!d.ids.includes(e.id));else if(job.action==='theme')state.themes[personKey(d.name)]=d.theme;else if(job.action==='sound')state.sounds[personKey(d.name)]=d.enabled;else if(job.action==='assign')state.entries=state.entries.map(e=>e.id===d.id?{...e,person:d.name,_pending:true}:e);}return state;}
async function localState(){const rows=await db.metaAll(),state={entries:await db.allEntries(),votes:{},villages:{},themes:Object.create(null),sounds:Object.create(null)};for(const {key,value} of rows){if(key.startsWith('sound:')&&typeof value==='boolean')state.sounds[key.slice(6)]=value;if(key.startsWith('theme:')&&validTheme(value))state.themes[key.slice(6)]=value;if(key.startsWith('vote:'))state.votes[key.slice(5)]=value;if(key.startsWith('village:'))state.villages[key.slice(8)]=value;}return state;}
async function persist(){if(config)await db.metaPut('group-cache:'+(config.endpoint||'native'),confirmed).catch(()=>{});}
outbox.setCompletionHandler(async(job,result)=>{if(result?.entries){accept(result);await persist();}});
outbox.subscribe(event=>{if(event.type==='external'){signal(event);return;}if(event.type==='done'||event.type==='error')generation++;queueMicrotask(()=>signal(event));});
export async function cachedState(){if(!config)return null;await outbox.start(config);try{const found=await db.getMeta('group-cache:'+(config.endpoint||'native'));if(found?.value?.entries){confirmed=found.value;hasSnapshot=true;cached=true;return getSnapshot();}}catch{}return hasPending()?getSnapshot():null;}
export async function loadState({force=false}={}){if(!config){cached=false;confirmed=await localState();return getSnapshot();}if(loadPromise)return loadPromise;if(!force&&lastRead&&Date.now()-lastRead<1500)return getSnapshot();const version=generation,full=force||!lastFullRead||Date.now()-lastFullRead>300000;loadPromise=(async()=>{try{const next=await groupRequest(config,'read',{revision:full?undefined:confirmed.revision,force:full});if(version===generation||Number.isFinite(next.revision)){if(!next.unchanged)accept(next);cached=false;}lastRead=Date.now();if(full)lastFullRead=lastRead;void persist();return getSnapshot();}catch(error){cached=true;if(hasSnapshot||confirmed.entries.length||lastRead||hasPending())return getSnapshot();throw error;}finally{loadPromise=null;}})();return loadPromise;}
async function remote(action,data){const result=await groupRequest(config,action,data);accept(result);void persist();return getSnapshot();}
async function queue(action,data,id){await outbox.enqueue(action,data,{id});return getSnapshot();}
export async function connect(endpoint,key){const next={endpoint:validateEndpoint(endpoint),key:String(key).trim()};if(next.key.length<16)throw new Error('Bitte den Gruppenschlüssel eingeben (mindestens 16 Zeichen).');const state=await groupRequest(next,'read');config=next;localStorage.setItem('unterwegs-group',JSON.stringify(config));confirmed=state;cached=false;await outbox.start(config);await persist();return getSnapshot();}
export async function disconnect(){config=null;localStorage.removeItem('unterwegs-group');await outbox.start(null);return loadState();}
export async function save(entry){if(config){const duplicate=getSnapshot().entries.find(e=>e.id===entry.id||entry.barcode&&e.barcode===entry.barcode);if(duplicate){if(duplicate.id===entry.id)return getSnapshot();const e=new Error('Bereits erfasst. Dieser Barcode wird nicht doppelt gezählt.');e.name='ConstraintError';throw e;}return queue('add',{entry},'entry:'+entry.id);}await db.addEntry(entry);return loadState();}
export async function remove(id,name){if(config)return queue('delete',{id,name},'delete:'+id);await db.deleteEntry(id);return loadState();}
export async function reset(name){if(config){const ids=getSnapshot().entries.filter(e=>personKey(e.person)===personKey(name)).map(e=>e.id);return queue('reset',{name,ids});}await db.clearEntries();return loadState();}
export async function assign(id,name){cleanName(name);if(config)return queue('assign',{id,name},'assign:'+id);await db.assignEntry(id,name);return loadState();}
export async function vote(name,feature){const key=personKey(cleanName(name));if(!FEATURES.some(x=>x.id===feature))throw new Error('Unbekannte Abstimmung.');if(config)return remote('vote',{name,feature});await db.metaPut('vote:'+key,feature);return loadState();}
export async function unlock(name,id){const key=personKey(cleanName(name)),stage=VILLAGE.find(x=>x.id===id);if(!stage)throw new Error('Unbekanntes Gebäude.');if(config)return remote('unlock',{name,id});confirmed=await localState();if((groupStats(confirmed.entries).persons.get(key)?.totalCents||0)<stage.cents)throw new Error('Dafür hast du noch nicht genug gespart.');const ids=[...new Set([1,...(confirmed.villages[key]||[]),id])];await db.metaPut('village:'+key,ids);return loadState();}
export async function setTheme(name,theme){const key=personKey(cleanName(name));if(!validTheme(theme))throw new Error('Unbekannter Farbstil.');if(config)return queue('theme',{name,theme});await db.metaPut('theme:'+key,theme);return loadState();}
export async function setSound(name,enabled){const key=personKey(cleanName(name));if(typeof enabled!=='boolean')throw new Error('Ungültige Ton-Einstellung.');if(config)return queue('sound',{name,enabled});await db.metaPut('sound:'+key,enabled);return loadState();}
