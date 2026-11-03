import {NextResponse} from 'next/server';
import {requireMember} from '../../../server/session';
import {errorResponse,verifyMutationOrigin} from '../../../server/errors';
import {createProject,listProjects} from '../../../server/projects';
export const runtime='nodejs';
export async function GET(request:Request){try{const user=await requireMember(request.headers);return NextResponse.json({data:await listProjects(user.id)},{headers:{'Cache-Control':'no-store'}});}catch(error){return errorResponse(error);}}
export async function POST(request:Request){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);const project=await createProject(user.id,await request.json(),request.headers.get('idempotency-key')||'');return NextResponse.json({data:project},{status:201});}catch(error){return errorResponse(error);}}
