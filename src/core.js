export function normalizeBarcode(value) {
  const code = String(value).replace(/\s/g, '');
  if (!/^\d{6,80}$/.test(code)) throw new Error('Bitte 6 bis 80 Ziffern eingeben. Leerzeichen sind erlaubt, andere Zeichen nicht.');
  return code;
}
export function validMod10(code) {
  if (!/^\d{22}$/.test(code)) return false;
  let sum = 0;
  for (let i = code.length - 2, weight = 3; i >= 0; i--, weight = 4 - weight) sum += Number(code[i]) * weight;
  return (10 - sum % 10) % 10 === Number(code.at(-1));
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T12:00:00`);
  return !Number.isNaN(d.getTime()) && localDate(d) === date;
}
export function detectBarcode(input, year = new Date().getFullYear()) {
  const barcode = normalizeBarcode(input);
  const unknown = {barcode,type:'unknown',label:'Unbekannter Barcode',confidence:'unbekannt',message:'Kein bekanntes Format. Aktivität und Besuchsdatum bitte selbst wählen.'};
  if (barcode.length === 22) return validMod10(barcode)
    ? {barcode,type:'stadtbad',label:'Stadtbad',confidence:'wahrscheinlich',message:'22 Ziffern mit gültiger Modulo-10-Prüfziffer. Das Format ist kein eindeutiger Herkunftsnachweis. Besuchsdatum bitte wählen; es ist nicht decodiert.'}
    : {...unknown,message:'22 Ziffern, aber ungültige Modulo-10-Prüfziffer. Bitte Eingabe prüfen oder bewusst manuell zuordnen.'};
  if (barcode.length !== 24) return unknown;
  const n = BigInt(barcode);
  if (n >= (1n << 80n)) return unknown;
  const dayCode = Number((n >> 71n) & 511n);
  const monthCode = Number((n >> 64n) & 127n);
  const day = dayCode - 210, month = (monthCode + 9) / 8;
  const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  if (!Number.isInteger(month) || month < 1 || month > 12 || day < 1 || day > 31 || !validDate(date)) return unknown;
  const product = ((n >> 24n) & ((1n << 40n)-1n)).toString(16).padStart(10,'0').toUpperCase();
  const variant = {'292A8BA1F7':'Berg- & Talfahrt','1FAAABA1F7':'Berg- & Talfahrt Abend'}[product];
  return {barcode,type:'karren',label:variant ? `Karren · ${variant}` : 'Karren? · unbekanntes Produkt',confidence:'experimentell',suggestedDate:date,day,month,dayCode,monthCode,product,serial:Number((n >> 10n)&16383n),extra:Number(n & 1023n),message:`Experimentelle Karren-Heuristik. Tag/Monat vermutet: ${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}. Das Jahr ist nicht decodiert; ${year} ist nur vorbelegt. ${variant ? 'Produktkennung aus bisherigen Beispielen bekannt.' : 'Produktkennung unbekannt: Zuordnung besonders unsicher.'} Letzte 10 Bit ungeklärt. Bitte Ticket prüfen.`};
}
export function statistics(entries, today = localDate()) {
  return {total:entries.length,karren:entries.filter(e=>e.type==='karren').length,stadtbad:entries.filter(e=>e.type==='stadtbad').length,month:entries.filter(e=>e.date.startsWith(today.slice(0,7))).length};
}
export function csv(entries){
 const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';const safe=value=>/^[=+@\-\t\r]/.test(String(value||''))?"'"+value:value;
 const rows=[['Besuchsdatum','Name','Typ','Beschreibung','Wert EUR','Barcode','Erfasst am','Erkennung','Zuordnung','Produktkennung','Serienfeld','Zusatz']];
 for(const e of entries)rows.push([e.date,safe(e.person),e.type,safe(e.title),((e.amountCents||0)/100).toFixed(2).replace('.',','),e.barcode,e.scannedAt,e.detected?.confidence,e.assignment,e.detected?.product,e.detected?.serial,e.detected?.extra]);
 return '\uFEFF'+rows.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n';
}
