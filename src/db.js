import {TYPES,checkPrintBudget,personKey} from './freebies.js';
let connection;
export function openDB(){
 if(connection)return connection;
 connection=new Promise((resolve,reject)=>{const r=indexedDB.open('barcode-aktivitaeten',2);
  r.onupgradeneeded=()=>{const db=r.result,tx=r.transaction;const activities=db.createObjectStore('activities',{keyPath:'id'});activities.createIndex('barcode','barcode',{unique:true});db.createObjectStore('meta',{keyPath:'key'});
   if(db.objectStoreNames.contains('entries')){const cursor=tx.objectStore('entries').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(!c)return;const e=c.value;activities.add({...e,id:'barcode:'+e.barcode,person:e.person||'',amountCents:e.amountCents??TYPES[e.type]?.cents??0,title:e.title||'',source:'scan'});c.continue();};}
  };r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Bitte andere App-Tabs schließen und neu laden, damit der Speicher aktualisiert werden kann.'));
 });return connection;
}
async function run(store,mode,action){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let request;try{request=action(tx.objectStore(store));}catch(e){reject(e);return;}tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(tx.error||request?.error);tx.onabort=()=>reject(tx.error||request?.error||new Error('Speichern abgebrochen.'));});}
export const allEntries=()=>run('activities','readonly',s=>s.getAll());
export const getEntry=barcode=>run('activities','readonly',s=>s.index('barcode').get(barcode));
export async function addEntry(entry){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('activities','readwrite'),s=tx.objectStore('activities'),r=s.getAll();let failure;r.onsuccess=()=>{try{checkPrintBudget(r.result,entry);s.add(entry);}catch(e){failure=e;tx.abort();}};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||tx.error||new Error('Speichern abgebrochen.'));});}
export const deleteEntry=id=>run('activities','readwrite',s=>s.delete(id));
export const clearEntries=()=>run('activities','readwrite',s=>s.clear());
export const metaAll=()=>run('meta','readonly',s=>s.getAll());
export const metaPut=(key,value)=>run('meta','readwrite',s=>s.put({key,value}));
export async function assignEntry(id,name){const entries=await allEntries(),entry=entries.find(e=>e.id===id);if(!entry)throw new Error('Eintrag wurde nicht gefunden.');if(personKey(entry.person))throw new Error('Dieser Eintrag wurde bereits zugeordnet.');checkPrintBudget(entries,{...entry,person:name});return run('activities','readwrite',s=>s.put({...entry,person:name}));}
