/* DOMAIN_BUNDLE */

// Existing sheet columns A:D are kept. Additional metadata goes into E:H.
function doGet() {
 return HtmlService.createHtmlOutputFromFile('Index').setTitle('Draußen').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function runAppRequest(request) {
 const lock=LockService.getScriptLock();
 try {lock.waitLock(30000);return {ok:true,state:String(request?.action||'').startsWith('photo')?photoDispatch_(request):dispatch_(request||{})};}
 catch(error){return {ok:false,error:String(error.message||error)};}
 finally {try{lock.releaseLock();}catch(error){}}
}
function doPost(e) {
 let request={};try{request=JSON.parse(e.parameter.payload||'{}');}catch(error){}
 const props=PropertiesService.getScriptProperties(),key=props.getProperty('GROUP_ACCESS_KEY');
 const allowed=(props.getProperty('ALLOWED_ORIGINS')||'https://lutzwellensiek.github.io').split(',').map(x=>x.trim());
 const origin=allowed.indexOf(request.origin)>=0?request.origin:'https://lutzwellensiek.github.io';
 const result=key&&key.length>=16&&request.key===key&&allowed.indexOf(request.origin)>=0?runAppRequest(request):{ok:false,error:'Die externe Gruppenverbindung ist nicht freigegeben oder der Gruppenschlüssel ist ungültig. Bitte die bisherige App-Adresse verwenden.'};
 const response=JSON.stringify(Object.assign({channel:'unterwegs-group',id:request.id},result)).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return HtmlService.createHtmlOutput('<!doctype html><script>window.top.postMessage('+response+','+JSON.stringify(origin)+');</script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function book_(){const property=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');const ss=property?SpreadsheetApp.openById(property):SpreadsheetApp.getActiveSpreadsheet();if(!ss)throw new Error('Bitte das Skript an eure Tabelle binden oder SPREADSHEET_ID in den Skripteigenschaften setzen.');return ss;}
function sheet_(name,headers){const ss=book_();let s=ss.getSheetByName(name);if(!s){s=ss.insertSheet(name);s.appendRow(headers);}return s;}
function safeCell_(value){const text=String(value||'');return /^[=+@\-]/.test(text)?"'"+text:text;}
function text_(value){return String(value||'').replace(/^'(?=[=+@\-])/,'');}
function action_(entry){const name={karren:'Karren',stadtbad:'Stadtbad',freibier:'Freibier',apfel:'Apfel',print:'Drucken',other:'Andere Aktivität'}[entry.type];return entry.type==='custom'?'Individuell: '+entry.title:name+(entry.title?': '+entry.title:'');}
function themes_(){const themes=Object.create(null);let saved={};try{saved=JSON.parse(PropertiesService.getScriptProperties().getProperty('APP_THEMES')||'{}');}catch(error){}if(saved&&typeof saved==='object'&&!Array.isArray(saved))Object.keys(saved).forEach(function(key){if(FreebieDomain.validTheme(saved[key]))themes[key]=saved[key];});return themes;}
function sounds_(){const sounds=Object.create(null);let saved={};try{saved=JSON.parse(PropertiesService.getScriptProperties().getProperty('APP_SOUNDS')||'{}');}catch(error){}if(saved&&typeof saved==='object'&&!Array.isArray(saved))Object.keys(saved).forEach(function(key){if(typeof saved[key]==='boolean')sounds[key]=saved[key];});return sounds;}
function read_(){
 const s=sheet_('Fahrten',['Zeitstempel','Name','Aktion','Wert','ID','Barcode','Besuchsdatum','Decodierung']);
 if(s.getMaxColumns()<8)s.insertColumnsAfter(s.getMaxColumns(),8-s.getMaxColumns());
 const expected=['ID','Barcode','Besuchsdatum','Decodierung'],headers=s.getRange(1,5,1,4).getValues()[0];if(headers.some((v,i)=>v&&String(v)!==expected[i]))throw new Error('Die Zusatzspalten E:H sind bereits belegt. Bitte vor der Erweiterung prüfen.');if(headers.every(v=>!v)&&s.getLastRow()>1&&s.getRange(2,5,s.getLastRow()-1,4).getValues().some(row=>row.some(v=>v!=='')))throw new Error('In den Zusatzspalten E:H sind bereits Daten vorhanden. Es wurde nichts überschrieben.');s.getRange(1,5,1,4).setValues([expected]);
 const rows=s.getDataRange().getValues(),entries=[],timezone=Session.getScriptTimeZone();
 for(let i=1;i<rows.length;i++){
  const r=rows[i],person=text_(r[1]).trim();if(!person||FreebieDomain.personKey(person)==='person')continue;
  const a=text_(r[2]),fixed={Karren:'karren',Stadtbad:'stadtbad',Freibier:'freibier',Apfel:'apfel'};let type=fixed[a]||'other',title='';
  if(a.indexOf('Individuell:')===0){type='custom';title=a.slice(12).trim();}else if(a.indexOf('Drucken')===0){type='print';title=a.replace(/^Drucken:?\s*/,'');}else if(!fixed[a])title=a.replace(/^Andere Aktivität:?\s*/,'');
  let id=String(r[4]||'');if(!id){id=Utilities.getUuid();s.getRange(i+1,5).setValue(id);}
  let time=r[0] instanceof Date?r[0]:new Date(r[0]),valid=!isNaN(time.getTime());
  let date=r[6] instanceof Date?Utilities.formatDate(r[6],timezone,'yyyy-MM-dd'):String(r[6]||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))date=valid?Utilities.formatDate(time,timezone,'yyyy-MM-dd'):'';
  const amount=typeof r[3]==='number'?r[3]:Number(String(r[3]).replace(',','.'));const entry={id,person,type,title,date,amountCents:isFinite(amount)?Math.round(amount*100):0,scannedAt:valid?time.toISOString():'',source:r[5]?'scan':'manual'};
  if(r[5]){entry.barcode=String(r[5]);try{const metadata=JSON.parse(String(r[7]||'{}'));entry.detected=metadata.detected||{confidence:'unbekannt'};entry.assignment=metadata.assignment||'manual';}catch(error){entry.detected={confidence:'unbekannt'};}}
  entries.push(entry);
 }
 const votes={},villages={};const vs=book_().getSheetByName('Votes');if(vs){const rows=vs.getDataRange().getValues();for(let i=1;i<rows.length;i++){const key=FreebieDomain.personKey(text_(rows[i][1])),feature=String(rows[i][2]);if(key&&FreebieDomain.FEATURES.some(f=>f.id===feature))votes[key]=feature;}}
 const village=book_().getSheetByName('Village');if(village){const rows=village.getDataRange().getValues();for(let i=1;i<rows.length;i++){const key=FreebieDomain.personKey(text_(rows[i][1])),id=Number(rows[i][2]);if(key&&FreebieDomain.VILLAGE.some(v=>v.id===id)){villages[key]=villages[key]||[1];if(villages[key].indexOf(id)<0)villages[key].push(id);}}}
 return {entries,votes,villages,themes:themes_(),sounds:sounds_(),revision:Number(PropertiesService.getScriptProperties().getProperty('APP_REVISION')||0)};
}
function dispatch_(request){
 const action=request.action||'read',data=request.data||{},state=read_(),s=book_().getSheetByName('Fahrten');
 if(action==='read')return state;
 if(action==='add'){
  const input=data.entry||{},entry=FreebieDomain.createEntry(Object.assign({},input,{id:input.id||Utilities.getUuid()}));
  const prior=state.entries.find(e=>e.id===entry.id||entry.barcode&&e.barcode===entry.barcode);
  if(prior){if(prior.id===entry.id)return state;throw new Error('Bereits erfasst. Dieser Barcode wird nicht doppelt gezählt.');}
  FreebieDomain.checkPrintBudget(state.entries,entry);
  s.appendRow([new Date(),safeCell_(entry.person),safeCell_(action_(entry)),entry.amountCents/100,entry.id,'',entry.date,JSON.stringify({detected:entry.detected,assignment:entry.assignment})]);
  // Force text format BEFORE writing long barcode strings to retain all digits.
  if(entry.barcode)s.getRange(s.getLastRow(),6).setNumberFormat('@').setValue(entry.barcode);
 }else if(action==='delete'||action==='assign'){
  const name=FreebieDomain.cleanName(data.name),entry=state.entries.find(e=>e.id===String(data.id));if(!entry)return state;
  const ids=s.getRange(2,5,Math.max(1,s.getLastRow()-1),1).getValues(),index=ids.findIndex(row=>String(row[0])===entry.id)+2;
  if(action==='delete'){if(FreebieDomain.personKey(name)!==FreebieDomain.personKey(entry.person))throw new Error('Bitte den Namen des zugehörigen Eintrags wählen.');photoRetireEntries_([entry.id]);s.deleteRow(index);}
  else{if(entry.person)throw new Error('Dieser Eintrag ist bereits zugeordnet.');s.getRange(index,2).setValue(safeCell_(name));}
 }else if(action==='reset'){
  const name=FreebieDomain.cleanName(data.name),rows=s.getDataRange().getValues();photoRetireEntries_(state.entries.filter(function(e){return FreebieDomain.personKey(e.person)===FreebieDomain.personKey(name);}).map(function(e){return e.id;}));for(let i=rows.length-1;i>=1;i--)if(FreebieDomain.personKey(text_(rows[i][1]))===FreebieDomain.personKey(name))s.deleteRow(i+1);
 }else if(action==='sound'){
  const name=FreebieDomain.cleanName(data.name),key=FreebieDomain.personKey(name);if(typeof data.enabled!=='boolean')throw new Error('Ungültige Ton-Einstellung.');state.sounds[key]=data.enabled;PropertiesService.getScriptProperties().setProperty('APP_SOUNDS',JSON.stringify(state.sounds));
 }else if(action==='theme'){
  const name=FreebieDomain.cleanName(data.name),key=FreebieDomain.personKey(name);if(!FreebieDomain.validTheme(data.theme))throw new Error('Unbekannter Farbstil.');state.themes[key]=data.theme;PropertiesService.getScriptProperties().setProperty('APP_THEMES',JSON.stringify(state.themes));
 }else if(action==='vote'){
  const name=FreebieDomain.cleanName(data.name);if(!FreebieDomain.FEATURES.some(f=>f.id===data.feature))throw new Error('Unbekannte Abstimmung.');const v=sheet_('Votes',['Timestamp','Name','FeatureId']),rows=v.getDataRange().getValues();let index=-1;for(let i=1;i<rows.length;i++)if(FreebieDomain.personKey(text_(rows[i][1]))===FreebieDomain.personKey(name)){if(index<0)index=i+1;}
  const values=[new Date(),safeCell_(name),data.feature];if(index>0){v.getRange(index,1,1,3).setValues([values]);for(let i=rows.length-1;i>=1;i--)if(i+1!==index&&FreebieDomain.personKey(text_(rows[i][1]))===FreebieDomain.personKey(name))v.deleteRow(i+1);}else v.appendRow(values);
 }else if(action==='unlock'){
  const name=FreebieDomain.cleanName(data.name),key=FreebieDomain.personKey(name),stage=FreebieDomain.VILLAGE.find(v=>v.id===Number(data.id));if(!stage)throw new Error('Unbekanntes Gebäude.');
  if((state.villages[key]||[]).indexOf(stage.id)>=0)return state;
  const person=FreebieDomain.groupStats(state.entries).persons.get(key);if((person?person.totalCents:0)<stage.cents)throw new Error('Dafür hast du noch nicht genug gespart.');sheet_('Village',['Timestamp','Name','BuildingId']).appendRow([new Date(),safeCell_(name),stage.id]);
 }else throw new Error('Unbekannte Aktion.');
 const props=PropertiesService.getScriptProperties();props.setProperty('APP_REVISION',String(state.revision+1));SpreadsheetApp.flush();return read_();
}
