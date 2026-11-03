import {config} from 'dotenv';
import assert from 'node:assert/strict';
import {createProject,listProjects} from '../src/server/projects';
import {getWorkspace,saveScript,saveWorkspace} from '../src/server/workspace';
import {enqueueVideo,completeVideoJob,failVideoJob,loadVideoJob} from '../src/server/video-jobs';
import {getMongo} from '../src/server/db';
import {AppError} from '../src/server/errors';
import {renderIdentity} from '../src/core/generation';
import {sceneAudioHash,narrateScene} from '../src/server/video-narration';
config({path:'.env.local',quiet:true} as Parameters<typeof config>[0]);
const database=`sochitra_generation_test_${Date.now()}`;process.env.MONGODB_DB=database;process.env.INNGEST_DEV='1';process.env.ELEVENLABS_USE_CONFIRMED='true';
// Configuration-only values: this check makes no provider requests.
for(const key of ['ELEVENLABS_API_KEY','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'])process.env[key]||='test-only';
const owner='generation-test-owner';const scene={title:'Evaporation',narration:'The sun warms water. Water becomes vapor.',keywords:['Sun','Water'],visual:'steps' as const,sourceRefs:[],evidence:[]};
const plan={title:'The water cycle',scenes:[scene,{...scene,title:'Rain',narration:'Vapor cools into clouds. Rain returns water to the ground.'}]};
try{
 const project=await createProject(owner,{title:'Generation contract check'},crypto.randomUUID());
 await assert.rejects(getWorkspace('other-owner',project.id),e=>e instanceof AppError&&e.status===404);
 await assert.rejects(enqueueVideo(owner,project.id,1,crypto.randomUUID()),e=>e instanceof AppError&&e.code==='SCRIPT_STALE');
 let ws=await saveScript(owner,project.id,plan,1);
 const identity=renderIdentity(plan,ws.draft);assert.notEqual(identity,renderIdentity(plan,{...ws.draft,captions:false}));
 const requestKey=crypto.randomUUID(),queued=await enqueueVideo(owner,project.id,ws.version,requestKey);
 assert.equal(queued.created,true);assert.equal((await enqueueVideo(owner,project.id,ws.version,requestKey)).created,false);
 const audioHash=sceneAudioHash(owner,scene.narration,'en');
 assert.notEqual(audioHash,sceneAudioHash('another-owner',scene.narration,'en'));
 assert.notEqual(audioHash,sceneAudioHash(owner,scene.narration,'hi'));
 await getMongo().db.collection('sceneAudio').insertOne({_id:audioHash as never,ownerId:owner,status:'ready',publicId:'sochitra/test/audio',duration:5,captions:[]});
 const realFetch=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('Cached audio must not request narration again.');};
 try{assert.deepEqual(await narrateScene(queued.job._id.toHexString(),0),{hash:audioHash});}finally{globalThis.fetch=realFetch;}
 await assert.rejects(saveWorkspace(owner,project.id,ws.draft,ws.version),AppError);
 await assert.rejects(enqueueVideo(owner,project.id,ws.version,crypto.randomUUID()),AppError);
 await completeVideoJob(queued.job._id.toHexString(),{publicId:'sochitra/test/fixture',duration:30,width:1080,height:1920,hasAudio:true});
 ws=await getWorkspace(owner,project.id);assert.equal(ws.revisions.length,1);assert.equal(ws.renderStale,false);assert.equal(ws.activeJob,undefined);
 const oldRevision=ws.revisions[0].id;const originalSnapshot=JSON.stringify((await loadVideoJob(queued.job._id.toHexString())).script);
 ws=await saveScript(owner,project.id,{...plan,title:'A revised script'},ws.version);assert.equal(ws.renderStale,true);
 const next=await enqueueVideo(owner,project.id,ws.version,crypto.randomUUID());assert.equal((await listProjects(owner))[0].state,'updating');
 await failVideoJob(next.job._id.toHexString(),new AppError(503,'NARRATION_UNAVAILABLE','Narration is temporarily unavailable.'));
 ws=await getWorkspace(owner,project.id);assert.equal(ws.revisions[0].id,oldRevision);assert.equal(ws.lastJob?.state,'failed');assert.equal((await listProjects(owner))[0].state,'ready');assert.equal(ws.activeJob,undefined);
 assert.equal(JSON.stringify((await loadVideoJob(queued.job._id.toHexString())).script),originalSnapshot);
 ws=await saveWorkspace(owner,project.id,{...ws.draft,language:'hi'},ws.version);assert.equal(ws.scriptStale,true);
 await assert.rejects(enqueueVideo(owner,project.id,ws.version,crypto.randomUUID()),e=>e instanceof AppError&&e.code==='SCRIPT_STALE');
 const longProject=await createProject(owner,{title:'Long script check'},crypto.randomUUID());
 const long=await saveScript(owner,longProject.id,{...plan,scenes:[{...scene,narration:'word '.repeat(221)},scene]},longProject.version);
 await assert.rejects(enqueueVideo(owner,longProject.id,long.version,crypto.randomUUID()),e=>e instanceof AppError&&e.code==='SCRIPT_TOO_LONG');
 console.log('Video jobs: ownership, stale script rejection, idempotency, duplicate prevention, immutable snapshots, ready revision, failed replacement preservation, and language invalidation passed. No provider calls made.');
}finally{
 if(!database.startsWith('sochitra_generation_test_'))throw new Error('Invalid test database');
 await getMongo().db.dropDatabase();await getMongo().client.close();
}
