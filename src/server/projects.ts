import 'server-only';
import {createHash} from 'node:crypto';
import {ObjectId, MongoServerError} from 'mongodb';
import {getMongo} from './db';
import {AppError} from './errors';
import {createProjectSchema, type ProjectView} from '../core/projects';
import {defaultDraft,type WorkspaceDraft} from '../core/workspace';

type ProjectRecord={_id:ObjectId;ownerId:string;title:string;brief:{topic:string;notes:string;language:'en'|'hi';audience:string;targetSeconds:30|60|90};workspaceDraft?:WorkspaceDraft;stage?:string;durationSeconds?:number;error?:string;version:number;state:ProjectView['state'];createdAt:Date;updatedAt:Date;requestKey:string;requestHash:string;currentReadyRevisionId?:ObjectId;activeJobId?:ObjectId;deletedAt?:Date;schemaVersion:number};
let indexes:Promise<unknown>|undefined;
async function collection(){
  const col=getMongo().db.collection<ProjectRecord>('projects');
  indexes??=Promise.all([col.createIndex({ownerId:1,requestKey:1},{unique:true,partialFilterExpression:{requestKey:{$type:'string'}}}),col.createIndex({ownerId:1,updatedAt:-1,_id:-1})]).catch(error=>{indexes=undefined;throw error;});
  await indexes;return col;
}
function objectId(id:string){if(!/^[a-f\d]{24}$/i.test(id))throw new AppError(404,'NOT_FOUND','Project not found.');return new ObjectId(id);}
function view(p:ProjectRecord):ProjectView{return {id:p._id.toHexString(),title:p.title,language:p.brief.language,targetSeconds:p.brief.targetSeconds,state:p.state,stage:p.stage,durationSeconds:p.durationSeconds,error:p.error,previousReady:p.state==='updating'&&!!p.currentReadyRevisionId,updatedAt:p.updatedAt.toISOString(),version:p.version};}
export async function listProjects(ownerId:string){
  const rows=await (await collection()).find({ownerId,deletedAt:{$exists:false}}).sort({updatedAt:-1,_id:-1}).limit(100).toArray();
  return rows.map(view);
}
export async function createProject(ownerId:string,input:unknown,requestKey:string){
  if(!/^[\w-]{8,100}$/.test(requestKey))throw new AppError(400,'INVALID_REQUEST_KEY','A valid request key is required.');
  const data=createProjectSchema.parse(input),requestHash=createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const col=await collection();
  const existing=await col.findOne({ownerId,requestKey});
  if(existing){if(existing.requestHash!==requestHash)throw new AppError(409,'IDEMPOTENCY_CONFLICT','This request was already used for different content.');return view(existing);}
  const now=new Date();
  const record:ProjectRecord={_id:new ObjectId(),ownerId,title:data.title,workspaceDraft:{...defaultDraft,mode:data.inputMode,topic:data.topic,language:data.language,targetSeconds:data.targetSeconds},brief:{topic:data.topic,notes:'',language:data.language,audience:'Beginners',targetSeconds:data.targetSeconds},version:1,state:'draft',createdAt:now,updatedAt:now,requestKey,requestHash,schemaVersion:1};
  try{await col.insertOne(record);}catch(error){if(error instanceof MongoServerError&&error.code===11000){const other=await col.findOne({ownerId,requestKey});if(other&&other.requestHash===requestHash)return view(other);}throw error;}
  return view(record);
}
export async function renameProject(ownerId:string,id:string,title:string,expectedVersion:number){
  const result=await (await collection()).findOneAndUpdate({_id:objectId(id),ownerId,version:expectedVersion,deletedAt:{$exists:false}},{$set:{title,updatedAt:new Date()},$inc:{version:1}},{returnDocument:'after'});
  if(!result)throw new AppError(409,'STALE_VERSION','This project changed or is unavailable. Refresh and try again.');
  return view(result);
}
export async function duplicateProject(ownerId:string,id:string,requestKey:string){
  const source=await (await collection()).findOne({_id:objectId(id),ownerId,deletedAt:{$exists:false}});
  if(!source)throw new AppError(404,'NOT_FOUND','Project not found.');
  return createProject(ownerId,{title:`${source.title.slice(0,90)} (copy)`,topic:source.brief.topic,language:source.brief.language,targetSeconds:source.brief.targetSeconds},requestKey);
}
export async function deleteProject(ownerId:string,id:string,expectedVersion:number){
  const col=await collection();const filter={_id:objectId(id),ownerId,version:expectedVersion,deletedAt:{$exists:false}};
  const source=await col.findOne(filter);
  if(!source)throw new AppError(409,'STALE_VERSION','This project changed or is unavailable. Refresh and try again.');
  // Full asynchronous asset cleanup and publication cancellation arrive with those workflows.
  if(source.activeJobId||source.currentReadyRevisionId||source.state!=='draft')throw new AppError(409,'CLEANUP_REQUIRED','Only drafts without generated media can be deleted at this stage.');
  const posts=await getMongo().db.collection('publications').countDocuments({ownerId,projectId:source._id,state:{$nin:['cancelled','published','failed','missed']}});
  if(posts)throw new AppError(409,'PUBLICATION_ACTIVE','Resolve the scheduled or active post before deleting this project.');
  const result=await col.updateOne({...filter,state:'draft',activeJobId:{$exists:false},currentReadyRevisionId:{$exists:false}},{$set:{deletedAt:new Date(),updatedAt:new Date()},$inc:{version:1}});
  if(!result.matchedCount)throw new AppError(409,'STALE_VERSION','This project changed. Refresh and try again.');
}
