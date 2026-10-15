import {detectBarcode,normalizeBarcode,localDate,validDate,statistics,csv} from './core.js';
import {allEntries,getEntry,addEntry,deleteEntry,clearEntries} from './db.js';
import {createReader,cameraMessage} from './scanner.js';
const $=id=>document.getElementById(id);
const typeNames={karren:'Karren',stadtbad:'Stadtbad',other:'Andere Aktivität'};
let entries=[],pending=null,controls=null,reader=null,cameraGeneration=0,cameraStarting=false,storageReady=false;
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('barcode-entries'):null;
const displayDate=value=>new Intl.DateTimeFormat('de-DE').format(new Date(`${value}T12:00:00`));
function feedback(message,error=false){$('feedback').textContent=message;$('feedback').classList.toggle('error',error);$('feedback').hidden=false;}
function storageError(error){$('storage-error').hidden=false;$('storage-error').textContent=`Browser-Speicher nicht verfügbar: ${error?.message || 'Unbekannter Fehler'}. Es wurde nichts als gespeichert bestätigt. Bitte Browser-Speicher freigeben bzw. privaten Modus verlassen und erneut laden.`;}
async function refresh(){entries=await allEntries();entries.sort((a,b)=>b.date.localeCompare(a.date)||b.scannedAt.localeCompare(a.scannedAt));render();}
function render(){
  const stats=statistics(entries);for(const key of ['total','karren','stadtbad','month']) $(`stat-${key}`).textContent=stats[key];
  $('export').disabled=entries.length===0;$('reset').disabled=entries.length===0;
  const filter=$('filter').value,search=$('search').value.replace(/\s/g,'');
  const visible=entries.filter(e=>(filter==='all'||e.type===filter)&&e.barcode.includes(search));
  $('history-count').textContent=entries.length?`${visible.length} von ${entries.length} Tickets · nach Besuchsdatum sortiert`:'';
  $('entries').replaceChildren();$('empty').hidden=visible.length>0;
  $('empty').querySelector('h3').textContent=entries.length?'Keine passenden Tickets.':'Hier ist Platz für Erlebnisse.';
  $('empty').querySelector('p').textContent=entries.length?'Versuche einen anderen Filter.':'Dein erstes gescanntes Ticket macht den Anfang.';
  for(const entry of visible){
    const article=document.createElement('article');article.className='entry';
    const icon=document.createElement('span');icon.className=`entry-icon ${entry.type==='stadtbad'?'water':''}`;icon.textContent=entry.type==='karren'?'↟':entry.type==='stadtbad'?'≈':'•';icon.setAttribute('aria-hidden','true');
    const body=document.createElement('div');const title=document.createElement('h3');title.textContent=typeNames[entry.type];
    const date=document.createElement('time');date.dateTime=entry.date;date.textContent=displayDate(entry.date);
    const code=document.createElement('code');code.textContent=entry.barcode;
    const tag=document.createElement('span');tag.className='tag';tag.textContent=entry.assignment==='manual'?'Manuell zugeordnet':entry.detected.confidence==='experimentell'?'Karren · experimentell':'Stadtbad · wahrscheinlich';
    const scanned=document.createElement('p');scanned.className='hint';scanned.textContent=`Erfasst ${new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(entry.scannedAt))}`;
    body.append(title,date,code,tag,scanned);
    const remove=document.createElement('button');remove.className='delete-entry';remove.textContent='×';remove.type='button';remove.setAttribute('aria-label',`Eintrag ${entry.barcode} löschen`);
    remove.addEventListener('click',async()=>{if(await confirmAction('Eintrag löschen?',`${typeNames[entry.type]} vom ${displayDate(entry.date)} wird aus deiner Sammlung entfernt.`)){try{await deleteEntry(entry.barcode);channel?.postMessage('changed');await refresh();feedback('Eintrag gelöscht.');}catch(e){storageError(e);}}});
    article.append(icon,body,remove);$('entries').append(article);
  }
}
function confirmAction(title,message){return new Promise(resolve=>{const dialog=$('confirm-dialog');$('confirm-title').textContent=title;$('confirm-message').textContent=message;dialog.returnValue='';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});}
async function reviewCode(input){
  try{
    if(!storageReady)throw new Error('Browser-Datenbank ist nicht bereit. Bitte neu laden.');
    const code=normalizeBarcode(input);const existing=await getEntry(code);
    if(existing){pending=null;$('review').hidden=true;feedback(`Bereits erfasst: ${typeNames[existing.type]}, ${displayDate(existing.date)}. Dieser Barcode wird nicht doppelt gezählt.`);return;}
    const detected=detectBarcode(code);pending=detected;
    $('review-title').textContent=detected.label;$('confidence').textContent=detected.confidence;$('review-message').textContent=detected.message;$('review-barcode').textContent=code;
    $('activity').value=detected.type==='unknown'?'':detected.type;
    $('visit-date').value=detected.suggestedDate || localDate();
    $('decode-details').hidden=detected.type!=='karren';
    $('decode-output').textContent=detected.type==='karren'?`Tagcode: ${detected.dayCode}\nMonatcode: ${detected.monthCode}\nProdukt: 0x${detected.product}\nSerienfeld: ${detected.serial}\nZusatz (ungeklärt): ${detected.extra}\nJahr: nicht decodiert`:'';
    $('feedback').hidden=true;$('review').hidden=false;$('review').scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(e){feedback(e.message,true);}
}
$('barcode-form').addEventListener('submit',e=>{e.preventDefault();void reviewCode($('barcode').value);});
$('cancel-review').addEventListener('click',()=>{pending=null;$('review').hidden=true;});
$('save-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!pending)return;const type=$('activity').value,date=$('visit-date').value;
  if(!typeNames[type]||!validDate(date)){feedback('Bitte Aktivität und ein gültiges Besuchsdatum wählen.',true);return;}
  const detected=pending;$('save').disabled=true;
  try{
    await addEntry({barcode:detected.barcode,type,date,scannedAt:new Date().toISOString(),detected,assignment:type===detected.type?'suggested':'manual'});
    pending=null;$('review').hidden=true;$('barcode').value='';channel?.postMessage('changed');await refresh();feedback(`${typeNames[type]} vom ${displayDate(date)} gespeichert. Eine kleine Auszeit mehr.`);
  }catch(error){if(error?.name==='ConstraintError'){feedback('Bereits erfasst. Dieser Barcode wird nicht doppelt gezählt.');pending=null;$('review').hidden=true;await refresh();}else{storageError(error);}}
  finally{$('save').disabled=false;}
});
$('filter').addEventListener('change',render);$('search').addEventListener('input',render);
$('reset').addEventListener('click',async()=>{if(await confirmAction('Alle Einträge löschen?',`${entries.length} Tickets werden endgültig aus diesem Browser gelöscht. Exportiere deine Sammlung vorher als CSV, wenn du sie behalten möchtest.`)){try{await clearEntries();pending=null;$('review').hidden=true;channel?.postMessage('changed');await refresh();feedback('Deine Sammlung wurde geleert.');}catch(e){storageError(e);}}});
$('export').addEventListener('click',()=>{const blob=new Blob([csv(entries)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`unterwegs-${localDate()}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);});
function stopCamera(){
  cameraGeneration++;cameraStarting=false;controls?.stop();controls=null;
  const stream=$('camera').srcObject;if(stream)stream.getTracks().forEach(track=>track.stop());$('camera').srcObject=null;
  $('start-camera').hidden=false;$('start-camera').disabled=false;$('stop-camera').hidden=true;$('camera-placeholder').hidden=false;
}
$('stop-camera').addEventListener('click',()=>{stopCamera();$('camera-status').textContent='Kamera gestoppt. Du kannst sie jederzeit neu starten.';});
$('start-camera').addEventListener('click',async()=>{
  if(cameraStarting||controls)return;
  if(!window.isSecureContext){$('camera-status').textContent='Die Kamera benötigt HTTPS. Bitte die veröffentlichte HTTPS-Adresse öffnen. Manuelle Eingabe bleibt verfügbar.';return;}
  if(!navigator.mediaDevices?.getUserMedia){$('camera-status').textContent='Dieser Browser bietet keinen Kamerazugriff. Bitte in Safari öffnen oder Barcode eintippen.';return;}
  cameraStarting=true;const generation=++cameraGeneration;$('start-camera').disabled=true;$('stop-camera').hidden=false;$('camera-status').textContent='Kamerazugriff wird angefragt …';
  let last='',hits=0,lastTime=0;
  try{
    reader=createReader();
    const nextControls=await reader.decodeFromConstraints({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}},$('camera'),(result,error,scanControls)=>{
      if(generation!==cameraGeneration){scanControls?.stop();return;}
      if(!result)return;const code=result.getText(),now=Date.now();
      hits=code===last&&now-lastTime<2500?hits+1:1;last=code;lastTime=now;
      if(hits>=2){scanControls.stop();stopCamera();$('camera-status').textContent='Barcode erkannt. Bitte Angaben prüfen und speichern.';void reviewCode(code);}
    });
    if(generation!==cameraGeneration){nextControls.stop();return;}
    controls=nextControls;cameraStarting=false;$('start-camera').hidden=true;$('camera-placeholder').hidden=true;$('camera-status').textContent='Kamera aktiv. Barcode ruhig und waagerecht ins Bild halten. Zwei gleiche Lesungen bestätigen den Scan.';
  }catch(error){if(generation===cameraGeneration){stopCamera();$('camera-status').textContent=cameraMessage(error);}}
});
$('photo').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;stopCamera();const url=URL.createObjectURL(file);$('camera-status').textContent='Ticketfoto wird auf diesem Gerät gelesen …';
  try{const result=await createReader().decodeFromImageUrl(url);await reviewCode(result.getText());$('camera-status').textContent='Barcode aus Foto gelesen. Bitte Angaben prüfen.';}
  catch{$('camera-status').textContent='Kein vollständiger I25-Barcode im Foto erkannt. Bitte scharfes Foto mit weißem Rand um den gesamten Barcode wählen oder die Nummer eingeben.';}
  finally{URL.revokeObjectURL(url);e.target.value='';}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();$('camera-status').textContent='Kamera pausiert. Zum Fortsetzen erneut starten.';}});
window.addEventListener('pagehide',stopCamera);
channel?.addEventListener('message',()=>void refresh().catch(storageError));
window.addEventListener('focus',()=>{if(storageReady)void refresh().catch(storageError);});
function networkStatus(){$('network').textContent=navigator.onLine?'Bereit für deine Auszeit':'Offline · lokal bereit';}
window.addEventListener('online',networkStatus);window.addEventListener('offline',networkStatus);networkStatus();
try{await refresh();storageReady=true;}catch(e){storageError(e);$('save').disabled=true;}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async()=>{await navigator.serviceWorker.ready;$('offline-status').textContent='Offline bereit. Die App und der Scanner sind lokal gespeichert.';}).catch(()=>{$('offline-status').textContent='Offline-Speicher konnte nicht eingerichtet werden. Online kannst du die App weiterhin verwenden.';});}else{$('offline-status').textContent='Dieser Browser unterstützt die Offline-Installation nicht.';}
