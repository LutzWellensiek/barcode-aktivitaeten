let connection;
export function openDB() {
  if (connection) return connection;
  connection = new Promise((resolve,reject)=>{
    const request=indexedDB.open('barcode-aktivitaeten',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('entries',{keyPath:'barcode'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Datenbank blockiert. Andere Tabs schließen und neu laden.'));
  });
  return connection;
}
async function transaction(mode, action) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('entries',mode);
    let request;
    try { request=action(tx.objectStore('entries')); } catch(e) {reject(e);return;}
    tx.oncomplete=()=>resolve(request?.result);
    tx.onerror=()=>reject(tx.error || request?.error);
    tx.onabort=()=>reject(tx.error || request?.error || new Error('Speichern abgebrochen.'));
  });
}
export const allEntries=()=>transaction('readonly',store=>store.getAll());
export const getEntry=barcode=>transaction('readonly',store=>store.get(barcode));
export const addEntry=entry=>transaction('readwrite',store=>store.add(entry));
export const deleteEntry=barcode=>transaction('readwrite',store=>store.delete(barcode));
export const clearEntries=()=>transaction('readwrite',store=>store.clear());
