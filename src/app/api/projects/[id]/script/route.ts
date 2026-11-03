import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireMember} from '../../../../../server/session';
import {AppError,errorResponse,verifyMutationOrigin} from '../../../../../server/errors';
import {getWorkspace,saveScript,projects,projectId} from '../../../../../server/workspace';
import {generateScript} from '../../../../../server/gemini';
import {scriptSchema} from '../../../../../core/workspace';
export const runtime='nodejs';
export const maxDuration=60;
const input=z.discriminatedUnion('action',[
  z.object({action:z.literal('generate'),expectedVersion:z.number().int().positive(),instruction:z.string().max(1000).optional()}).strict(),
  z.object({action:z.literal('save'),expectedVersion:z.number().int().positive(),script:scriptSchema}).strict(),
  z.object({action:z.literal('propose'),expectedVersion:z.number().int().positive(),instruction:z.string().min(1).max(1000)}).strict(),
]);
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  let lockId:string|undefined,ownerId:string|undefined,id:string|undefined;
  try{
    verifyMutationOrigin(request);const user=await requireMember(request.headers);ownerId=user.id;id=(await context.params).id;
    const body=input.parse(await request.json());
    if(body.action==='save')return NextResponse.json({data:await saveScript(user.id,id,body.script,body.expectedVersion)});
    const workspace=await getWorkspace(user.id,id);if(workspace.version!==body.expectedVersion)throw new AppError(409,'STALE_VERSION','Reload this project before generating a script.');
    lockId=crypto.randomUUID();
    const locked=await projects().updateOne({_id:projectId(id),ownerId:user.id,version:body.expectedVersion,activeJobId:{$exists:false},$or:[{scriptLock:{$exists:false}},{'scriptLock.expiresAt':{$lt:new Date()}}]},{$set:{scriptLock:{id:lockId,expiresAt:new Date(Date.now()+120000)}}});
    if(!locked.matchedCount)throw new AppError(409,'PROJECT_BUSY','Another change is processing. Wait a moment and try again.');
    const script=await generateScript(workspace,body.instruction);
    if(body.action==='propose')return NextResponse.json({data:{script,baseVersion:body.expectedVersion}});
    return NextResponse.json({data:await saveScript(user.id,id,script,body.expectedVersion,lockId)});
  }catch(error){return errorResponse(error);}
  finally{if(lockId&&ownerId&&id)await projects().updateOne({_id:projectId(id),ownerId,'scriptLock.id':lockId},{$unset:{scriptLock:''}}).catch(()=>{});}
}
