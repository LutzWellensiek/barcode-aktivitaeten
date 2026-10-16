export function setupRefresh({refresh,blocked,scannerOnly}){
 const indicator=document.createElement('div');indicator.id='pull-refresh';indicator.className='pull-refresh';indicator.setAttribute('role','status');indicator.setAttribute('aria-live','polite');indicator.hidden=true;document.body.append(indicator);
 if(scannerOnly)return;
 const top=()=>Math.max(0,window.scrollY||document.scrollingElement?.scrollTop||0)<=2;
 let start=null,distance=0,refreshing=false,hideTimer;
 const unavailable=()=>refreshing||blocked()||!!document.querySelector('dialog[open]');
 function reset(){start=null;distance=0;if(!refreshing){indicator.hidden=true;indicator.style.removeProperty('--pull');}}
 document.addEventListener('touchstart',event=>{reset();if(event.touches.length!==1||!top()||unavailable()||event.target.closest('input,textarea,select,button,a,summary,dialog,#chart-viewport,#savings-chart'))return;const t=event.touches[0];start={x:t.clientX,y:t.clientY};},{passive:true});
 document.addEventListener('touchmove',event=>{if(!start)return;if(event.touches.length!==1||!top()||unavailable()){reset();return;}const t=event.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(dy<0||Math.abs(dx)>Math.abs(dy)){reset();return;}if(dy<10)return;if(event.cancelable)event.preventDefault();distance=dy;indicator.hidden=false;indicator.style.setProperty('--pull',Math.min(60,dy*.4)+'px');indicator.textContent=dy>=90?'Loslassen zum Aktualisieren':'Zum Aktualisieren ziehen ↓';},{passive:false});
 document.addEventListener('touchend',()=>{const run=start&&distance>=90;start=null;distance=0;if(run)void perform();else reset();},{passive:true});
 document.addEventListener('touchcancel',reset,{passive:true});
 async function perform(){if(unavailable())return;refreshing=true;clearTimeout(hideTimer);indicator.hidden=false;indicator.style.setProperty('--pull','32px');indicator.classList.add('refreshing');indicator.textContent='Wird aktualisiert …';try{await refresh();indicator.textContent='Alles aktuell ✓';}catch(error){indicator.textContent=error.message||'Aktualisieren fehlgeschlagen. Bitte erneut versuchen.';}finally{refreshing=false;indicator.classList.remove('refreshing');hideTimer=setTimeout(()=>{indicator.hidden=true;},2200);}}
 document.documentElement.classList.add('pull-refresh-enabled');
}

export function setupLogoMotion(){const brand=document.querySelector('.brand'),mark=brand;let timer;brand.addEventListener('click',()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;mark.classList.remove('logo-play');void mark.offsetWidth;mark.classList.add('logo-play');clearTimeout(timer);timer=setTimeout(()=>mark.classList.remove('logo-play'),850);});}
