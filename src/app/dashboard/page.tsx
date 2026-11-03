import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {requireMember} from '../../server/session';
import {AppError} from '../../server/errors';
import {Dashboard} from '../../components/dashboard';
export const dynamic='force-dynamic';
export default async function DashboardPage(){
  let user;
  try{user=await requireMember(await headers());}
  catch(error){if(error instanceof AppError&&error.code==='NOT_APPROVED')redirect('/login?state=unapproved');if(error instanceof AppError&&error.code==='AUTH_NOT_CONFIGURED')redirect('/login');if(error instanceof AppError&&error.code==='SESSION_REQUIRED')redirect('/login?state=expired');redirect('/login?state=unavailable');}
  return <Dashboard user={{name:user.name,email:user.email}}/>;
}
