import 'server-only';
import {getAuth} from './auth';
import {authConfigured} from './config';
import {isApprovedMember} from '../core/access';
import {AppError} from './errors';
export async function requireMember(headers:Headers){
  if(!authConfigured())throw new AppError(503,'AUTH_NOT_CONFIGURED','Team sign-in is not configured yet.');
  const session=await getAuth().api.getSession({headers});
  if(!session)throw new AppError(401,'SESSION_REQUIRED','Sign in to continue.');
  if(!isApprovedMember(session.user,process.env.APPROVED_EMAILS))throw new AppError(403,'NOT_APPROVED','Please use your approved team account.');
  return session.user;
}
