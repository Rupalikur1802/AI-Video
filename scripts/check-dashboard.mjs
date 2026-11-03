import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base=process.env.PREVIEW_URL||'http://localhost:3001';
await mkdir('out/dashboard',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe')});
try{
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/login`,{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Welcome to your creative space.'}).waitFor();
    await page.screenshot({path:`out/dashboard/login-${width}.png`,fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
    await page.goto(`${base}/dashboard`,{waitUntil:'networkidle'});
    assert.ok(new URL(page.url()).pathname==='/login','Real dashboard must reject anonymous access');
    const api=await page.request.get(`${base}/api/projects`);
    assert.ok([401,403,503].includes(api.status()),'Project API must not expose sample or private data without a session');
    const wrongOrigin=await page.request.post(`${base}/api/projects`,{headers:{origin:'https://attacker.invalid'},data:{title:'not-created'}});
    assert.equal(wrongOrigin.status(),403);
    await page.goto(`${base}/preview/dashboard`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('.project-card').count(),6);
    await page.getByRole('button',{name:'Upload material',exact:true}).click();
    await page.getByRole('heading',{name:'Every video starts with a spark.'}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Upload material',exact:true}).getAttribute('aria-pressed'),'true');
    await page.goto(`${base}/preview/dashboard`,{waitUntil:'networkidle'});

    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,`Overflow at ${width}`);
    assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)),[]);
    await page.screenshot({path:`out/dashboard/projects-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Drafts 1',exact:true}).click();
    assert.equal(await page.locator('.project-card').count(),1);
    await page.getByRole('button',{name:'All 6',exact:true}).click();
    await page.getByLabel('Sort projects',{exact:true}).selectOption('title');
    const sortedTitles=await page.locator('.project-card h3').allTextContents();
    assert.deepEqual(sortedTitles,[...sortedTitles].sort((a,b)=>a.localeCompare(b)));
    await page.getByLabel('Sort projects',{exact:true}).selectOption('recent');
    await page.getByRole('textbox',{name:'Search projects',exact:true}).fill('not-a-project');
    await page.getByRole('heading',{name:'No projects found.'}).waitFor();
    await page.getByRole('button',{name:'Clear search and filters'}).click();
    await page.getByRole('button',{name:'List view'}).click();
    assert.equal(await page.locator('.project-list').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
    await page.getByRole('button',{name:'Grid view'}).click();
    await page.getByRole('button',{name:'Create video',exact:true}).last().click();
    await page.getByLabel('Project title',{exact:true}).fill('Browser test draft');
    await page.getByRole('button',{name:'Create draft',exact:true}).click();
    await page.getByRole('heading',{name:'Every video starts with a spark.'}).waitFor();
    await page.locator('.workspace-breadcrumb').getByText('Browser test draft',{exact:true}).waitFor();
    await page.goto(`${base}/preview/dashboard`,{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Actions for Photosynthesis & Chloroplasts',exact:true}).click();
    await page.getByRole('menuitem',{name:'Rename',exact:true}).click();
    await page.getByLabel('Project title',{exact:true}).fill('Renamed preview draft');
    await page.getByRole('button',{name:'Save title',exact:true}).click();
    await page.getByRole('heading',{name:'Renamed preview draft',exact:true}).waitFor();
    await page.getByRole('button',{name:'Actions for Renamed preview draft',exact:true}).click();
    await page.getByRole('menuitem',{name:'Duplicate as draft'}).click();
    await page.getByRole('heading',{name:'Renamed preview draft (copy)',exact:true}).waitFor();
    await page.getByRole('button',{name:'Actions for Renamed preview draft (copy)',exact:true}).click();
    await page.getByRole('menuitem',{name:'Delete',exact:true}).click();
    await page.getByRole('button',{name:'Delete project',exact:true}).click();
    assert.equal(await page.getByRole('heading',{name:'Renamed preview draft (copy)',exact:true}).count(),0);
    await page.getByRole('button',{name:'Empty state',exact:true}).click();
    await page.getByRole('heading',{name:'Your first story starts here.'}).waitFor();
    await page.screenshot({path:`out/dashboard/empty-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Load error',exact:true}).click();
    await page.getByRole('button',{name:'Try again',exact:true}).click();
    await page.getByRole('button',{name:'Loading',exact:true}).click();
    assert.equal(await page.locator('.project-skeleton').count(),6);
    await page.getByRole('button',{name:'Active projects',exact:true}).click();
    if(width===390){await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('navigation',{name:'Studio',exact:true}).getByRole('button',{name:'Connections',exact:true}).click();await page.getByRole('heading',{name:'Bring your story to Instagram.'}).waitFor();await page.keyboard.press('Escape');}
    assert.deepEqual(errors,[]);
    console.log(`${width}px: login, protected access, project filters/search, view modes, create/rename/duplicate/delete preview, empty/loading/error states${width===390?', mobile navigation':''} passed`);
    await page.close();
  }
}finally{await browser.close();}
