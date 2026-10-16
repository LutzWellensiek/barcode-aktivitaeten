export {THEMES,validTheme} from './theme-data.js';
import {localDate,validDate,normalizeBarcode} from './core.js';
export const TYPES={karren:{name:'Karren',icon:'↟',cents:1650},stadtbad:{name:'Stadtbad',icon:'≈',cents:940},freibier:{name:'Freibier',icon:'🍺',cents:450},apfel:{name:'Apfel',icon:'🍎',cents:45},custom:{name:'Individuell',icon:'✨'},print:{name:'Drucken',icon:'🖨️'},other:{name:'Andere Aktivität',icon:'•'}};
export const FEATURES=[{id:'darkmode',title:'🌙 Dark Mode Design'},{id:'push',title:'🔔 Push-Alarm aufs Handy'},{id:'stats',title:'📊 Erweiterte Statistiken'},{id:'minigame',title:'🎲 Mini-Spiel Erweiterung'}];
export const VILLAGE=[{id:1,name:'⛺ Zeltlager',cents:0,desc:'Der Startpunkt eurer Ersparnis.'},{id:2,name:'🛖 Holzhütte',cents:3000,desc:'Die erste feste Unterkunft.'},{id:3,name:'🏡 Marktplatz',cents:10000,desc:'Handel blüht im Dorf auf.'},{id:4,name:'🏰 Ritterburg',cents:25000,desc:'Schutz vor feindlichen Sparern.'},{id:5,name:'🌆 Cyberpunk-Stadt',cents:60000,desc:'Eine Metropole voller Möglichkeiten.'},{id:6,name:'🚀 Mondbasis',cents:150000,desc:'Sparen in neuen Sphären.'},{id:7,name:'🌌 Dyson-Sphäre',cents:500000,desc:'Eure Ersparnis wird galaktisch.'}];
export function personKey(name){return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');}
export function cleanName(name){const n=String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ');if(!n||personKey(n)==='person'||n.length>60)throw new Error('Bitte zuerst deinen Namen eingeben (maximal 60 Zeichen).');return n;}
export function money(cents){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((cents||0)/100);}
export function parseMoney(value){const s=String(value??'').trim();if(!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(s))throw new Error('Bitte einen gültigen Euro-Betrag mit höchstens zwei Nachkommastellen eingeben.');const [whole,decimal='']=s.split(/[.,]/);return Number(whole)*100+Number(decimal.padEnd(2,'0'));}
export function createEntry(input){
  const person=cleanName(input.person),type=String(input.type);if(type==='print')throw new Error('Neue Druckaufträge sind nicht mehr vorgesehen.');if(!TYPES[type])throw new Error('Bitte eine gültige Aktivität wählen.');
  const date=input.date||localDate();if(!validDate(date))throw new Error('Bitte ein gültiges Besuchsdatum wählen.');
  const amountCents=TYPES[type].cents??input.amountCents;
  if(!Number.isSafeInteger(amountCents)||amountCents<0||((type==='custom'||type==='print')&&amountCents===0))throw new Error('Bitte einen positiven Betrag eingeben.');
  const title=String(input.title||'').trim();if((type==='custom'||type==='print')&&(!title||title.length>160))throw new Error('Bitte eine Beschreibung mit maximal 160 Zeichen eingeben.');
  if(type==='print'&&amountCents>1200)throw new Error('Für Drucken stehen pro Person und Kalenderjahr höchstens 12,00 € zur Verfügung.');
  const e={id:input.id||globalThis.crypto.randomUUID(),person,type,date,amountCents,title:title.slice(0,160),scannedAt:input.scannedAt||new Date().toISOString(),source:input.barcode?'scan':'manual'};
  if(input.barcode){e.barcode=normalizeBarcode(input.barcode);e.detected=input.detected||{confidence:'unbekannt'};e.assignment=input.assignment||'manual';}
  return e;
}
export function printRemaining(entries,name,date=localDate()){const used=entries.filter(e=>e.type==='print'&&personKey(e.person)===personKey(name)&&e.date?.slice(0,4)===date.slice(0,4)).reduce((n,e)=>n+e.amountCents,0);return Math.max(0,1200-used);}
export function checkPrintBudget(entries,entry){if(entry.type==='print'&&entry.amountCents>printRemaining(entries,entry.person,entry.date))throw new Error('Das jährliche Druckbudget reicht nicht aus. Verfügbar: '+money(printRemaining(entries,entry.person,entry.date))+'.');}
export const ACHIEVEMENTS=[
 {id:'starter',icon:'🌱',name:'Starter',desc:'1. Aktivität absolviert',test:p=>p.count>=1},
 {id:'allrounder',icon:'🔄',name:'Allrounder',desc:'Karren & Stadtbad je 1× genutzt',test:p=>p.karren>=1&&p.stadtbad>=1},
 {id:'sparfuchs',icon:'💸',name:'Sparfuchs',desc:'50 € Gesamtwert erreicht',test:p=>p.totalCents>=5000},
 {id:'kroesus',icon:'💰',name:'Krösus',desc:'150 € Gesamtersparnis erreicht',test:p=>p.totalCents>=15000},
 {id:'bergziege',icon:'🏔️',name:'Bergziege',desc:'5× Karren gefahren',test:p=>p.karren>=5},
 {id:'gipfel',icon:'🧗',name:'Gipfelstürmer',desc:'15× Karren gefahren',test:p=>p.karren>=15},
 {id:'wasser',icon:'🏊',name:'Wasserratte',desc:'5× Stadtbad besucht',test:p=>p.stadtbad>=5},
 {id:'poseidon',icon:'🧜‍♂️',name:'Poseidon',desc:'15× Stadtbad besucht',test:p=>p.stadtbad>=15},
 {id:'speed',icon:'⚡',name:'Speedrunner',desc:'Je 10× Karren & Stadtbad absolviert',test:p=>p.karren>=10&&p.stadtbad>=10},
 {id:'apfelbaum',icon:'🍎',name:'Apfelbaum',desc:'10 Äpfel gegessen',test:p=>p.apfel>=10},
 {id:'doktor',icon:'🍏',name:'Doktor-Schreck',desc:'30 Äpfel gegessen',test:p=>p.apfel>=30},
 {id:'legende',icon:'🔒',name:'Legende',desc:'300 € Gesamtersparnis erreicht!',secret:true,test:p=>p.totalCents>=30000}
];
export function groupStats(entries){
 const persons=new Map(),counts=Object.fromEntries(Object.keys(TYPES).map(k=>[k,0]));let totalCents=0;
 for(const e of entries){const value=Number.isSafeInteger(e.amountCents)?e.amountCents:0;totalCents+=value;if(e.type in counts)counts[e.type]++;
  const key=personKey(e.person);if(!key)continue;if(!persons.has(key))persons.set(key,{key,name:e.person,count:0,totalCents:0,...Object.fromEntries(Object.keys(TYPES).map(k=>[k,0]))});
  const p=persons.get(key);p.count++;p.totalCents+=value;if(e.type in counts)p[e.type]++;
 }
 const leaderboard=[...persons.values()].map(p=>({...p,achievements:ACHIEVEMENTS.filter(a=>a.test(p))})).sort((a,b)=>b.totalCents-a.totalCents||a.name.localeCompare(b.name,'de'));
 return {counts,totalCents,leaderboard,persons};
}
export function savingsSeries(entries){const dates=[...new Set(entries.filter(e=>validDate(e.date)&&personKey(e.person)).map(e=>e.date))].sort();const people=groupStats(entries).leaderboard;return {dates,series:people.map(p=>{let total=0;return {name:p.name,key:p.key,values:dates.map(date=>{total+=entries.filter(e=>e.date===date&&personKey(e.person)===p.key).reduce((n,e)=>n+e.amountCents,0);return total;})};})};}
export function milestone(cents){const target=(Math.floor(cents/100000)+1)*100000;return {target,remaining:target-cents,percent:(cents-(target-100000))/1000};}
