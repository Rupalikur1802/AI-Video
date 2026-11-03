import {SignIn} from '../../components/sign-in';
import {authConfigured} from '../../server/config';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function LoginPage({searchParams}:{searchParams:Promise<{state?:string}>}){
  const {state}=await searchParams;
  // OAuth state cookies must be written on the same local host as the callback.
  const configured=process.env.BETTER_AUTH_URL;
  if(configured){const url=new URL(configured);const host=(await headers()).get('host');if(['localhost','127.0.0.1'].includes(url.hostname)&&host!==url.host){url.pathname='/login';url.search='';if(state)url.searchParams.set('state',state);redirect(url.toString());}}
  return <SignIn configured={authConfigured()} state={state}/>;
}
