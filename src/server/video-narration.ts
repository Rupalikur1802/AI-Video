import 'server-only';
import {createHash} from 'node:crypto';
import {getMongo} from './db';
import {AppError} from './errors';
import {configureCloudinary,uploadPrivate} from './workspace';
import {loadVideoJob,setJobStage} from './video-jobs';
import {captionsFromAlignment} from '../core/timing';
import type {Alignment} from '../core/model';
import type {GenericVideo} from '../core/composition';

export function voiceConfiguration(language:'en'|'hi'){
 return {voiceId:process.env[`ELEVENLABS_VOICE_ID_${language.toUpperCase()}`]||'EXAVITQu4vr4xnSDxMaL',model:process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2',language,stability:.65,similarity_boost:.75};
}
export function sceneAudioHash(ownerId:string,text:string,language:'en'|'hi'){return createHash('sha256').update(JSON.stringify({ownerId,text,...voiceConfiguration(language),timing:'v1'})).digest('hex');}
export async function narrateScene(jobId:string,index:number){
 const job=await loadVideoJob(jobId);await setJobStage(jobId,'Preparing narration');
 const scene=job.script.scenes[index];if(!scene)throw new AppError(400,'INVALID_SCENE','The script scene is missing.');
 const voice=voiceConfiguration(job.draft.language),hash=sceneAudioHash(job.ownerId,scene.narration,job.draft.language),cache=getMongo().db.collection('sceneAudio');
 const old=await cache.findOne({_id:hash as never,ownerId:job.ownerId});if(old?.status==='ready')return {hash};
 if(old?.status==='pending'&&old.alignment&&old.captions&&old.publicId){
  try{const recovered=await configureCloudinary().api.resource(old.publicId,{resource_type:'video',type:'authenticated'});if(Number(recovered.duration)>0){await cache.updateOne({_id:hash as never},{$set:{status:'ready',duration:Number(recovered.duration),updatedAt:new Date()}});return {hash};}}catch{/* No completed upload to recover. */}
 }
 if(old?.status==='pending'){
  const previous=await getMongo().db.collection('jobs').findOne({_id:old.jobId});
  if(old.jobId.equals(job._id)||previous&&['queued','processing'].includes(previous.state))throw new AppError(409,'NARRATION_INTERRUPTED','A narration request was interrupted or is still running. Try again after the current attempt finishes.');
 }
 if(!process.env.ELEVENLABS_API_KEY||process.env.ELEVENLABS_USE_CONFIRMED!=='true')throw new AppError(503,'NARRATION_UNAVAILABLE','Narration is not configured. Your script is saved.');
 try{const claim=await cache.updateOne({_id:hash as never,...(old?{status:old.status,jobId:old.jobId}: {status:{$exists:false}})},{$set:{ownerId:job.ownerId,jobId:job._id,status:'pending',updatedAt:new Date()}},{upsert:!old});if(!claim.matchedCount&&!claim.upsertedCount)throw new Error();}catch{throw new AppError(409,'NARRATION_BUSY','This narration is already being prepared. Please try again shortly.');}
 let response:Response;
 try{response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.voiceId)}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':process.env.ELEVENLABS_API_KEY},body:JSON.stringify({text:scene.narration,model_id:voice.model,language_code:voice.language,voice_settings:{stability:voice.stability,similarity_boost:voice.similarity_boost}}),signal:AbortSignal.timeout(50000)});}catch{throw new AppError(503,'NARRATION_TIMEOUT','The narration request timed out. Your script is saved. Try again when the service is available.');}
 if(!response.ok)throw new AppError(503,'NARRATION_UNAVAILABLE',response.status===429?'The narration service has reached its current allowance. Your script is saved. Try again later.':'The narration service is unavailable. Your script is saved. Try again later.');
 const data=await response.json();const alignment=(data.normalized_alignment||data.alignment) as Alignment;
 let captions;try{captions=captionsFromAlignment(alignment);}catch{throw new AppError(422,'INVALID_TIMING','The voice service returned invalid caption timing. Your script is saved.');}
 if(typeof data.audio_base64!=='string'||!data.audio_base64.length||data.audio_base64.length>16*1024*1024)throw new AppError(422,'INVALID_AUDIO','The narration could not be prepared.');
 const publicId=`sochitra/audio/${hash}`;
 await cache.updateOne({_id:hash as never,jobId:job._id},{$set:{alignment,captions,publicId,voice,updatedAt:new Date()}});
 // Recover an upload completed just before a process interruption; never overwrite immutable audio.
 const cloud=configureCloudinary();let uploaded;
 try{uploaded=await cloud.api.resource(publicId,{resource_type:'video',type:'authenticated'});}catch{uploaded=await uploadPrivate(Buffer.from(data.audio_base64,'base64'),publicId,'video');}
 const duration=Number(uploaded.duration),end=alignment.character_end_times_seconds.at(-1)||0;
 if(!Number.isFinite(duration)||duration<=0||duration>90||end>duration+.25)throw new AppError(422,'INVALID_AUDIO','Narration timing is invalid or too long. Shorten the script and try again.');
 await cache.updateOne({_id:hash as never,jobId:job._id},{$set:{status:'ready',publicId,duration,captions,alignment,voice,updatedAt:new Date()}});
 return {hash};
}
export async function assembleVideo(jobId:string):Promise<GenericVideo>{
 const job=await loadVideoJob(jobId);await setJobStage(jobId,'Synchronizing captions');
 const video:GenericVideo={title:job.script.title,fps:30,durationInFrames:0,style:job.draft.style,captions:job.draft.captions,scenes:[]};
 for(const scene of job.script.scenes){
  const hash=sceneAudioHash(job.ownerId,scene.narration,job.draft.language),audio=await getMongo().db.collection('sceneAudio').findOne({_id:hash as never,ownerId:job.ownerId,status:'ready'});if(!audio)throw new AppError(409,'AUDIO_MISSING','A narration segment is missing. Retry generation.');
  const durationInFrames=Math.ceil((audio.duration+.15)*30),alignment=audio.alignment as Alignment;
  const text=alignment.characters.join('');const keywordFrames=scene.keywords.map((word,index)=>{const offset=text.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());if(offset<0)return Math.round((audio.duration*.8*index/scene.keywords.length)*30);let count=0;for(let i=0;i<alignment.characters.length;i++){if(count>=offset)return Math.round(alignment.character_start_times_seconds[i]*30);count+=alignment.characters[i].length;}return 0;});
  const audioUrl=configureCloudinary().utils.private_download_url(audio.publicId,'mp3',{resource_type:'video',type:'authenticated',expires_at:Math.floor(Date.now()/1000)+7200,attachment:false});
  video.scenes.push({...scene,audioUrl,durationInFrames,startFrame:video.durationInFrames,captions:audio.captions,keywordFrames});video.durationInFrames+=durationInFrames;
 }
 if(video.durationInFrames>2700)throw new AppError(422,'NARRATION_TOO_LONG','Your narration exceeds 90 seconds. Shorten the script before trying again.');
 if(video.durationInFrames<900){video.scenes.at(-1)!.durationInFrames+=900-video.durationInFrames;video.durationInFrames=900;}
 await setJobStage(jobId,'Animating scenes');return video;
}
