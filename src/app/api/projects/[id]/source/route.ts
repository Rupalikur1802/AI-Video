import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireMember} from '../../../../../server/session';
import {AppError,errorResponse,verifyMutationOrigin} from '../../../../../server/errors';
import {attachSource,removeSource} from '../../../../../server/workspace';
import {DocumentError} from '../../../../../server/documents';
import {MAX_SOURCE_BYTES} from '../../../../../core/workspace';
export const runtime='nodejs';
export const maxDuration=60;
type Context={params:Promise<{id:string}>};
export async function POST(request:Request,context:Context){try{
  verifyMutationOrigin(request);const user=await requireMember(request.headers);
  const limit=MAX_SOURCE_BYTES+65536;
  if(Number(request.headers.get('content-length')||0)>limit)throw new AppError(413,'FILE_SIZE','Choose a file up to 4 MB.');
  const reader=request.body?.getReader();if(!reader)throw new AppError(400,'FILE_REQUIRED','Choose a source file.');
  const chunks:Uint8Array[]=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>limit){await reader.cancel();throw new AppError(413,'FILE_SIZE','Choose a file up to 4 MB.');}chunks.push(value);}
  const form=await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('content-type')||''},body:Buffer.concat(chunks)}).formData();
  const file=form.get('file'),version=Number(form.get('expectedVersion'));
  if(!(file instanceof File)||!Number.isInteger(version)||version<1)throw new AppError(400,'INVALID_INPUT','Choose a source file and save the project first.');
  const name=file.name.split(/[\\/]/).at(-1)||'source.txt';
  return NextResponse.json({data:await attachSource(user.id,(await context.params).id,name,Buffer.from(await file.arrayBuffer()),version)});
}catch(error){return errorResponse(error instanceof DocumentError?new AppError(422,error.code,error.message):error);}}
export async function DELETE(request:Request,context:Context){try{verifyMutationOrigin(request);const user=await requireMember(request.headers);const {expectedVersion}=z.object({expectedVersion:z.number().int().positive()}).strict().parse(await request.json());return NextResponse.json({data:await removeSource(user.id,(await context.params).id,expectedVersion)});}catch(error){return errorResponse(error);}}
