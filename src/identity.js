import {localDate} from './core.js';
import {metaAll,metaPut} from './db.js';
// A second browser store retains the name when localStorage alone is unavailable.
export function setupIdentity({render,scannerOnly}){
 const input=document.getElementById('person-name'),date=document.getElementById('manual-date');
 let changed=false,lastDay=localDate();
 try{input.value=localStorage.getItem('freebie_person')||'';}catch{}
 if(!scannerOnly&&!input.value)void metaAll().then(rows=>{const saved=rows.find(r=>r.key==='person-name');if(!changed&&saved?.value){input.value=String(saved.value).slice(0,60);render();}}).catch(()=>{});
 function persist(){const value=input.value.trim();try{localStorage.setItem('freebie_person',value);}catch{}void metaPut('person-name',value).catch(()=>{});}
 input.addEventListener('input',()=>{changed=true;persist();render();});
 for(const event of ['change','blur'])input.addEventListener(event,persist);
 function today(force=false){const current=localDate();if(force||lastDay!==current){date.value=current;lastDay=current;render();}}
 date.value=lastDay;date.addEventListener('change',render);
 window.addEventListener('pageshow',()=>today(true));window.addEventListener('focus',()=>today(true));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)today(true);});
 setInterval(()=>today(),15000);
}
