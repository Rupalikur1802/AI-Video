import {SignIn} from '../../../components/sign-in';
export default async function LoginPreview({searchParams}:{searchParams:Promise<{state?:string}>}){return <SignIn configured={false} state={(await searchParams).state} preview/>;}
