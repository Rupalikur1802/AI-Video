import {readFile,mkdir,writeFile} from 'node:fs/promises';
const assets=JSON.parse(await readFile('Docs/dashboard-assets.json','utf8'));
await mkdir('public/images',{recursive:true});
for(const {url,name} of assets){
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error(`Design image unavailable: ${response.status}`);
  await writeFile(`public/images/${name}`,Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}`);
}
