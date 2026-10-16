import {localDate} from './core.js';
import {cleanName} from './freebies.js';
import {metaAll,metaPut} from './db.js';
export const GROUP_APP_URL='https://script.google.com/macros/s/AKfycbzvNtBBsFOhJWNKRVz8xglWJrCjFUVAYqjtB2Pv_61d-cNDtLkVUhPKeslZiCrhCtHvTg/exec';
const NAME_KEY='draussen-name';
function validName(value){try{return cleanName(value);}catch{return '';}}
export function nameHash(hash,name){const params=new URLSearchParams(String(hash||'').replace(/^#/,''));if(name)params.set(NAME_KEY,name);else params.delete(NAME_KEY);return params.toString();}
export function setupIdentity({render,scannerOnly}){
 const $=id=>document.getElementById(id),input=$('person-name'),date=$('manual-date');
 let changed=false,lastValue='',priority=0,lastDay=localDate(),hash=location.hash.slice(1),historyReady=false,historyTimer,stored=false,writeVersion=0;
 const native=!!globalThis.google?.script?.run;
 function startURL(){const url=new URL(native?GROUP_APP_URL:location.href);url.hash=nameHash(hash,validName(input.value));return url.href;}
 function status(){const name=validName(input.value);$('identity-copy').disabled=!name;$('identity-open').hidden=!name;if(name)$('identity-open').href=startURL();$('identity-status').textContent=!name?'Trage oben deinen Namen ein.':stored?'Dein Name ist in diesem Browser gespeichert.':'Mit deinem persönlichen Startlink wird dein Name auch ohne Browserspeicher ausgefüllt.';}
 function mirror(){clearTimeout(historyTimer);if(scannerOnly)return;hash=nameHash(hash,validName(input.value));try{if(native&&historyReady)google.script.history.replace({draussenName:validName(input.value)},null,hash);}catch{}status();}
 function cache(value){let ok=false;try{localStorage.setItem('freebie_person',value);ok=true;}catch{}return ok;}
 function restore(value,rank){const name=validName(value);if(!name||changed||priority>=rank||input.value!==lastValue)return;input.value=name;lastValue=name;priority=rank;stored=cache(name)||rank>=2;render();mirror();}
 function persist(){if(scannerOnly)return;const value=validName(input.value),version=++writeVersion;stored=cache(value);status();void metaPut('person-name',value).then(()=>{if(version===writeVersion){stored=true;status();}}).catch(()=>{if(version===writeVersion)status();});clearTimeout(historyTimer);historyTimer=setTimeout(mirror,250);}
 try{const saved=validName(localStorage.getItem('freebie_person'));if(saved){input.value=saved;lastValue=saved;priority=3;stored=true;}}catch{}
 if(!scannerOnly){
  void metaAll().then(rows=>restore(rows.find(r=>r.key==='person-name')?.value,2)).catch(()=>{});
  if(native&&globalThis.google?.script?.url?.getLocation){try{google.script.url.getLocation(result=>{hash=String(result.hash||'');historyReady=!!google.script.history?.replace;restore(new URLSearchParams(hash).get(NAME_KEY),1);mirror();});}catch{}}
  else if(!native)restore(new URLSearchParams(hash).get(NAME_KEY),1);
 }
 input.addEventListener('input',()=>{changed=true;lastValue=input.value;$('identity-link').hidden=true;$('identity-message').textContent='';persist();render();});
 input.addEventListener('change',()=>{const different=input.value!==lastValue;changed=true;lastValue=input.value;persist();mirror();if(different)render();});input.addEventListener('blur',()=>{persist();mirror();});
 $('open-settings').addEventListener('click',status);
 $('identity-copy').addEventListener('click',async()=>{const name=validName(input.value);if(!name)return;mirror();const url=startURL();try{await navigator.clipboard.writeText(url);$('identity-message').textContent='Startlink kopiert. In Safari öffnen und über Teilen zum Home-Bildschirm hinzufügen.';$('identity-link').hidden=true;}catch{$('identity-link').value=url;$('identity-link').hidden=false;$('identity-link').focus();$('identity-link').select();$('identity-message').textContent='Diesen persönlichen Link kopieren und als neues Home-Bildschirm-Symbol ablegen.';}});
 function today(force=false){const current=localDate();if(lastDay!==current||(force&&date.value!==current)){date.value=current;lastDay=current;render();}}
 date.value=lastDay;date.addEventListener('change',render);status();
 window.addEventListener('pageshow',()=>today(true));window.addEventListener('focus',()=>today(true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(changed)mirror();}else today(true);});window.addEventListener('pagehide',()=>{if(changed)mirror();});
 setInterval(()=>today(),15000);
}
