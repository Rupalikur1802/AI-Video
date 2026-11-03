import 'server-only';
import {createHash} from 'node:crypto';
import {ObjectId,type Document} from 'mongodb';
import {v2 as cloudinary} from 'cloudinary';
import {getMongo} from './db';
import {AppError} from './errors';
import {defaultDraft,type WorkspaceDraft,type WorkspaceView,type SourceView,type ScriptPlan,validateSourceReferences} from '../core/workspace';
import {extractDocument} from './documents';
import {generationUnavailableReason} from './generation-config';
import {renderIdentity} from '../core/generation';

export function projectId(id:string){if(!/^[a-f\d]{24}$/i.test(id))throw new AppError(404,'NOT_FOUND','Project not found.');return new ObjectId(id);}
export const projects=()=>getMongo().db.collection('projects');
export function narrativeHash(draft:WorkspaceDraft,sourceId?:unknown){return createHash('sha256').update(JSON.stringify({topic:draft.topic,mode:draft.mode,language:draft.language,audience:draft.audience,targetSeconds:draft.targetSeconds,focus:draft.focus,focusMode:draft.focusMode,sourceId:String(sourceId||'')})).digest('hex');}
export async function ownedProject(ownerId:string,id:string){const filter={_id:projectId(id),ownerId,deletedAt:{$exists:false}};let project=await projects().findOne(filter);if(!project)throw new AppError(404,'NOT_FOUND','Project not found.');if(project.scriptLock?.expiresAt<new Date()){await projects().updateOne({...filter,'scriptLock.id':project.scriptLock.id,'scriptLock.expiresAt':{$lt:new Date()}},{$unset:{scriptLock:''}});project=await projects().findOne(filter);if(!project)throw new AppError(404,'NOT_FOUND','Project not found.');}return project;}
function draftOf(project:Document):WorkspaceDraft{return {...defaultDraft,topic:project.brief?.topic||'',language:project.brief?.language||'en',audience:project.brief?.audience||'Beginners',targetSeconds:project.brief?.targetSeconds||60,...project.workspaceDraft};}
export async function getWorkspace(ownerId:string,id:string):Promise<WorkspaceView>{
  const project=await ownedProject(ownerId,id),draft=draftOf(project);
  let source:SourceView|null=null;
  if(project.sourceId){const record=await getMongo().db.collection('sources').findOne({_id:project.sourceId,ownerId,projectId:project._id});if(record)source={id:record._id.toHexString(),name:record.name,kind:record.kind,count:record.count,units:record.units,warnings:record.warnings};}
  const revisions=await getMongo().db.collection('revisions').find({ownerId,projectId:project._id,status:'ready'}).sort({createdAt:-1}).limit(10).toArray();
  let activeJob;let lastJob;
  if(project.activeJobId){const job=await getMongo().db.collection('jobs').findOne({_id:project.activeJobId,ownerId});if(job)activeJob={id:job._id.toHexString(),state:job.state,stage:job.stage||'Queued',error:job.error?.safeMessage};}
  if(project.lastJobId){const job=await getMongo().db.collection('jobs').findOne({_id:project.lastJobId,ownerId,projectId:project._id});if(job)lastJob={id:job._id.toHexString(),state:job.state,stage:job.stage,error:job.error?.safeMessage,number:job.number};}
  const unavailable=generationUnavailableReason();const currentHash=project.workspaceScript?createHash('sha256').update(renderIdentity(project.workspaceScript,draft)).digest('hex'):null;
  return {id,title:project.title,version:project.version,draft,source,script:project.workspaceScript||null,scriptStale:!!project.workspaceScript&&project.scriptContextHash!==narrativeHash(draft,project.sourceId),revisions:revisions.map(r=>({id:r._id.toHexString(),createdAt:r.createdAt.toISOString(),duration:r.duration,script:r.script,assetId:r.assetId.toHexString(),number:r.number||1,language:r.settings?.language||draft.language,style:r.settings?.style||draft.style,captions:r.settings?.captions??true,inputHash:r.inputHash})),activeJob,lastJob,generationAvailable:!unavailable,generationUnavailableReason:unavailable,renderStale:!!revisions.length&&revisions[0].inputHash!==currentHash};
}
export async function saveWorkspace(ownerId:string,id:string,draft:WorkspaceDraft,expectedVersion:number){
  const result=await projects().updateOne({_id:projectId(id),ownerId,version:expectedVersion,deletedAt:{$exists:false},activeJobId:{$exists:false},scriptLock:{$exists:false}},{$set:{workspaceDraft:draft,brief:{topic:draft.topic.slice(0,500),notes:draft.topic.slice(500),language:draft.language,audience:draft.audience,targetSeconds:draft.targetSeconds},updatedAt:new Date()},$inc:{version:1}});
  if(!result.matchedCount)throw new AppError(409,'STALE_VERSION','This project changed or is processing. Reload before saving; your edits remain on this page.');
  return getWorkspace(ownerId,id);
}
export function configureCloudinary(){
  for(const key of ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'])if(!process.env[key])throw new AppError(503,'STORAGE_UNAVAILABLE','Media storage is not configured.');
  cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});return cloudinary;
}
export async function uploadPrivate(bytes:Buffer,publicId:string,resourceType:'raw'|'video'){
  const cloud=configureCloudinary();
  return new Promise<import('cloudinary').UploadApiResponse>((resolve,reject)=>{const stream=cloud.uploader.upload_stream({resource_type:resourceType,type:'authenticated',public_id:publicId,overwrite:false},(error,result)=>error||!result?reject(new AppError(503,'STORAGE_UNAVAILABLE','The private upload could not be completed.')):resolve(result));stream.end(bytes);});
}
export async function attachSource(ownerId:string,id:string,name:string,bytes:Buffer,expectedVersion:number){
  const project=await ownedProject(ownerId,id);if(project.version!==expectedVersion||project.activeJobId||project.scriptLock)throw new AppError(409,'STALE_VERSION','Save or reload the project before uploading.');
  const parsed=await extractDocument(name,bytes),sourceId=new ObjectId();
  const uploaded=await uploadPrivate(bytes,`sochitra/sources/${sourceId.toHexString()}`,'raw');
  const record={_id:sourceId,ownerId,projectId:project._id,name:name.slice(0,180),...parsed,bytes:bytes.length,publicId:uploaded.public_id,createdAt:new Date(),schemaVersion:1};
  const {client,db}=getMongo();
  const session=client.startSession();
  try{await session.withTransaction(async()=>{
    const updated=await projects().updateOne({_id:project._id,ownerId,version:expectedVersion,activeJobId:{$exists:false},scriptLock:{$exists:false},deletedAt:{$exists:false}},{$set:{sourceId,updatedAt:new Date()},$inc:{version:1}},{session});
    if(!updated.matchedCount)throw new AppError(409,'STALE_VERSION','The project changed while uploading. Please reload and try again.');
    await db.collection('sources').insertOne(record,{session});
  });}catch(error){await configureCloudinary().uploader.destroy(uploaded.public_id,{resource_type:'raw',type:'authenticated'}).catch(()=>{});throw error;}finally{await session.endSession();}
  return getWorkspace(ownerId,id);
}
export async function removeSource(ownerId:string,id:string,expectedVersion:number){
  const result=await projects().updateOne({_id:projectId(id),ownerId,version:expectedVersion,activeJobId:{$exists:false},scriptLock:{$exists:false},deletedAt:{$exists:false}},{$unset:{sourceId:''},$set:{updatedAt:new Date()},$inc:{version:1}});
  if(!result.matchedCount)throw new AppError(409,'STALE_VERSION','Reload the project before removing its source.');
  // Old private sources remain available to revision history; no public delivery URL is issued.
  return getWorkspace(ownerId,id);
}
export async function saveScript(ownerId:string,id:string,plan:ScriptPlan,expectedVersion:number,lockId?:string){
  const workspace=await getWorkspace(ownerId,id),project=await ownedProject(ownerId,id);
  if(workspace.draft.mode==='upload'&&!workspace.source)throw new AppError(400,'SOURCE_REQUIRED','Upload readable material before saving a source-based script.');
  if(workspace.scriptStale&&!lockId)throw new AppError(409,'SCRIPT_STALE','Regenerate the script after changing its source, topic, or narration language.');
  try{validateSourceReferences(plan,workspace.draft.mode==='upload'?workspace.source?.units||[]:[]);}catch{throw new AppError(422,'INVALID_REFERENCES','Script references must match the uploaded source.');}
  const filter:Document={_id:project._id,ownerId,version:expectedVersion,activeJobId:{$exists:false},deletedAt:{$exists:false}};
  filter[lockId?'scriptLock.id':'scriptLock']=lockId||{$exists:false};
  const result=await projects().updateOne(filter,{$set:{workspaceScript:plan,scriptContextHash:narrativeHash(workspace.draft,project.sourceId),updatedAt:new Date()},$unset:{scriptLock:''},$inc:{version:1}});
  if(!result.matchedCount)throw new AppError(409,'STALE_VERSION','The script is based on an older version. Reload before applying it.');
  return getWorkspace(ownerId,id);
}
