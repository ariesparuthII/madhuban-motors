const fs=require('fs');const {chromium}=require(process.env.MM_PLAYWRIGHT || 'playwright');
const report={viewports:[],errors:[],consoleErrors:[],failedLocal:[]};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const [width,height] of [[390,844],[1280,800]]){
 const p=await b.newPage({viewport:{width,height}});p.setDefaultTimeout(20000);
 p.on('pageerror',e=>report.errors.push({width,error:e.message}));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push({width,error:m.text()})});p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)report.failedLocal.push(r.url())});
 // Read-only diagnostics are injected into this test response, never into shipped source.
 await p.route('**/assets/web/showroom.js*',async route=>{let r=await route.fetch();let s=await r.text();s=s.replace('  const api = {','  window.__sceneCheck = { car, camera, parts, pick, wheels, get previewKey(){return previewKey}, get currentPart(){return currentPart} };\n  const api = {');await route.fulfill({response:r,body:s});});
 await p.goto('http://localhost:8000',{waitUntil:'domcontentloaded'});await p.evaluate(()=>mmSetAnalyticsConsent(false));await p.waitForFunction(()=>document.querySelector('#showroom').classList.contains('is-ready'),{timeout:60000});await p.waitForTimeout(4000);
 const result={width,height,chapters:[],dives:[],chips:[],hotspots:{}};
 const go=async k=>{await p.locator(`[data-ch="${k}"]`).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'}));await p.waitForTimeout(1600);};
 for(const key of await p.locator('.sr-ch').evaluateAll(es=>es.map(e=>e.dataset.ch))){await go(key);result.chapters.push(await p.locator(`[data-ch="${key}"]`).evaluate(e=>{let r=e.querySelector('.sr-panel').getBoundingClientRect();return{key:e.dataset.ch,active:document.querySelector('#showroom').dataset.chapter,width:document.documentElement.scrollWidth,panel:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},canvasClip:document.querySelector('.sr-stage canvas').style.clipPath}}));await p.screenshot({path:`verification/${width}-${key}-after.png`});console.log(width,'chapter',key);
 const btn=p.locator(`[data-ch="${key}"] [data-dive]`);if(await btn.count()){await btn.click();await p.waitForFunction(()=>document.querySelector('.sr-dive').classList.contains('is-open'));await p.waitForTimeout(500);let d=await p.locator('.sr-dive').evaluate(e=>({key:document.querySelector('#showroom').dataset.chapter,title:e.querySelector('.sr-dive__title').textContent,caption:e.querySelector('.sr-dive__cap').textContent,canvas:e.querySelector('canvas').height,focus:document.activeElement.className}));await p.screenshot({path:`verification/${width}-dive-${key}.png`});await p.locator('.sr-dive__close').click();await p.waitForTimeout(450);d.closed=await p.locator('.sr-dive').evaluate(e=>e.hidden&&!document.body.classList.contains('sr-diving'));result.dives.push(d);}
 }
 await go('car');let sum=0;
 for(const chip of await p.locator('.sr-pick').all()){const key=await chip.getAttribute('data-part');sum+=+(await chip.getAttribute('data-price'));await chip.click();await p.waitForTimeout(800);result.chips.push({key,pressed:await chip.getAttribute('aria-pressed'),total:await p.locator('.sr-total b').textContent(),preview:await p.evaluate(()=>window.__sceneCheck.previewKey),part:await p.evaluate(()=>window.__sceneCheck.currentPart)});console.log(width,'chip',key);}
 await p.locator('#srBrand').selectOption({label:'Hyundai'});await p.locator('#srModel').fill('Creta 2023');await p.locator('.sr-send').evaluate(e=>e.addEventListener('click',ev=>ev.preventDefault()));await p.locator('.sr-send').click();result.builderUrl=await p.locator('.sr-send').getAttribute('href');result.storage=await p.evaluate(()=>({...sessionStorage}));
 // Deselect the most recently chosen chip and retain preview of a remaining choice.
 await p.locator('.sr-pick[data-part="coating"]').click();result.remainingPreview=await p.evaluate(()=>window.__sceneCheck.previewKey);
 // Raycast the actual model over screen positions and click a genuine mesh for each action.
 await go('hero');await p.waitForTimeout(2500);
 result.hotspots=await p.evaluate(()=>{const d=window.__sceneCheck,canvas=document.querySelector('.sr-stage canvas'),r=canvas.getBoundingClientRect(),out={};for(let y=80;y<Math.min(innerHeight*.55,460);y+=5)for(let x=5;x<innerWidth-5;x+=5){const a=d.pick({clientX:x,clientY:y});if(a&&!out[a.key]&&document.elementFromPoint(x,y)===canvas)out[a.key]={x,y};}return out});
 for(const key of ['door','horn','wheels','paint','inside']){const point=result.hotspots[key];if(!point){console.log('MISSING HOTSPOT',width,key);continue;}await p.mouse.click(point.x,point.y);await p.waitForTimeout(350);result.hotspots[key].clicked=true;if(key==='inside')await p.waitForTimeout(1200);}
 report.viewports.push(result);await p.close();fs.writeFileSync('verification/results.json',JSON.stringify(report,null,2));
}
await b.close();console.log('DONE',JSON.stringify({errors:report.errors,consoleErrors:report.consoleErrors,failedLocal:report.failedLocal}));})();
