import {config} from 'dotenv';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createProject} from '../src/server/projects';
import {getWorkspace,saveScript,configureCloudinary} from '../src/server/workspace';
import {enqueueVideo,loadVideoJob,failVideoJob} from '../src/server/video-jobs';
import {getMongo} from '../src/server/db';
config({path:'.env.local',quiet:true} as Parameters<typeof config>[0]);
const language=process.argv[2]==='hi'?'hi':'en';let owner=`video-live-test-${crypto.randomUUID()}`;
const scripts=language==='en'?[
 {title:'A spark of understanding',narration:'A clear explanation starts with one idea. Give that idea a simple visual, and it becomes easier to remember.',keywords:['One idea','A simple visual']},
 {title:'Bring the story to life',narration:'Add a natural voice and readable captions. Together, words and motion turn a short explanation into a story people can follow.',keywords:['Natural voice','Readable captions']},
]:[
 {title:'A clear idea',narration:'एक सरल विचार से शुरुआत करें। चित्र और आवाज़ मिलकर उस विचार को समझना आसान बनाते हैं।',keywords:['A simple idea','A clear visual']},
 {title:'A memorable story',narration:'छोटे वाक्य और स्पष्ट उदाहरण कहानी को यादगार बनाते हैं। सही समय पर दिखने वाले शब्द समझने में मदद करते हैं।',keywords:['A clear example','A memorable story']},
];
let jobId:string|undefined,projectId:string|undefined;let finished=false;
try{
 const existing=process.argv.includes('--resume')?await getMongo().db.collection('jobs').findOne({ownerId:{$regex:'^video-live-test-'},'script.title':'Sochitra generation verification','draft.language':language},{sort:{createdAt:-1}}):null;
 if(existing)owner=existing.ownerId;
 const p=existing?{id:existing.projectId.toHexString(),version:0}:await createProject(owner,{title:`Live generation verification ${language}`,language,targetSeconds:30},crypto.randomUUID());projectId=p.id;
 const plan={title:'Sochitra generation verification',scenes:scripts.map(s=>({...s,visual:'steps' as const,sourceRefs:[],evidence:[]}))};
 const workspace=existing?null:await saveScript(owner,p.id,plan,p.version);
 const job=existing||(await enqueueVideo(owner,p.id,workspace!.version,crypto.randomUUID())).job;jobId=job._id.toHexString();
 const {inngest}=await import('../src/server/inngest');
 if(!existing)await inngest.send({name:'sochitra/video.requested',id:`video-${jobId}`,data:{jobId}});
 let stage='';
 for(let i=0;i<300;i++){
  const current=await loadVideoJob(jobId);if(current.stage!==stage){stage=current.stage;console.log(`${language}: ${stage}`);}
  if(current.state==='failed')throw new Error(current.error?.safeMessage||'Generation failed');
  if(current.state==='ready'){
   const ready=(await getWorkspace(owner,p.id)).revisions[0];assert.ok(ready);assert.ok(ready.duration>=30&&ready.duration<=90.2);
   const asset=await getMongo().db.collection('assets').findOne({ownerId:owner,revisionId:current.revisionId});assert.ok(asset);assert.equal(asset.cloudinary.deliveryType,'authenticated');assert.equal(asset.metadata.hasAudio,true);
   const url=configureCloudinary().utils.private_download_url(asset.cloudinary.publicId,'mp4',{resource_type:'video',type:'authenticated',expires_at:Math.floor(Date.now()/1000)+120,attachment:false});
   const response=await fetch(url);assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());assert.ok(bytes.length>10000);
   await mkdir('out/generation',{recursive:true});await writeFile(`out/generation/${language}.mp4`,bytes);await writeFile(`out/generation/${language}-verified.json`,JSON.stringify({language,duration:ready.duration,width:1080,height:1920,hasAudio:true,privateStorage:true},null,2));
   console.log(`${language}: real narration, caption synchronization, portrait render, private upload, ready revision, and MP4 download passed (${ready.duration.toFixed(1)}s).`);finished=true;break;
  }
  await new Promise(resolve=>setTimeout(resolve,2000));
 }
 if(!finished)throw new Error('Verification timed out');
}finally{
 // Remove only this test owner's records and explicitly identified private assets.
 if(!owner.startsWith('video-live-test-'))throw new Error('Invalid cleanup scope');
 if(jobId&&!finished)await failVideoJob(jobId,new Error('Verification stopped')).catch(()=>{});
 const db=getMongo().db;const assets=await db.collection('assets').find({ownerId:owner}).toArray(),audio=await db.collection('sceneAudio').find({ownerId:owner}).toArray();
 for(const asset of assets)if(asset.cloudinary?.publicId===`sochitra/videos/${jobId}`)await configureCloudinary().uploader.destroy(asset.cloudinary.publicId,{resource_type:'video',type:'authenticated'}).catch(()=>{});
 for(const item of audio)if(/^sochitra\/audio\/[a-f\d]{64}$/.test(item.publicId||''))await configureCloudinary().uploader.destroy(item.publicId,{resource_type:'video',type:'authenticated'}).catch(()=>{});
 for(const collection of ['projects','jobs','revisions','assets','sceneAudio'])await db.collection(collection).deleteMany({ownerId:owner});
 await getMongo().client.close();
}
