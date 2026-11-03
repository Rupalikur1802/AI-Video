import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireMember} from '../../../../server/session';
import {errorResponse,verifyMutationOrigin} from '../../../../server/errors';
import {renameProject,deleteProject} from '../../../../server/projects';
import {renameProjectSchema} from '../../../../core/projects';
export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);const data=renameProjectSchema.parse(await request.json());return NextResponse.json({data:await renameProject(user.id,(await context.params).id,data.title,data.expectedVersion)});}catch(error){return errorResponse(error);}}
export async function DELETE(request:Request,context:Context){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);const data=z.object({expectedVersion:z.number().int().positive()}).strict().parse(await request.json());await deleteProject(user.id,(await context.params).id,data.expectedVersion);return new NextResponse(null,{status:204});}catch(error){return errorResponse(error);}}
