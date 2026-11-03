import {getAuth} from '../../../../server/auth';
import {authConfigured} from '../../../../server/config';
import {NextResponse} from 'next/server';
export const runtime='nodejs';
async function handler(request:Request){
  if(!authConfigured())return NextResponse.json({error:{code:'AUTH_NOT_CONFIGURED',message:'Team sign-in is not configured yet.'}},{status:503});
  return getAuth().handler(request);
}
export const GET=handler;
export const POST=handler;
