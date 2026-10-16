import {test,expect} from '@playwright/test';
async function ready(page){await page.goto('./');await expect(page.locator('#offline-status')).toContainText('Offline bereit');}
async function quick(page,type){await page.locator(`[data-quick=${type}]`).click();await expect(page.locator('#toast')).toContainText('erfasst');}
test('name, four quick actions, custom savings, badges and chart persist',async({page})=>{
 await ready(page);await page.locator('[data-quick=karren]').click();await expect(page.locator('#toast')).toContainText('Namen');await page.locator('#person-name').fill('Anna');
 for(const type of ['karren','stadtbad','freibier','apfel'])await quick(page,type);
 await expect(page.locator('#group-stat-total')).toHaveText('4');await expect(page.locator('#total-saved')).toContainText('30,85');
 await page.locator('.custom-details summary').click();await page.locator('#custom-title').fill('Kaffee');await page.locator('#custom-value').fill('20,50');await page.getByRole('button',{name:'Ersparnis eintragen',exact:true}).click();await expect(page.locator('#group-stat-total')).toHaveText('5');await expect(page.locator('#my-saved')).toContainText('51,35');
 await expect(page.locator('.achievement.unlocked')).toHaveCount(3);
 await expect(page.locator('#savings-chart svg')).toBeVisible();await page.locator('.leader-row').click();await expect(page.locator('#detail-dialog')).toBeVisible();await expect(page.locator('#detail-content')).toContainText('51,35');await page.locator('#detail-close').click();
 await page.reload();await expect(page.locator('#person-name')).toHaveValue('Anna');await expect(page.locator('#group-stat-total')).toHaveText('5');await expect(page.getByText('Druckauftrag erfassen',{exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=Math.ceil(innerWidth))).toBe(true);
});
test('case-insensitive persons, overtake notice, secret achievement and filters',async({page})=>{
 await ready(page);await page.locator('#person-name').fill('Anna');await quick(page,'karren');await page.locator('#person-name').fill('Ben');await page.locator('.custom-details summary').click();await page.locator('#custom-title').fill('Sonderaktion');await page.locator('#custom-value').fill('300');await page.getByRole('button',{name:'Ersparnis eintragen',exact:true}).click();await expect(page.locator('#total-saved')).toContainText('316,50');await expect(page.locator('#achievements')).toContainText('Legende');
 await page.locator('#person-name').fill(' anna ');await expect(page.locator('#overtake-alert')).toContainText('Platz 2');await expect(page.locator('#my-saved')).toContainText('16,50');await quick(page,'apfel');await expect(page.locator('.leader-row')).toHaveCount(2);await page.locator('#history-panel>summary').click();await page.locator('#person-filter').selectOption('mine');await expect(page.locator('.entry')).toHaveCount(2);await page.locator('#search').fill('Apfel');await expect(page.locator('.entry')).toHaveCount(1);
});
test('version-one barcode database migrates without losing entries and can be assigned',async({page})=>{
 await page.goto('/setup-migration-not-a-page');await page.evaluate(async()=>{await new Promise((resolve,reject)=>{const r=indexedDB.open('barcode-aktivitaeten',1);r.onupgradeneeded=()=>r.result.createObjectStore('entries',{keyPath:'barcode'});r.onsuccess=()=>{const tx=r.result.transaction('entries','readwrite');tx.objectStore('entries').add({barcode:'506605898833117757135878',type:'karren',date:'2026-10-04',scannedAt:'2026-10-15T10:00:00Z',detected:{confidence:'experimentell'},assignment:'suggested'});tx.oncomplete=()=>{r.result.close();resolve();};tx.onerror=()=>reject(tx.error);};r.onerror=()=>reject(r.error);});});
 await ready(page);await expect(page.locator('#group-stat-total')).toHaveText('1');await expect(page.locator('.entry')).toContainText('Noch keiner Person');await page.locator('#person-name').fill('Anna');await page.locator('#history-panel>summary').click();await page.getByRole('button',{name:'Meinem Namen zuordnen'}).click();await page.getByRole('button',{name:'Zuordnen',exact:true}).click();await expect(page.locator('#my-saved')).toContainText('16,50');await page.reload();await expect(page.locator('#group-stat-total')).toHaveText('1');await expect(page.locator('.entry')).toContainText('Anna');
});
test('Apps Script mode automatically loads shared data and saves through native RPC',async({page})=>{
 await page.addInitScript(()=>{window.__group={entries:[{id:'legacy',person:'Anna',type:'karren',date:'2026-10-01',amountCents:1650,title:'',scannedAt:'2026-10-01T10:00:00Z'}],votes:{anna:'darkmode'},villages:{},revision:1};window.__calls=[];window.google={script:{run:{withSuccessHandler(success){return {withFailureHandler(failure){return {runAppRequest(request){window.__calls.push(request.action);if(request.action==='add'){window.__group.entries.push(request.data.entry);window.__group.revision++;}setTimeout(()=>success({ok:true,state:structuredClone(window.__group)}),5);}};}};}}}};});
 await page.goto('./');await expect(page.locator('body')).toHaveAttribute('data-data-mode','group');await expect(page.locator('#group-stat-total')).toHaveText('1');await page.locator('#person-name').fill('Ben');await quick(page,'stadtbad');await expect(page.locator('#group-stat-total')).toHaveText('2');await expect(page.locator('#total-saved')).toContainText('25,90');expect(await page.evaluate(()=>window.__calls.includes('add'))).toBe(true);await expect(page.locator('#connection,#connect-form')).toHaveCount(0);
});
test('external group bridge posts a key in the body and accepts verified replies',async({page})=>{
 let requestBody='';await page.route('https://script.google.com/macros/s/TEST/exec',async route=>{requestBody=route.request().postData()||'';const request=JSON.parse(new URLSearchParams(requestBody).get('payload'));await route.fulfill({contentType:'text/html',body:`<script>parent.postMessage(${JSON.stringify({channel:'unterwegs-group',id:request.id,ok:true,state:{entries:[],votes:{},villages:{},revision:1}})},${JSON.stringify(request.origin)})</script>`});});
 await page.addInitScript(()=>localStorage.setItem('unterwegs-group',JSON.stringify({endpoint:'https://script.google.com/macros/s/TEST/exec',key:'this-is-a-test-key-not-a-secret'})));await ready(page);await expect(page.locator('body')).toHaveAttribute('data-data-mode','group');expect(requestBody).toContain('payload=');expect(decodeURIComponent(requestBody.replaceAll('+',' '))).toContain('this-is-a-test-key-not-a-secret');
});
test('Google camera popup returns barcode to the original group page without saving',async({page})=>{
 await page.addInitScript(()=>{window.google={script:{run:{withSuccessHandler(success){return {withFailureHandler(){return {runAppRequest(){setTimeout(()=>success({ok:true,state:{entries:[],votes:{},villages:{},revision:1}}),5);}};}};}}}};});
 await page.goto('./');await expect(page.locator('body')).toHaveAttribute('data-data-mode','group');
 await page.locator('#ticket-summary').click();const popupPromise=page.waitForEvent('popup');await page.locator('#start-camera').click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toContain('scanner=1');await expect(popup.locator('#person-name')).toBeHidden();await popup.locator('#barcode').fill('506605898833117757135878');await popup.getByRole('button',{name:'Barcode prüfen'}).click();await expect(page.locator('#review-barcode')).toHaveText('506605898833117757135878');await expect(page.locator('#group-stat-total')).toHaveText('0');await expect(page.locator('#review')).toBeVisible();
});


test('shared Google data still loads when iframe browser storage is blocked',async({page})=>{
 await page.addInitScript(()=>{window.google={script:{run:{withSuccessHandler(success){return {withFailureHandler(){return {runAppRequest(){setTimeout(()=>success({ok:true,state:{entries:[{id:'old',person:'Anna',type:'karren',date:'2026-10-01',amountCents:1650,title:''}],votes:{},villages:{},revision:1}}),5);}};}};}}}};Object.defineProperty(indexedDB,'open',{configurable:true,value(){throw new DOMException('Third-party storage blocked','SecurityError');}});Storage.prototype.getItem=function(){throw new DOMException('Storage blocked','SecurityError');};});
 await page.goto('./');await expect(page.locator('body')).toHaveAttribute('data-data-mode','group');await expect(page.locator('#group-stat-total')).toHaveText('1');await expect(page.locator('#total-saved')).toContainText('16,50');await expect(page.locator('#storage-error')).toBeHidden();
});


test('compact sections, removed features and ranking order',async({page})=>{
 await ready(page);await expect(page.locator('.masthead')).not.toContainText('Google');await expect(page.locator('#storage-label,#village,#voting')).toHaveCount(0);
 await expect(page.locator('#ticket-panel')).not.toHaveAttribute('open');await expect(page.locator('#barcode')).toBeHidden();await expect(page.locator('#history-panel')).not.toHaveAttribute('open');
 expect(await page.locator('main').evaluate(e=>e.lastElementChild.id)).toBe('history-panel');expect(await page.locator('.workspace').evaluate(e=>e.nextElementSibling.firstElementChild.id)).toBe('ranking');
 await page.locator('#ticket-summary').click();await expect(page.locator('#barcode')).toBeVisible();await page.locator('#person-name').click();await page.locator('#person-name').fill('Anna');await expect(page.locator('#barcode')).toBeHidden();await quick(page,'apfel');
 await page.locator('#history-panel>summary').click();await expect(page.locator('.entry')).toBeVisible();await page.locator('#person-name').click();await expect(page.locator('.entry')).toBeHidden();
});
test('remembered name and current date on reload, return and midnight',async({page})=>{
 await page.clock.install({time:new Date('2026-10-15T23:59:50')});await ready(page);await page.locator('#person-name').fill('Anna');await page.locator('#manual-date').click();await expect(page.locator('#manual-date')).toHaveValue('2026-10-15');
 await page.clock.runFor(20000);await expect(page.locator('#manual-date')).toHaveValue('2026-10-16');await page.locator('#manual-date').fill('2026-10-01');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.locator('#manual-date')).toHaveValue('2026-10-16');
 await page.reload();await expect(page.locator('#person-name')).toHaveValue('Anna');await expect(page.locator('#manual-date')).toHaveValue('2026-10-16');
});
test('name restores from IndexedDB when localStorage is unavailable',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
 await ready(page);await page.locator('#person-name').fill('Anna');await page.locator('#manual-date').click();await expect.poll(()=>page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('barcode-aktivitaeten');request.onsuccess=()=>{const db=request.result,r=db.transaction('meta').objectStore('meta').get('person-name');r.onsuccess=()=>{resolve(r.result?.value);db.close();};r.onerror=()=>reject(r.error);};request.onerror=()=>reject(request.error);}))).toBe('Anna');await page.reload();await expect(page.locator('#person-name')).toHaveValue('Anna');
});
test('large chart supports zoom, dragging, pinch, legend and reset',async({page})=>{
 await ready(page);await page.locator('#person-name').fill('Anna');await quick(page,'karren');await page.locator('#person-name').fill('Ben');await quick(page,'stadtbad');await page.locator('#savings-chart').click();await expect(page.locator('#chart-dialog')).toBeVisible();await expect(page.locator('#chart-canvas svg')).toBeVisible();
 await page.locator('#chart-zoom-in').click();await expect(page.locator('#chart-zoom-label')).toHaveText('150 %');
 const viewport=page.locator('#chart-viewport'),box=await viewport.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+50,box.y+box.height/2+20,{steps:5});await page.mouse.up();await expect(page.locator('#chart-canvas')).toHaveCSS('transform',/matrix\(1.5, 0, 0, 1.5, 50, 20\)/);
 await page.locator('#chart-reset').click();await expect(page.locator('#chart-zoom-label')).toHaveText('100 %');
 // Synthetic touch pointers exercise the Safari gesture handlers; real mouse dragging above verifies pointer capture.
 await viewport.evaluate(e=>{e.setPointerCapture=()=>{};});
 await viewport.dispatchEvent('pointerdown',{pointerId:11,pointerType:'touch',button:0,clientX:box.x+box.width*.4,clientY:box.y+box.height*.5});await viewport.dispatchEvent('pointerdown',{pointerId:12,pointerType:'touch',button:0,clientX:box.x+box.width*.6,clientY:box.y+box.height*.5});
 await viewport.dispatchEvent('pointermove',{pointerId:12,pointerType:'touch',clientX:box.x+box.width*.8,clientY:box.y+box.height*.5});await expect(page.locator('#chart-zoom-label')).toHaveText('200 %');
 await viewport.dispatchEvent('pointerup',{pointerId:11});await viewport.dispatchEvent('pointerup',{pointerId:12});
 await page.locator('#chart-large-legend button').filter({hasText:'Anna'}).click();await expect(page.locator('#chart-large-legend button').filter({hasText:'Anna'})).toHaveAttribute('aria-pressed','false');await expect(page.locator('#chart-canvas polyline')).toHaveCount(1);
 await page.locator('#chart-close').click();await expect(page.locator('#chart-dialog')).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=Math.ceil(innerWidth))).toBe(true);
});


test('personal counters change with selected name while group counters retain everyone',async({page})=>{
 await page.clock.install({time:new Date('2026-10-16T12:00:00')});await ready(page);await page.locator('#person-name').fill('Anna');await page.locator('#manual-date').fill('2026-09-20');await quick(page,'karren');await page.locator('#manual-date').fill('2026-10-16');await quick(page,'stadtbad');await page.locator('#person-name').fill('Ben');await quick(page,'karren');await quick(page,'apfel');
 for(const [id,value]of Object.entries({'stat-total':'2','stat-karren':'1','stat-stadtbad':'0','stat-month':'2','group-stat-total':'4','group-stat-karren':'2','group-stat-stadtbad':'1','group-stat-month':'3'}))await expect(page.locator('#'+id)).toHaveText(value);
 await page.locator('#person-name').fill(' aNNa ');for(const [id,value]of Object.entries({'stat-total':'2','stat-karren':'1','stat-stadtbad':'1','stat-month':'1'}))await expect(page.locator('#'+id)).toHaveText(value);
 await expect(page.locator('#total-saved')).toContainText('42,85');await page.locator('#person-name').fill('');for(const id of ['total','karren','stadtbad','month'])await expect(page.locator('#stat-'+id)).toHaveText('0');await expect(page.locator('#group-stat-total')).toHaveText('4');
});
test('logo stays inside app despite Google base target and removed sections are absent',async({page})=>{
 await ready(page);await page.locator('#person-name').fill('Anna');await quick(page,'apfel');await page.evaluate(()=>{const base=document.createElement('base');base.target='_top';base.href='https://example.test/userCodeAppPanel';document.head.prepend(base);});const before=page.url();
 await page.locator('#history-panel>summary').click();await page.locator('.brand').click();expect(page.url()).toBe(before);await expect(page.locator('#person-name')).toHaveValue('Anna');await expect(page.locator('#group-stat-total')).toHaveText('1');await expect(page.locator('.brand')).toHaveAttribute('type','button');
 await expect(page.locator('.section-nav,#connection,.about,#person-count')).toHaveCount(0);await expect(page.getByText('Personen · viele kleine Vorteile',{exact:false})).toHaveCount(0);
});
test('native date field fits mobile identity card with consistent control heights',async({page})=>{
 await ready(page);for(const width of [320,375,390,430,768]){await page.setViewportSize({width,height:844});const layout=await page.locator('.identity').evaluate(e=>{const date=e.querySelector('#manual-date'),name=e.querySelector('#person-name'),d=(date.closest('.date-control')||date).getBoundingClientRect(),n=name.getBoundingClientRect(),card=e.getBoundingClientRect();return {height:d.height,nameHeight:n.height,left:d.left,right:d.right,cardRight:card.right,scroll:document.documentElement.scrollWidth,window:innerWidth,scrollWidth:date.scrollWidth,clientWidth:date.clientWidth};});expect(layout.height).toBe(layout.nameHeight);expect(layout.right).toBeLessThanOrEqual(layout.cardRight);expect(layout.scroll).toBeLessThanOrEqual(layout.window);expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth+1);}
});


test('unchanged group refresh preserves clickable rows when returning to the app',async({page})=>{
 await page.addInitScript(()=>{window.__completedReads=0;window.google={script:{run:{withSuccessHandler(success){return {withFailureHandler(){return {runAppRequest(){setTimeout(()=>{success({ok:true,state:{entries:[{id:'old',person:'Anna',type:'karren',date:'2026-10-01',amountCents:1650,title:''}],votes:{},villages:{},revision:1}});window.__completedReads++;},5);}};}};}}}};});
 await page.goto('./');await expect(page.locator('#group-stat-total')).toHaveText('1');await page.locator('#person-name').fill('Anna');const reads=await page.evaluate(()=>{window.__stableLeader=document.querySelector('.leader-row');const n=window.__completedReads;window.dispatchEvent(new Event('focus'));return n;});await expect.poll(()=>page.evaluate(()=>window.__completedReads)).toBeGreaterThan(reads);expect(await page.evaluate(()=>window.__stableLeader===document.querySelector('.leader-row'))).toBe(true);await page.locator('.leader-row').click();await expect(page.locator('#detail-dialog')).toBeVisible();
});
