import {NextResponse} from 'next/server';
import {requireMember} from '../../../../../server/session';
import {AppError,errorResponse,verifyMutationOrigin} from '../../../../../server/errors';
import {generationRequestSchema} from '../../../../../core/generation';
import {enqueueVideo,failVideoJob} from '../../../../../server/video-jobs';
import {getWorkspace} from '../../../../../server/workspace';
import {inngest} from '../../../../../server/inngest';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 verifyMutationOrigin(request);const user=await requireMember(request.headers),{id}=await params;
 const input=generationRequestSchema.parse(await request.json());
 const {job,created}=await enqueueVideo(user.id,id,input.expectedVersion,request.headers.get('Idempotency-Key')||'');
 if(created)try{await inngest.send({name:'sochitra/video.requested',id:`video-${job._id.toHexString()}`,data:{jobId:job._id.toHexString()}});}catch{await failVideoJob(job._id.toHexString(),new AppError(503,'WORKFLOW_UNAVAILABLE','Video generation is temporarily unavailable. Your script is saved. Try again shortly.'),true);}
 return NextResponse.json({data:await getWorkspace(user.id,id)},{status:created?202:200,headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error);}}
