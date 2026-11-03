import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireMember} from '../../../../../server/session';
import {errorResponse,verifyMutationOrigin} from '../../../../../server/errors';
import {getWorkspace,saveWorkspace} from '../../../../../server/workspace';
import {draftSchema} from '../../../../../core/workspace';
export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){try{const user=await requireMember(request.headers);return NextResponse.json({data:await getWorkspace(user.id,(await context.params).id)},{headers:{'Cache-Control':'no-store'}});}catch(error){return errorResponse(error);}}
export async function PATCH(request:Request,context:Context){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);const data=z.object({expectedVersion:z.number().int().positive(),draft:draftSchema}).strict().parse(await request.json());return NextResponse.json({data:await saveWorkspace(user.id,(await context.params).id,data.draft,data.expectedVersion)});}catch(error){return errorResponse(error);}}
