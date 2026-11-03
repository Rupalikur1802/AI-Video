import {chromium} from 'playwright';
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_URL||'http://localhost:3001';await mkdir('out/generation/ui',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe')});
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/preview/workspace?state=progress`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Generating video',exact:true}).waitFor();assert.equal(await page.locator('.generation-progress ol li').count(),5);assert.equal(await page.getByRole('button',{name:'Continue to share'}).isDisabled(),true);await page.screenshot({path:`out/generation/ui/progress-${width}.png`,fullPage:true});
 await page.goto(`${base}/preview/workspace?state=ready`,{waitUntil:'networkidle'});await page.getByLabel('Video preview version 1',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Continue to share'}).isEnabled(),true);await page.screenshot({path:`out/generation/ui/ready-${width}.png`,fullPage:true});
 await page.getByLabel('What would you like to change?').fill('Make the opening stronger');await page.getByRole('button',{name:'Propose revision'}).click();await page.getByRole('button',{name:'Apply changes'}).click();await page.getByText('Your script or settings changed.',{exact:false}).waitFor();assert.equal(await page.getByLabel('Video preview version 1',{exact:true}).count(),1);
 await page.getByRole('button',{name:'Continue to share'}).click();const download=page.getByRole('link',{name:'Download sample MP4'});await download.waitFor();assert.ok((await download.getAttribute('href')).includes('res.cloudinary.com'));assert.equal(await page.getByRole('button',{name:'Coming soon'}).isDisabled(),true);await page.screenshot({path:`out/generation/ui/share-${width}.png`,fullPage:true});
 await page.goto(`${base}/preview/workspace?state=failed`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'We couldn’t finish this video.'}).waitFor();await page.getByRole('button',{name:'Try again',exact:true}).waitFor();await page.screenshot({path:`out/generation/ui/failed-${width}.png`,fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);assert.deepEqual(errors,[]);
 const denied=await page.request.post(`${base}/api/projects/000000000000000000000001/generate`,{headers:{origin:base,'Idempotency-Key':'browser-test-only'},data:{expectedVersion:1}});assert.ok([401,403].includes(denied.status()));
 console.log(`${width}px: real-stage layout, duplicate-action gating, ready preview, revision preservation, download, recovery, mobile overflow and anonymous generation denial passed`);await page.close();
}}finally{await browser.close();}
