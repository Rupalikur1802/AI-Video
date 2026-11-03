import {SignIn} from '../../components/sign-in';
import {authConfigured} from '../../server/config';
export const dynamic='force-dynamic';
export default async function LoginPage({searchParams}:{searchParams:Promise<{state?:string}>}){
  const {state}=await searchParams;
  return <SignIn configured={authConfigured()} state={state}/>;
}
