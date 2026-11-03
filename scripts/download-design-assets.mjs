import {mkdir, writeFile, readFile} from 'node:fs/promises';

const sources=JSON.parse(await readFile('Docs/stitch-assets.json','utf8'));
await mkdir('public/images',{recursive:true});
for(const [i,url] of sources.entries()){
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error(`Design asset ${i} unavailable: ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  await writeFile(`public/images/design-${i}.png`,bytes);
  console.log(`Saved design-${i}.png (${bytes.length} bytes)`);
}
