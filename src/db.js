import {TYPES,checkPrintBudget,personKey} from './freebies.js';
let connection;
export function openDB(){
 if(connection)return connection;
 connection=new Promise((resolve,reject)=>{const r=indexedDB.open('barcode-aktivitaeten',3);
  r.onupgradeneeded=event=>{const db=r.result,tx=r.transaction;let activities;if(!db.objectStoreNames.contains('activities')){activities=db.createObjectStore('activities',{keyPath:'id'});activities.createIndex('barcode','barcode',{unique:true});}else activities=tx.objectStore('activities');if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'key'});if(!db.objectStoreNames.contains('photo-images'))db.createObjectStore('photo-images',{keyPath:'id'});
   if(event.oldVersion<2&&db.objectStoreNames.contains('entries')){const cursor=tx.objectStore('entries').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(!c)return;const e=c.value;activities.add({...e,id:'barcode:'+e.barcode,person:e.person||'',amountCents:e.amountCents??TYPES[e.type]?.cents??0,title:e.title||'',source:'scan'});c.continue();};}
  };r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Bitte andere App-Tabs schließen und neu laden, damit der Speicher aktualisiert werden kann.'));
 });return connection;
}
async function run(store,mode,action){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let request;try{request=action(tx.objectStore(store));}catch(e){reject(e);return;}tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(tx.error||request?.error);tx.onabort=()=>reject(tx.error||request?.error||new Error('Speichern abgebrochen.'));});}
export const allEntries=()=>run('activities','readonly',s=>s.getAll());
export const getEntry=barcode=>run('activities','readonly',s=>s.index('barcode').get(barcode));
export async function addEntry(entry){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('activities','readwrite'),s=tx.objectStore('activities'),r=s.getAll();let failure;r.onsuccess=()=>{try{checkPrintBudget(r.result,entry);s.add(entry);}catch(e){failure=e;tx.abort();}};tx.oncomplete=()=>resolve();tx.onerror=event=>{failure=failure||event.target?.error||tx.error;};tx.onabort=()=>reject(failure||tx.error||new Error('Speichern abgebrochen.'));});}
export async function deleteEntry(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(['activities','meta','photo-images'],'readwrite');tx.objectStore('activities').delete(id);tx.objectStore('meta').delete('photo:'+id);tx.objectStore('photo-images').delete(id);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error);});}
export async function clearEntries(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(['activities','meta','photo-images'],'readwrite');tx.objectStore('activities').clear();tx.objectStore('photo-images').clear();const cursor=tx.objectStore('meta').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){if(c.key.startsWith('photo:'))c.delete();c.continue();}};tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error);});}
export const metaAll=()=>run('meta','readonly',s=>s.getAll());
export const metaPut=(key,value)=>run('meta','readwrite',s=>s.put({key,value}));
export async function assignEntry(id,name){const entries=await allEntries(),entry=entries.find(e=>e.id===id);if(!entry)throw new Error('Eintrag wurde nicht gefunden.');if(personKey(entry.person))throw new Error('Dieser Eintrag wurde bereits zugeordnet.');checkPrintBudget(entries,{...entry,person:name});return run('activities','readwrite',s=>s.put({...entry,person:name}));}

export const getMeta=key=>run('meta','readonly',s=>s.get(key));
export const addMeta=(key,value)=>run('meta','readwrite',s=>s.add({key,value}));
export const metaDelete=key=>run('meta','readwrite',s=>s.delete(key));

export const getPhotoImage=id=>run('photo-images','readonly',s=>s.get(id));
export async function addPhoto(meta,image){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(['activities','meta','photo-images'],'readwrite'),request=tx.objectStore('activities').get(meta.entryId);let failure;request.onsuccess=()=>{const e=request.result;if(!e||personKey(e.person)!==personKey(meta.person)){failure=new Error('Diese Aktivität ist nicht mehr verfügbar.');tx.abort();return;}tx.objectStore('meta').add({key:'photo:'+meta.id,value:meta});tx.objectStore('photo-images').add({id:meta.id,full:image.full,thumb:image.thumb});};tx.oncomplete=resolve;tx.onerror=event=>{failure=failure||event.target?.error||tx.error;};tx.onabort=()=>reject(failure||tx.error||new Error('Foto konnte nicht gespeichert werden.'));});}
export async function removePhoto(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(['meta','photo-images'],'readwrite');tx.objectStore('meta').delete('photo:'+id);tx.objectStore('photo-images').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
