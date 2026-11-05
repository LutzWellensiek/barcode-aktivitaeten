import {image as proposalImage} from './voting-store.js';

// The dialog covers the app viewport on phones, including browsers without the Fullscreen API.
export function setupActivityImageViewer(){
 const dialog=document.getElementById('proposal-image-dialog'),picture=document.getElementById('proposal-full-image'),title=document.getElementById('proposal-image-title'),status=document.getElementById('proposal-image-status');
 let record=null,generation=0,retry=null,fullReady=false;
 function label(){title.textContent=record.title;picture.alt=record.title+' · '+record.person;}
 async function load(token){
  const current=record;
  try{const data=await proposalImage(current,true);if(token!==generation||!dialog.open)return;picture.src='data:image/jpeg;base64,'+data;picture.hidden=false;fullReady=true;status.textContent='';}
  catch(error){if(token!==generation||!dialog.open)return;status.textContent=error.retryable?'Bild wird automatisch erneut geladen …':error.message;if(error.retryable)retry=setTimeout(()=>void load(token),10000);}
 }
 function show(next,preview=''){
  clearTimeout(retry);record=next;const token=++generation;fullReady=false;label();status.textContent='Bild wird geladen …';picture.hidden=!preview;if(preview)picture.src=preview;else picture.removeAttribute('src');
  if(!dialog.open){document.body.classList.add('activity-image-open');dialog.showModal();}
  if(!preview)void proposalImage(next).then(data=>{if(token!==generation||!dialog.open||fullReady)return;picture.src='data:image/jpeg;base64,'+data;picture.hidden=false;}).catch(()=>{});
  void load(token);
 }
 document.getElementById('proposal-image-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{generation++;clearTimeout(retry);record=null;picture.hidden=true;picture.removeAttribute('src');status.textContent='';document.body.classList.remove('activity-image-open');});
 return {open:show,sync(items){if(!record||!dialog.open)return;const current=items.find(p=>p.id===record.id);if(!current||current.hasImage===false){dialog.close();return;}if(current.imageVersion!==record.imageVersion)show(current);else{record=current;label();}}};
}
