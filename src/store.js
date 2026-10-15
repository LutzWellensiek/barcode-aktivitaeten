import * as db from './db.js';
import {groupRequest,validateEndpoint} from './group-bridge.js';
import {FEATURES,VILLAGE,personKey,cleanName,groupStats} from './freebies.js';
let config=null,snapshot={entries:[],votes:{},villages:{}},cached=false;
try{config=globalThis.google?.script?.run?{native:true}:JSON.parse(localStorage.getItem('unterwegs-group')||'null');}catch{}
export const isHosted=()=>!!globalThis.google?.script?.run;
export const isGroup=()=>!!config;
export const isCached=()=>cached;
export const getSnapshot=()=>snapshot;
export function connectionConfig(){return config;}
async function localState(){const rows=await db.metaAll(),state={entries:await db.allEntries(),votes:{},villages:{}};for(const {key,value} of rows){if(key.startsWith('vote:'))state.votes[key.slice(5)]=value;if(key.startsWith('village:'))state.villages[key.slice(8)]=value;}return state;}
async function remote(action,data){if(!navigator.onLine)throw new Error('Die gemeinsame Gruppe benötigt eine Internetverbindung. Deine lokale Sammlung bleibt im Modus „Dieses Gerät“ verfügbar.');snapshot=await groupRequest(config,action,data);cached=false;await db.metaPut('group-cache:'+(config.endpoint||'native'),snapshot);return snapshot;}
export async function loadState(){if(!config){cached=false;snapshot=await localState();return snapshot;}try{return await remote('read',{});}catch(error){const all=await db.metaAll(),found=all.find(x=>x.key==='group-cache:'+(config.endpoint||'native'));if(found){snapshot=found.value;cached=true;return snapshot;}throw error;}}
export async function connect(endpoint,key){const next={endpoint:validateEndpoint(endpoint),key:String(key).trim()};if(next.key.length<16)throw new Error('Bitte den Gruppenschlüssel eingeben (mindestens 16 Zeichen).');const state=await groupRequest(next,'read');config=next;localStorage.setItem('unterwegs-group',JSON.stringify(config));snapshot=state;cached=false;await db.metaPut('group-cache:'+(config.endpoint||'native'),state);return state;}
export async function disconnect(){config=null;localStorage.removeItem('unterwegs-group');return loadState();}
export async function save(entry){if(config)return remote('add',{entry});await db.addEntry(entry);return loadState();}
export async function remove(id,name){if(config)return remote('delete',{id,name});await db.deleteEntry(id);return loadState();}
export async function reset(name){if(config)return remote('reset',{name});await db.clearEntries();return loadState();}
export async function assign(id,name){cleanName(name);if(config)return remote('assign',{id,name});await db.assignEntry(id,name);return loadState();}
export async function vote(name,feature){const key=personKey(cleanName(name));if(!FEATURES.some(x=>x.id===feature))throw new Error('Unbekannte Abstimmung.');if(config)return remote('vote',{name,feature});await db.metaPut('vote:'+key,feature);return loadState();}
export async function unlock(name,id){const key=personKey(cleanName(name)),stage=VILLAGE.find(x=>x.id===id);if(!stage)throw new Error('Unbekanntes Gebäude.');if(config)return remote('unlock',{name,id});snapshot=await localState();if((groupStats(snapshot.entries).persons.get(key)?.totalCents||0)<stage.cents)throw new Error('Dafür hast du noch nicht genug gespart.');const ids=[...new Set([1,...(snapshot.villages[key]||[]),id])];await db.metaPut('village:'+key,ids);return loadState();}
