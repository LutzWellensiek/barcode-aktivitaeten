const waiting=[];let active=0,background=0,serial=0;
export function scheduleRequest(run,priority=10){return new Promise((resolve,reject)=>{waiting.push({run,priority,resolve,reject,order:serial++});drain();});}
function drain(){waiting.sort((a,b)=>a.priority-b.priority||a.order-b.order);while(active<3){const index=waiting.findIndex(t=>t.priority<10||background<2);if(index<0)return;const task=waiting.splice(index,1)[0],low=task.priority>=10;active++;if(low)background++;Promise.resolve().then(task.run).then(task.resolve,task.reject).finally(()=>{active--;if(low)background--;drain();});}}
export const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function retryRead(run,{attempts=3}={}){for(let i=0;;i++){try{return await run();}catch(error){if(!error.retryable||i>=attempts-1)throw error;await pause(Math.min(15000,800*2**i)+Math.random()*200);}}}
