import 'server-only';
import {createHash} from 'node:crypto';
import {ObjectId,type Document} from 'mongodb';
import {getMongo} from './db';
import {AppError} from './errors';
import {getWorkspace,narrativeHash,ownedProject,projects,projectId} from './workspace';
import {draftSchema,scriptSchema,validateSourceReferences,type WorkspaceDraft,type ScriptPlan} from '../core/workspace';
import {renderIdentity,type GenerationStage} from '../core/generation';
import {generationUnavailableReason} from './generation-config';

export type VideoJob=Document&{_id:ObjectId;ownerId:string;projectId:ObjectId;revisionId:ObjectId;number:number;script:ScriptPlan;draft:WorkspaceDraft;inputHash:string;sourceId?:ObjectId;state:'queued'|'processing'|'ready'|'failed';stage:string};
export const videoJobs=()=>getMongo().db.collection<VideoJob>('jobs');
export const renderHash=(script:ScriptPlan,draft:WorkspaceDraft)=>createHash('sha256').update(renderIdentity(script,draft)).digest('hex');
export async function loadVideoJob(id:string){const job=await videoJobs().findOne({_id:projectId(id)});if(!job)throw new AppError(404,'NOT_FOUND','Video job not found.');return job;}
export async function enqueueVideo(ownerId:string,id:string,expectedVersion:number,requestKey:string){
 if(!/^[\w-]{8,100}$/.test(requestKey))throw new AppError(400,'INVALID_REQUEST_KEY','A request identifier is required.');
 const old=await videoJobs().findOne({ownerId,projectId:projectId(id),requestKey});if(old){if(old.expectedVersion!==expectedVersion)throw new AppError(409,'IDEMPOTENCY_CONFLICT','This request identifier was already used for another version.');return {job:old,created:false};}
 const reason=generationUnavailableReason();if(reason)throw new AppError(503,'GENERATION_UNAVAILABLE',reason);
 const project=await ownedProject(ownerId,id),workspace=await getWorkspace(ownerId,id);
 if(project.version!==expectedVersion)throw new AppError(409,'STALE_VERSION','This project changed. Reload before creating a video.');
 if(!workspace.script||workspace.scriptStale||project.scriptContextHash!==narrativeHash(workspace.draft,project.sourceId))throw new AppError(409,'SCRIPT_STALE','Review an up-to-date script before creating your video.');
 const script=scriptSchema.parse(workspace.script),draft=draftSchema.parse(workspace.draft);
 const transcript=script.scenes.map(s=>s.narration).join(' ');
 if(transcript.trim().split(/\s+/u).length>220||transcript.length>2400)throw new AppError(422,'SCRIPT_TOO_LONG','This script is too long for a 90-second video. Shorten the narration before generating.');
 if(draft.mode==='upload'&&!workspace.source)throw new AppError(400,'SOURCE_REQUIRED','The source material is missing.');
 try{validateSourceReferences(script,draft.mode==='upload'?workspace.source!.units:[]);}catch{throw new AppError(422,'INVALID_REFERENCES','Review the script source references before rendering.');}
 const job:VideoJob={_id:new ObjectId(),ownerId,projectId:project._id,revisionId:new ObjectId(),requestKey,expectedVersion,number:(project.renderNumber||0)+1,script,draft,inputHash:renderHash(script,draft),sourceId:project.sourceId,state:'queued',stage:'Preparing narration',createdAt:new Date(),updatedAt:new Date(),schemaVersion:1};
 const session=getMongo().client.startSession();
 try{await session.withTransaction(async()=>{
  const result=await projects().updateOne({_id:project._id,ownerId,version:expectedVersion,activeJobId:{$exists:false},scriptLock:{$exists:false},deletedAt:{$exists:false}},{$set:{activeJobId:job._id,lastJobId:job._id,renderNumber:job.number,state:project.currentReadyRevisionId?'updating':'processing',stage:job.stage,updatedAt:new Date()},$inc:{version:1}},{session});
  if(!result.matchedCount)throw new AppError(409,'PROJECT_BUSY','A video or script change is already processing.');
  await videoJobs().insertOne(job,{session});
 });}finally{await session.endSession();}
 return {job,created:true};
}
export async function setJobStage(id:string,stage:GenerationStage){
 const job=await loadVideoJob(id);const result=await videoJobs().updateOne({_id:job._id,state:{$in:['queued','processing']}},{$set:{state:'processing',stage,updatedAt:new Date()}});
 if(!result.matchedCount)throw new AppError(409,'JOB_FINISHED','This video job is no longer running.');
 await projects().updateOne({_id:job.projectId,ownerId:job.ownerId,activeJobId:job._id},{$set:{stage,updatedAt:new Date()}});
}
export async function failVideoJob(id:string,error:unknown,onlyQueued=false){
 const job=await loadVideoJob(id);const safeMessage=error instanceof AppError?error.message:'We couldn’t finish this video. Your script is saved. Try again.';
 const session=getMongo().client.startSession();try{await session.withTransaction(async()=>{
  const result=await videoJobs().updateOne({_id:job._id,state:onlyQueued?'queued':{$in:['queued','processing']}},{$set:{state:'failed',error:{code:error instanceof AppError?error.code:'VIDEO_FAILED',safeMessage},updatedAt:new Date()}},{session});
  const project=await projects().findOne({_id:job.projectId,ownerId:job.ownerId},{session});
  if(result.matchedCount)await projects().updateOne({_id:job.projectId,ownerId:job.ownerId,activeJobId:job._id},{$set:{state:project?.currentReadyRevisionId?'ready':'failed',error:safeMessage,updatedAt:new Date()},$unset:{activeJobId:'',stage:''},$inc:{version:1}},{session});
 });}finally{await session.endSession();}
 // A previous video stays ready, even if its replacement fails.
 await projects().updateOne({_id:job.projectId,ownerId:job.ownerId,lastJobId:job._id,state:'failed',currentReadyRevisionId:{$exists:true}},{$set:{state:'ready'}});
}
export async function completeVideoJob(id:string,media:{publicId:string;duration:number;width:number;height:number;hasAudio:boolean}){
 const job=await loadVideoJob(id);if(job.state==='ready')return;
 if(!media.hasAudio||media.duration<29.9||media.duration>90.2||media.width!==1080||media.height!==1920)throw new AppError(422,'INVALID_VIDEO','The rendered video did not pass playback checks. Your script is saved.');
 const assetId=new ObjectId(),now=new Date(),session=getMongo().client.startSession();const db=getMongo().db;
 try{await session.withTransaction(async()=>{
  const result=await projects().updateOne({_id:job.projectId,ownerId:job.ownerId,activeJobId:job._id,deletedAt:{$exists:false}},{$set:{currentReadyRevisionId:job.revisionId,state:'ready',durationSeconds:media.duration,updatedAt:now},$unset:{activeJobId:'',stage:'',error:''},$inc:{version:1}},{session});if(!result.matchedCount)throw new AppError(409,'JOB_FINISHED','This render is no longer active.');
  await db.collection('assets').insertOne({_id:assetId,ownerId:job.ownerId,projectId:job.projectId,revisionId:job.revisionId,kind:'video',status:'ready',cloudinary:{publicId:media.publicId,resourceType:'video',deliveryType:'authenticated'},metadata:media,createdAt:now,updatedAt:now,schemaVersion:1},{session});
  await db.collection('revisions').insertOne({_id:job.revisionId,ownerId:job.ownerId,projectId:job.projectId,assetId,number:job.number,script:job.script,settings:job.draft,inputHash:job.inputHash,sourceId:job.sourceId,duration:media.duration,status:'ready',createdAt:now,schemaVersion:1},{session});
  await videoJobs().updateOne({_id:job._id,state:{$in:['queued','processing']}},{$set:{state:'ready',stage:'Preparing preview',assetId,updatedAt:now}},{session});
 });}finally{await session.endSession();}
}
