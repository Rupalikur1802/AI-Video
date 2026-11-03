import 'server-only';
import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
export class AppError extends Error{constructor(public status:number,public code:string,message:string){super(message);}}
export function errorResponse(error:unknown){
  const requestId=crypto.randomUUID();
  if(error instanceof AppError)return NextResponse.json({error:{code:error.code,message:error.message,requestId}},{status:error.status,headers:{'Cache-Control':'no-store'}});
  if(error instanceof ZodError||error instanceof SyntaxError)return NextResponse.json({error:{code:'INVALID_INPUT',message:'Check the submitted fields and try again.',requestId}},{status:400});
  console.error(JSON.stringify({requestId,code:'DEPENDENCY_UNAVAILABLE'}));
  return NextResponse.json({error:{code:'DEPENDENCY_UNAVAILABLE',message:'The service is temporarily unavailable. Please try again.',requestId}},{status:503});
}
export function verifyMutationOrigin(request:Request){
  const expected=new URL(process.env.BETTER_AUTH_URL||'http://localhost:3001').origin;
  if(request.headers.get('origin')!==expected)throw new AppError(403,'INVALID_ORIGIN','This request is not allowed.');
}
