import {scheduleRequest,retryRead} from './request-scheduler.js';
export function validateEndpoint(value){const url=new URL(value);if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname))throw new Error('Bitte die bereitgestellte Apps-Script-Web-App-Adresse mit /exec eingeben.');return url.origin+url.pathname;}
export function trustedGoogleOrigin(origin){try{const u=new URL(origin);return u.protocol==='https:'&&(u.hostname==='script.google.com'||u.hostname==='script.googleusercontent.com'||/^[a-z0-9-]+-script\.googleusercontent\.com$/.test(u.hostname));}catch{return false;}}
export function groupRequest(config,action,data={},options={}){const read=['read','photoList','photoConfig','photoImage','photoSocial','photoComments'].includes(action),priority=options.priority??(action==='photoImage'?(data.full?2:30):action==='photoList'?15:read?8:0),call=()=>scheduleRequest(()=>rawRequest(config,action,data),priority);return read?retryRead(call):call();}
function failure(message,retryable){const error=new Error(message);error.retryable=retryable;return error;}
function resultError(result){return failure(result.error||'Speichern fehlgeschlagen.',result.retryable===true);}
function rawRequest(config,action,data={}){
 const request={id:crypto.randomUUID(),action,data,key:config.key,origin:location.origin};
 if(globalThis.google?.script?.run)return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(failure('Die Google-Verbindung braucht länger. Es wird automatisch erneut versucht.',true)),action==='photoUpload'?90000:45000);google.script.run.withSuccessHandler(result=>{clearTimeout(timer);result.ok?resolve(result.state):reject(resultError(result));}).withFailureHandler(e=>{clearTimeout(timer);reject(failure(e.message||'Google-Verbindung fehlgeschlagen.',true));}).runAppRequest(request);});
 const endpoint=validateEndpoint(config.endpoint);
 return new Promise((resolve,reject)=>{
  const frame=document.createElement('iframe');frame.name='group-'+request.id;frame.hidden=true;frame.setAttribute('aria-hidden','true');
  const form=document.createElement('form');form.method='POST';form.action=endpoint;form.target=frame.name;form.hidden=true;
  const field=document.createElement('input');field.name='payload';field.value=JSON.stringify(request);form.append(field);
  const cleanup=()=>{clearTimeout(timer);removeEventListener('message',receive);form.remove();frame.remove();};
  const receive=event=>{const msg=event.data;if(!trustedGoogleOrigin(event.origin)||!msg||msg.channel!=='unterwegs-group'||msg.id!==request.id)return;cleanup();if(msg.ok)resolve(msg.state);else reject(resultError(msg));};
  const timer=setTimeout(()=>{cleanup();reject(failure('Google hat nicht rechtzeitig geantwortet. Der Vorgang wird automatisch erneut versucht.',true));},45000);
  addEventListener('message',receive);document.body.append(frame,form);form.submit();
 });
}
