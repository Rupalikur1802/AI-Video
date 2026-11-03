import 'server-only';
import path from 'node:path';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {renderMedia,selectComposition} from '@remotion/renderer';
import {createSandbox,addBundleToSandbox} from '@remotion/vercel';
import {Sandbox} from '@vercel/sandbox';
import {configureCloudinary} from './workspace';
import {AppError} from './errors';
import {loadVideoJob,setJobStage,videoJobs} from './video-jobs';
import type {GenericVideo} from '../core/composition';

export function mediaDetails(result:Record<string,unknown>){return {publicId:String(result.public_id),duration:Number(result.duration),width:Number(result.width),height:Number(result.height),hasAudio:!!result.audio};}
async function existingOutput(jobId:string){try{return mediaDetails(await configureCloudinary().api.resource(`sochitra/videos/${jobId}`,{resource_type:'video',type:'authenticated'}));}catch{return null;}}
export async function renderLocalVideo(jobId:string,video:GenericVideo){
 if(process.env.VERCEL)throw new AppError(503,'RENDER_UNAVAILABLE','Hosted video generation requires Vercel Sandbox.');
 await setJobStage(jobId,'Rendering video');const recovered=await existingOutput(jobId);if(recovered)return recovered;
 const dir=await mkdtemp(path.join(tmpdir(),'sochitra-render-'));
 try{
  const serveUrl=path.resolve('.video-bundle');await readFile(path.join(serveUrl,'index.html'));
  const inputProps={video},composition=await selectComposition({serveUrl,id:'Sochitra',inputProps});
  const output=path.join(dir,'video.mp4');
  await renderMedia({serveUrl,composition,inputProps,outputLocation:output,codec:'h264',concurrency:1,crf:23,timeoutInMilliseconds:60000});
  await setJobStage(jobId,'Preparing preview');
  const result=await configureCloudinary().uploader.upload(output,{resource_type:'video',type:'authenticated',public_id:`sochitra/videos/${jobId}`,overwrite:false});
  return mediaDetails(result);
 }catch(error){if(error instanceof AppError)throw error;throw new AppError(503,'RENDER_FAILED','We couldn’t render this video. Your script is saved. Try again.');}
 finally{if(path.dirname(path.resolve(dir))!==path.resolve(tmpdir())||!path.basename(dir).startsWith('sochitra-render-'))throw new AppError(503,'TEMP_DIRECTORY','The temporary render directory could not be verified.');await rm(dir,{recursive:true,force:true});}
}

// Runs inside the sandbox with a single-output upload signature, never account secrets.
const runner=String.raw`
import {readFile,writeFile,rename} from 'node:fs/promises';
import {selectComposition,renderMedia} from '@remotion/renderer';
const config=JSON.parse(await readFile('/vercel/sandbox/sochitra-config.json','utf8'));
const status=async(value)=>{await writeFile('/tmp/sochitra-status.tmp',JSON.stringify(value));await rename('/tmp/sochitra-status.tmp','/tmp/sochitra-status.json');};
try{
 await status({state:'rendering'});
 const serveUrl='/vercel/sandbox/remotion-bundle',inputProps={video:config.video};
 const composition=await selectComposition({serveUrl,id:'Sochitra',inputProps});
 await renderMedia({serveUrl,composition,inputProps,codec:'h264',concurrency:2,crf:23,outputLocation:'/tmp/sochitra.mp4'});
 await status({state:'uploading'});
 const form=new FormData();for(const [key,value]of Object.entries(config.upload.fields))form.set(key,String(value));
 form.set('file',new Blob([await readFile('/tmp/sochitra.mp4')],{type:'video/mp4'}),'video.mp4');
 const response=await fetch(config.upload.url,{method:'POST',body:form,signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw new Error('Upload failed');
 const result=await response.json();if(result.public_id!==config.upload.fields.public_id)throw new Error('Wrong output');
 await status({state:'ready',media:{publicId:result.public_id,duration:result.duration,width:result.width,height:result.height,hasAudio:!!result.audio}});
}catch{await status({state:'failed'});process.exitCode=1;}
`;
export async function startHostedRender(jobId:string,video:GenericVideo){
 await setJobStage(jobId,'Rendering video');const job=await loadVideoJob(jobId);if(job.sandboxId)return {sandboxId:job.sandboxId};
 const sandbox=await createSandbox({timeoutInMilliseconds:20*60*1000});
 // Persist the VM handle immediately so terminal failures can stop it.
 await videoJobs().updateOne({_id:job._id,state:'processing'},{$set:{sandboxId:sandbox.sandboxId,updatedAt:new Date()}});
 try{
  await addBundleToSandbox({sandbox,bundleDir:path.resolve('.video-bundle')});
  const fields={public_id:`sochitra/videos/${jobId}`,type:'authenticated',overwrite:false,timestamp:Math.floor(Date.now()/1000)};
  const cloud=configureCloudinary(),signature=cloud.utils.api_sign_request(fields,process.env.CLOUDINARY_API_SECRET!);
  const config={video,upload:{url:`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME!)}/video/upload`,fields:{...fields,api_key:process.env.CLOUDINARY_API_KEY,signature}}};
  await sandbox.writeFiles([{path:'/vercel/sandbox/sochitra-runner.mjs',content:Buffer.from(runner)},{path:'/vercel/sandbox/sochitra-config.json',content:Buffer.from(JSON.stringify(config))}]);
  const command=await sandbox.runCommand({cmd:'node',args:['/vercel/sandbox/sochitra-runner.mjs'],detached:true});
  await videoJobs().updateOne({_id:job._id},{$set:{sandboxCommandId:command.cmdId}});return {sandboxId:sandbox.sandboxId};
 }catch{await sandbox.stop().catch(()=>{});throw new AppError(503,'RENDER_FAILED','The hosted renderer could not start. Your script is saved.');}
}
export async function pollHostedRender(jobId:string){
 const job=await loadVideoJob(jobId);if(!job.sandboxId)throw new AppError(503,'RENDER_FAILED','The hosted render is unavailable.');
 try{
  const sandbox=await Sandbox.get({sandboxId:job.sandboxId}),bytes=await sandbox.readFileToBuffer({path:'/tmp/sochitra-status.json'});
  if(!bytes)return {state:'rendering' as const};
  const result=JSON.parse(bytes.toString('utf8')) as {state:'rendering'|'uploading'|'ready'|'failed';media?:ReturnType<typeof mediaDetails>};
  if(result.state==='failed')throw new AppError(503,'RENDER_FAILED','We couldn’t render this video. Your script is saved. Try again.');
  if(result.state==='uploading')await setJobStage(jobId,'Preparing preview');
  await videoJobs().updateOne({_id:job._id,state:'processing'},{$set:{updatedAt:new Date()}});
  return result;
 }catch(error){const recovered=await existingOutput(jobId);if(recovered)return {state:'ready' as const,media:recovered};if(error instanceof AppError)throw error;throw new AppError(503,'RENDER_FAILED','The hosted renderer stopped before finishing. Your script is saved.');}
}
export async function stopHostedRender(jobId:string){const job=await loadVideoJob(jobId);if(job.sandboxId)try{const sandbox=await Sandbox.get({sandboxId:job.sandboxId});await sandbox.stop();}catch{/* VM expiry also releases resources. */}}
