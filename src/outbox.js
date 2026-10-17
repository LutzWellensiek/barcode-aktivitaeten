import * as db from './db.js';
import {groupRequest} from './group-bridge.js';
const owner=crypto.randomUUID(),memory=new Map(),listeners=new Set(),channel=typeof BroadcastChannel==='function'?new BroadcastChannel('draussen-sync-queue'):null;
let config=null,scope='',jobs=[],ready=Promise.resolve(),timer,commandBusy=false,photoBusy=false,completion=async()=>{},storageAvailable=true;
export function setCompletionHandler(fn){completion=fn;}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function currentScope(){return scope;}
export function pendingJobs(){return jobs.filter(j=>j.scope===scope&&j.status!=='failed');}
export function failedJobs(){return jobs.filter(j=>j.scope===scope&&j.status==='failed');}
function emit(type,job,result,error){for(const listener of listeners)listener({type,job,result,error,durable:job?.durable!==false});}
async function read(){let saved=[];try{saved=await db.outboxAll();}catch{storageAvailable=false;}jobs=[...saved.filter(j=>j.scope===scope&&!memory.has(j.id)),...[...memory.values()].filter(j=>j.scope===scope)];}
export async function start(next){config=next;scope=next?(next.endpoint||'native'):'';ready=read();await ready;if(config)wake();return jobs;}
function plan(ms=1000){clearTimeout(timer);if(config)timer=setTimeout(()=>void pump(),ms);}
export function wake(){if(config)plan(20);}
export async function enqueue(action,data,{id=crypto.randomUUID(),lane=action==='photoUpload'?'photo':'command',dependsOn='',meta={}}={}){
 await ready;const key=scope+':'+id,existing=jobs.find(j=>j.id===key&&j.status!=='failed');if(existing)return existing;
 const job={id:key,scope,operationId:id,action,data,lane,dependsOn:dependsOn?scope+':'+dependsOn:'',meta,createdAt:Math.max(Date.now(),...jobs.map(j=>j.createdAt+1)),attempts:0,nextAt:0,status:'pending',durable:true};
 try{await db.outboxAdd(job);}catch(error){if(error?.name==='ConstraintError'){await read();const prior=jobs.find(j=>j.id===key);if(prior&&prior.status!=='failed')return prior;if(prior){try{await db.outboxPut(job);memory.delete(key);}catch{job.durable=false;memory.set(key,job);}}else{job.durable=false;memory.set(key,job);}}else{storageAvailable=false;job.durable=false;memory.set(key,job);}}
 jobs=jobs.filter(j=>j.id!==key);jobs.push(job);emit('pending',job);channel?.postMessage({scope});wake();return job;
}
async function save(job){if(job.durable!==false){try{await db.outboxPut(job);return;}catch{storageAvailable=false;}}job.durable=false;memory.set(job.id,job);}
async function remove(job){await db.outboxDelete(job.id).catch(()=>{});memory.delete(job.id);jobs=jobs.filter(j=>j.id!==job.id);}
async function claim(lane){const now=Date.now();let job;try{job=await db.outboxClaim(scope,lane,owner,now);if(job)return job;}catch{storageAvailable=false;}
 const rows=[...memory.values()].filter(j=>j.scope===scope);if(rows.some(j=>j.lane===lane&&j.status==='running'&&j.leaseUntil>now))return null;
 const ordered=rows.filter(j=>j.lane===lane&&j.status!=='failed').sort((a,b)=>a.createdAt-b.createdAt);job=(lane==='command'?ordered.slice(0,1):ordered).find(j=>j.nextAt<=now&&(!j.leaseUntil||j.leaseUntil<=now)&&(!j.dependsOn||!jobs.some(p=>p.id===j.dependsOn&&p.status!=='failed')));if(job){job.status='running';job.owner=owner;job.leaseUntil=now+120000;}return job;
}
async function run(job){const target=config;let renew=setInterval(()=>{job.leaseUntil=Date.now()+120000;if(job.durable!==false)void db.outboxRenew(job.id,owner,job.leaseUntil).catch(()=>{});},30000);try{
 if(job.dependsOn&&jobs.some(j=>j.id===job.dependsOn&&j.status==='failed')){const error=new Error('Die zugehörige Aktivität konnte nicht gespeichert werden.');error.retryable=false;throw error;}
 if(!navigator.onLine){const error=new Error('Offline');error.retryable=true;throw error;}
 const result=await groupRequest(target,job.action,job.data,{priority:job.lane==='photo'?5:0});await completion(job,result);await remove(job);emit('done',job,result);
 }catch(error){job.attempts++;job.owner='';job.leaseUntil=0;job.error=error.message||'Verbindung unterbrochen';if(error.retryable!==false){job.status='pending';job.nextAt=Date.now()+Math.min(60000,1000*2**Math.min(job.attempts-1,6))+Math.random()*400;await save(job);emit('retry',job,undefined,error);}else{job.status='failed';job.finishedAt=Date.now();await save(job);emit('error',job,undefined,error);}}
 finally{clearInterval(renew);channel?.postMessage({scope});}
}
async function pump(){if(!config)return;await read();if(navigator.onLine){for(const lane of ['command','photo']){if(lane==='command'?commandBusy:photoBusy)continue;const job=await claim(lane);if(!job)continue;if(lane==='command')commandBusy=true;else photoBusy=true;const index=jobs.findIndex(j=>j.id===job.id);if(index>=0)jobs[index]=job;else jobs.push(job);void run(job).finally(()=>{if(lane==='command')commandBusy=false;else photoBusy=false;wake();});}}plan(1500);}
channel?.addEventListener('message',event=>{if(event.data?.scope===scope){void read().then(()=>emit('external'));wake();}});
window.addEventListener('online',wake);document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
