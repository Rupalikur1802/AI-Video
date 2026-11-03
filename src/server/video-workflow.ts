import 'server-only';
import {inngest} from './inngest';
import {AppError} from './errors';
import {loadVideoJob,failVideoJob,completeVideoJob,videoJobs} from './video-jobs';
import {assembleVideo,narrateScene} from './video-narration';
import {renderLocalVideo,startHostedRender,pollHostedRender,stopHostedRender} from './video-renderer';

async function guarded<T>(id:string,action:()=>Promise<T>){try{return await action();}catch(error){await failVideoJob(id,error);throw error;}}

export const generateVideoWorkflow=inngest.createFunction({id:'generate-video',triggers:[{event:'sochitra/video.requested'}],retries:0,concurrency:{limit:1},onFailure:async({event})=>{
 const id=event.data.event.data.jobId;if(typeof id==='string'&&/^[a-f\d]{24}$/i.test(id)){await failVideoJob(id,new AppError(503,'VIDEO_INTERRUPTED','The video job was interrupted. Your script is saved. Try again.'));await stopHostedRender(id);}
}},async({event,step})=>{
 const id=event.data.jobId;if(typeof id!=='string'||!/^[a-f\d]{24}$/i.test(id))return {ignored:true};
 const started=await step.run('load-job',async()=>{const job=await loadVideoJob(id);return {count:job.script.scenes.length,skip:['failed','ready'].includes(job.state)};});if(started.skip)return {ignored:true};
 try{
  for(let i=0;i<started.count;i++)await step.run(`narration-${i}`,()=>guarded(id,()=>narrateScene(id,i)));
  const video=await step.run('synchronize-scenes',()=>guarded(id,()=>assembleVideo(id)));
  if(process.env.VERCEL){
   await step.run('start-sandbox',()=>guarded(id,()=>startHostedRender(id,video)));
   let complete=false;
   for(let attempt=0;attempt<120;attempt++){
    const result=await step.run(`render-status-${attempt}`,()=>guarded(id,()=>pollHostedRender(id)));
    if(result.state==='ready'&&result.media){await step.run('save-ready-version',()=>completeVideoJob(id,result.media!));complete=true;break;}
    await step.sleep(`wait-render-${attempt}`,'10s');
   }
   if(!complete)throw new AppError(503,'RENDER_TIMEOUT','Rendering took too long. Your script is saved. Try again.');
   await step.run('stop-sandbox',()=>stopHostedRender(id));
  }else{
   const media=await step.run('render-local',()=>guarded(id,()=>renderLocalVideo(id,video)));
   await step.run('save-ready-version',()=>completeVideoJob(id,media));
  }
  return {ready:true};
 }catch(error){
  await step.run('record-failure',()=>failVideoJob(id,error));
  await step.run('release-renderer',()=>stopHostedRender(id));
  return {failed:true};
 }
});

export const recoverStalledVideos=inngest.createFunction({id:'recover-stalled-videos',triggers:[{cron:'*/5 * * * *'}],retries:0},async({step})=>{
 const stale=await step.run('find-stalled',async()=>{const rows=await videoJobs().find({state:{$in:['queued','processing']},updatedAt:{$lt:new Date(Date.now()-30*60*1000)}}).limit(50).toArray();return rows.map(j=>j._id.toHexString());});
 for(const id of stale)await step.run(`release-${id}`,async()=>{await failVideoJob(id,new AppError(503,'VIDEO_INTERRUPTED','Generation was interrupted. Your script is saved. Try again.'));await stopHostedRender(id);});
 return {recovered:stale.length};
});
