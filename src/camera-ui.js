import {createReader,cameraMessage} from './scanner.js';
export function setupCamera(reviewCode){
const $=id=>document.getElementById(id);let cameraGeneration=0,cameraStarting=false,controls=null,reader=null,cameraStream=null;
function stopCamera(){
  cameraGeneration++;cameraStarting=false;controls?.stop();controls=null;
  for(const stream of new Set([cameraStream,$('camera').srcObject]))stream?.getTracks().forEach(track=>track.stop());cameraStream=null;$('camera').srcObject=null;
  $('start-camera').hidden=false;$('start-camera').disabled=false;$('stop-camera').hidden=true;$('camera-placeholder').hidden=false;
}
$('ticket-panel').addEventListener('toggle',()=>{if(!$('ticket-panel').open)stopCamera();});
$('stop-camera').addEventListener('click',()=>{stopCamera();$('camera-status').textContent='Kamera gestoppt. Du kannst sie jederzeit neu starten.';});
let receivePopup=null;
function openExternalScanner(){
 const url=new URL('./',import.meta.url),assetVersion=new URL(import.meta.url).searchParams.get('v');url.searchParams.set('scanner','1');url.searchParams.set('v',assetVersion||'group-scanner');const token=crypto.randomUUID();url.hash=new URLSearchParams({token,returnOrigin:location.origin}).toString();
 if(receivePopup)window.removeEventListener('message',receivePopup);
 receivePopup=event=>{if(event.origin!==url.origin||event.data?.channel!=='draussen-scan'||event.data.token!==token)return;window.removeEventListener('message',receivePopup);receivePopup=null;$('scan-popup-link').hidden=true;$('camera-status').textContent='Barcode aus dem Kamerafenster empfangen. Bitte prüfen und speichern.';void reviewCode(event.data.barcode);};
 window.addEventListener('message',receivePopup);const popup=window.open(url.href,'draussen-scanner');$('scan-popup-link').href=url.href;$('scan-popup-link').hidden=false;$('camera-status').textContent=popup?'Der Kamerascanner wurde in einem eigenen Fenster geöffnet. Der Code kommt automatisch hierher zurück.':'Bitte Pop-ups für diese App erlauben oder den Link „Scannerfenster öffnen“ antippen.';
}
async function startCamera(){
 if(globalThis.google?.script?.run){openExternalScanner();return;}
  if(cameraStarting||controls)return;
  if(!window.isSecureContext){$('camera-status').textContent='Die Kamera benötigt HTTPS. Bitte die veröffentlichte HTTPS-Adresse öffnen. Manuelle Eingabe bleibt verfügbar.';return;}
  if(!navigator.mediaDevices?.getUserMedia){$('camera-status').textContent='Dieser Browser bietet keinen Kamerazugriff. Bitte in Safari öffnen oder Barcode eintippen.';return;}
  $('camera-permission-help').hidden=true;cameraStarting=true;const generation=++cameraGeneration;$('start-camera').disabled=true;$('stop-camera').hidden=false;$('camera-status').textContent='Bitte im Browser den Kamerazugriff zulassen. Die Berechtigungsanfrage ist geöffnet oder wird gerade geprüft …';
  let last='',hits=0,lastTime=0;
  try{
    // Call from the tap handler, before waiting for reader setup or other work.
    const requestedStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
    if(generation!==cameraGeneration){requestedStream.getTracks().forEach(track=>track.stop());return;}
    cameraStream=requestedStream;reader=createReader();
    const nextControls=await reader.decodeFromStream(requestedStream,$('camera'),(result,error,scanControls)=>{
      if(generation!==cameraGeneration){scanControls?.stop();return;}
      if(!result)return;const code=result.getText(),now=Date.now();
      hits=code===last&&now-lastTime<2500?hits+1:1;last=code;lastTime=now;
      if(hits>=2){scanControls.stop();stopCamera();$('camera-status').textContent='Barcode erkannt. Bitte Angaben prüfen und speichern.';void reviewCode(code);}
    });
    if(generation!==cameraGeneration){nextControls.stop();return;}
    controls=nextControls;cameraStarting=false;$('start-camera').hidden=true;$('camera-placeholder').hidden=true;$('camera-status').textContent='Kamera aktiv. Barcode ruhig und waagerecht ins Bild halten. Zwei gleiche Lesungen bestätigen den Scan.';
  }catch(error){if(generation===cameraGeneration){stopCamera();$('camera-status').textContent=cameraMessage(error);$('camera-permission-help').hidden=!['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name);}}
}
$('start-camera').addEventListener('click',startCamera);
$('retry-camera').addEventListener('click',startCamera);
$('photo').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;stopCamera();const url=URL.createObjectURL(file);$('camera-status').textContent='Ticketfoto wird auf diesem Gerät gelesen …';
  try{const result=await createReader().decodeFromImageUrl(url);await reviewCode(result.getText());$('camera-status').textContent='Barcode aus Foto gelesen. Bitte Angaben prüfen.';}
  catch{$('camera-status').textContent='Kein vollständiger I25-Barcode im Foto erkannt. Bitte scharfes Foto mit weißem Rand um den gesamten Barcode wählen oder die Nummer eingeben.';}
  finally{URL.revokeObjectURL(url);e.target.value='';}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();$('camera-status').textContent='Kamera pausiert. Zum Fortsetzen erneut starten.';}});
window.addEventListener('pagehide',stopCamera);

}
