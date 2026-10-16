// Short, original Web Audio cues. No downloads, media permissions or autoplay.
const tone=(frequency,start=0,duration=.12,end=frequency,type='sine',gain=.18)=>({frequency,start,duration,end,type,gain});
export const SOUNDS={
 tap:[tone(680,0,.035,540,'triangle',.1)],
 open:[tone(523,0,.08),tone(784,.045,.12)],
 close:[tone(659,0,.07),tone(440,.045,.09)],
 karren:[tone(392,0,.13),tone(523,.075,.14),tone(659,.15,.16),tone(784,.23,.23)],
 stadtbad:[tone(1250,0,.16,460),tone(960,.11,.18,350),tone(1430,.24,.19,530)],
 freibier:[tone(1319,0,.3,1319,'sine',.14),tone(2637,0,.13,2637,'sine',.045),tone(1760,.14,.34,1760,'sine',.12),tone(3520,.14,.13,3520,'sine',.035)],
 apfel:[tone(330,0,.12,155,'triangle',.25),tone(980,.045,.08,650,'sine',.12)],
 success:[tone(523,0,.13),tone(659,.08,.14),tone(1047,.16,.22)],
 scan:[tone(880,0,.07),tone(1320,.09,.11)],
 duplicate:[tone(440,0,.09),tone(440,.14,.09)],
 error:[tone(330,0,.14,294,'triangle'),tone(247,.12,.16,220,'triangle')]
};
export function createSoundPlayer(){
 let context=null,master=null,enabled=true,active=new Set(),lastTap=-Infinity;
 function stop(){for(const node of active){try{node.stop();}catch{}try{node.disconnect();}catch{}}active.clear();}
 function setEnabled(value){enabled=!!value;if(!enabled)stop();}
 // Must run directly in a user gesture, including on iOS. Failure never blocks UI.
 function unlock(){if(!enabled)return;try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;if(!context){context=new Audio();master=context.createGain();master.gain.value=.25;master.connect(context.destination);}if(context.state==='suspended')void context.resume().catch(()=>{});}catch{}}
 function schedule(id){if(!enabled||document.hidden||context.state!=='running')return;const notes=SOUNDS[id]||SOUNDS.success;if(id==='tap'&&performance.now()-lastTap<70)return;if(id==='tap')lastTap=performance.now();try{stop();const now=context.currentTime+.005;for(const n of notes){const oscillator=context.createOscillator(),gain=context.createGain(),start=now+n.start,end=start+n.duration;oscillator.type=n.type;oscillator.frequency.setValueAtTime(n.frequency,start);oscillator.frequency.exponentialRampToValueAtTime(n.end,end);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(n.gain,start+.006);gain.gain.exponentialRampToValueAtTime(.0001,end);oscillator.connect(gain);gain.connect(master);active.add(oscillator);oscillator.onended=()=>{active.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(end+.01);}}catch{stop();}}
 function play(id){if(!enabled||document.hidden||!context)return;if(context.state==='running')schedule(id);else if(context.state==='suspended'){try{void context.resume().then(()=>schedule(id)).catch(()=>{});}catch{}}}
 function pause(){stop();try{void context?.suspend().catch(()=>{});}catch{}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
 return {unlock,play,setEnabled,stop};
}
