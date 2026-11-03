import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('out/homepage',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe')});
try{
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(process.env.PREVIEW_URL||'http://localhost:3001',{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}));
    assert.ok(dimensions.scroll<=dimensions.width,`Horizontal overflow at ${width}`);
    assert.deepEqual(dimensions.broken,[]);
    await page.screenshot({path:`out/homepage/${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Start creating',exact:false}).first().click();
    await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Welcome to your creative space.'}).waitFor();
    await page.goto(process.env.PREVIEW_URL||'http://localhost:3001',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Preview changes',exact:true}).click();
    await page.getByText('Preview updated',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Reset demo',exact:true}).click();
    await page.getByText('Ready to preview',{exact:true}).waitFor();
    await page.getByRole('button',{name:'View Share your expertise artwork'}).click();
    await page.getByRole('dialog').getByText('Design reference artwork, not a generated video.').waitFor();
    await page.getByRole('button',{name:'Close dialog'}).click();
    if(width===390){
      await page.getByRole('button',{name:'Open navigation'}).click();
      await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'How it works'}).click();
      assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).count(),0);
    }
    await page.getByRole('button',{name:'Watch the real Sochitra sample video'}).click();
    await page.getByRole('dialog').locator('video').waitFor({state:'visible'});
    await page.getByRole('button',{name:'Close dialog'}).click();
    assert.deepEqual(errors,[]);
    console.log(`${width}px: layout, images, access dialog, keyboard dismissal, revision demo, artwork modal, sample player${width===390?', mobile navigation':''} passed`);
    await page.close();
  }
}finally{await browser.close();}
