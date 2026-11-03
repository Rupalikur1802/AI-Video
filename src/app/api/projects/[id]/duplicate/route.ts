import {NextResponse} from 'next/server';
import {requireMember} from '../../../../../server/session';
import {errorResponse,verifyMutationOrigin} from '../../../../../server/errors';
import {duplicateProject} from '../../../../../server/projects';
export const runtime='nodejs';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);return NextResponse.json({data:await duplicateProject(user.id,(await context.params).id,request.headers.get('idempotency-key')||'')},{status:201});}catch(error){return errorResponse(error);}}
