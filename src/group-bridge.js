export function validateEndpoint(value){const url=new URL(value);if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname))throw new Error('Bitte die bereitgestellte Apps-Script-Web-App-Adresse mit /exec eingeben.');return url.origin+url.pathname;}
export function trustedGoogleOrigin(origin){try{const u=new URL(origin);return u.protocol==='https:'&&(u.hostname==='script.google.com'||u.hostname==='script.googleusercontent.com'||/^[a-z0-9-]+-script\.googleusercontent\.com$/.test(u.hostname));}catch{return false;}}
export function groupRequest(config,action,data={}){
 const request={id:crypto.randomUUID(),action,data,key:config.key,origin:location.origin};
 if(globalThis.google?.script?.run)return new Promise((resolve,reject)=>{google.script.run.withSuccessHandler(result=>result.ok?resolve(result.state):reject(new Error(result.error))).withFailureHandler(e=>reject(new Error(e.message||'Google-Verbindung fehlgeschlagen.'))).runAppRequest(request);});
 const endpoint=validateEndpoint(config.endpoint);
 return new Promise((resolve,reject)=>{
  const frame=document.createElement('iframe');frame.name='group-'+request.id;frame.hidden=true;frame.setAttribute('aria-hidden','true');
  const form=document.createElement('form');form.method='POST';form.action=endpoint;form.target=frame.name;form.hidden=true;
  const field=document.createElement('input');field.name='payload';field.value=JSON.stringify(request);form.append(field);
  const cleanup=()=>{clearTimeout(timer);removeEventListener('message',receive);form.remove();frame.remove();};
  const receive=event=>{const msg=event.data;if(!trustedGoogleOrigin(event.origin)||!msg||msg.channel!=='unterwegs-group'||msg.id!==request.id)return;cleanup();if(msg.ok)resolve(msg.state);else reject(new Error(msg.error||'Speichern fehlgeschlagen.'));};
  const timer=setTimeout(()=>{cleanup();reject(new Error('Google hat nicht rechtzeitig geantwortet. Bitte Verbindung und Freigabe der Gruppen-App prüfen. Bereits gespeicherte Buchungen werden bei einem erneuten Versuch nicht doppelt angelegt.'));},45000);
  addEventListener('message',receive);document.body.append(frame,form);form.submit();
 });
}
