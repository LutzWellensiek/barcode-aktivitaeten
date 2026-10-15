import {build} from 'esbuild';
import {cp,mkdir,writeFile,readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await mkdir('dist/licenses',{recursive:true});
for(const name of ['browser','library']) await cp(`node_modules/@zxing/${name}/LICENSE`,`dist/licenses/zxing-${name}.txt`);
await cp('node_modules/@zxing/text-encoding/LICENSE.md','dist/licenses/zxing-text-encoding.txt');
await cp('THIRD_PARTY_NOTICES.md','dist/licenses/THIRD_PARTY_NOTICES.md');
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',target:['safari15.4'],outfile:'dist/app.js',minify:true,legalComments:'eof'});
// Dependency-free PNG encoder for install icons. No external fonts or remote assets.
function crc(buffer){let c=0xffffffff;for(const b of buffer){c^=b;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),size=Buffer.alloc(4),checksum=Buffer.alloc(4);size.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([size,t,data,checksum]);}
for(const size of [192,512]){const pixels=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){for(let x=0;x<size;x++){const px=x/size,py=y/size;const mountain=Math.abs(py-(.3+Math.abs(px-.46)*1.2))<.023&&px>.22&&px<.76;const trunk=Math.abs(px-.46)<.022&&py>.3&&py<.7;const wave=Math.abs(py-(.75+Math.sin(px*24)*.022))<.014&&px>.23&&px<.77;const color=mountain||trunk?[230,239,183]:wave?[146,183,166]:[21,61,55];const offset=y*(size*4+1)+1+x*4;pixels.set([...color,255],offset);}}const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;await writeFile(`dist/icons/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));}
async function list(dir,prefix=''){const files=[];for(const d of await readdir(dir,{withFileTypes:true})){if(d.isDirectory())files.push(...await list(`${dir}/${d.name}`,`${prefix}${d.name}/`));else if(d.name!=='sw.js')files.push(prefix+d.name);}return files;}
// Versioned URLs prevent an old HTTP/service-worker cache from serving old code.
const appHash=createHash('sha256').update(await readFile('dist/app.js')).digest('hex').slice(0,12);
const cssHash=createHash('sha256').update(await readFile('dist/styles.css')).digest('hex').slice(0,12);
const assetURL=f=>f==='app.js'?`./app.js?v=${appHash}`:f==='styles.css'?`./styles.css?v=${cssHash}`:'./'+f;
let html=await readFile('dist/index.html','utf8');
html=html.replace('./app.js',assetURL('app.js')).replace('./styles.css',assetURL('styles.css'));
await writeFile('dist/index.html',html);
const files=await list('dist');const hash=createHash('sha256');for(const f of files)hash.update(await readFile(`dist/${f}`));const version=hash.digest('hex').slice(0,12);
await writeFile('dist/sw.js',`const CACHE='unterwegs-${version}';const ASSETS=${JSON.stringify(['./',...files.map(assetURL)])};self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('unterwegs-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`);
console.log(`Built dist · ${files.length+1} assets · ${version}`);

// The Apps Script backend shares the validated domain model with the browser.
const domain=await build({entryPoints:['src/freebies.js'],bundle:true,format:'iife',globalName:'FreebieDomain',target:'es2020',minify:true,write:false});
const backend=(await readFile('apps-script/Backend.template.gs','utf8')).replace('/* DOMAIN_BUNDLE */',domain.outputFiles[0].text);
await writeFile('apps-script/Code.gs',backend);
