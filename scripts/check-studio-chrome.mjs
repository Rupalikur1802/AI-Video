import {chromium} from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_URL||'http://localhost:3001';
const browser=await chromium.launch({headless:true,executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe')});
try{
 for(const width of [1440,900,768,390]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});page.setDefaultNavigationTimeout(90000);
  const geometry=async()=>page.evaluate(()=>{const side=document.querySelector('.studio-sidebar'),top=document.querySelector('.studio-topbar');const s=getComputedStyle(side),t=top.getBoundingClientRect();return {sidebarWidth:s.width,sidebarBackground:s.backgroundColor,topbarHeight:t.height,topbarLeft:t.left,brand:document.querySelector('.studio-brand img').getAttribute('src'),links:[...document.querySelectorAll('nav[aria-label="Studio"] button')].map(n=>n.textContent)};});
  await page.goto(`${base}/preview/dashboard`,{waitUntil:'networkidle'});const dashboard=await geometry();
  await page.goto(`${base}/preview/workspace`,{waitUntil:'networkidle'});assert.deepEqual(await geometry(),dashboard,`Shared chrome differs at ${width}px`);
  assert.equal(await page.locator('nav[aria-label="Studio"] [aria-current="page"]').textContent(),'Create video');
  if(width>700){await page.getByRole('button',{name:'Collapse sidebar'}).click();await page.waitForFunction(()=>document.querySelector('.studio-topbar').getBoundingClientRect().left===82);assert.equal((await geometry()).topbarLeft,82);assert.equal(await page.locator('.creation-bottom').evaluate(e=>e.getBoundingClientRect().left),82);await page.getByRole('button',{name:'Expand sidebar'}).click();}
  else{await page.getByRole('button',{name:'Open navigation'}).click();await page.locator('.studio-sidebar.is-open').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.studio-sidebar.is-open').count(),0);await page.getByRole('button',{name:'Open navigation'}).click();}
  await page.getByRole('navigation',{name:'Studio',exact:true}).getByRole('button',{name:'Connections',exact:true}).click();await page.getByRole('heading',{name:'Bring your story to Instagram.'}).waitFor();await page.keyboard.press('Escape');
  await page.goto(`${base}/preview/workspace`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Open account',exact:true}).click();await page.getByRole('heading',{name:'A space to create.'}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px`);
  console.log(`${width}px: matching sidebar, brand, topbar, responsive geometry, collapse, Connections and Account navigation passed`);await page.close();
 }
}finally{await browser.close();}
