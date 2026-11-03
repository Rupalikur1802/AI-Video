'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,LockKeyhole,LoaderCircle,AlertCircle,Clock3} from 'lucide-react';
import {authClient} from '../lib/auth-client';

export function SignIn({configured,state='default',preview=false}:{configured:boolean;state?:string;preview?:boolean}){
  const [busy,setBusy]=useState(false),[failed,setFailed]=useState(false);
  const activeState=failed?'error':state;
  async function signIn(){
    if(!configured||busy)return;
    setBusy(true);setFailed(false);
    try{const result=await authClient.signIn.social({provider:'google',callbackURL:'/dashboard',errorCallbackURL:'/login?state=error'});if(result.error){setFailed(true);setBusy(false);}}
    catch{setFailed(true);setBusy(false);}
  }
  return <main className="login-page"><div className="login-shell">
    <section className="login-art-panel" aria-label="Sochitra creative studio"><div className="login-art-top"><span><i/> Your creative space</span><span>SOCHITRA</span></div><div className="login-art"><img src="/images/login-art.png" alt="A sculptural prism catching a fine beam of violet light"/><div className="login-art-caption"><span>Ideas, brought into focus.</span><p>30–90 second motion stories · English and Hindi narration</p></div></div><blockquote>“Where a spark of thought<br/>becomes a story in motion.”</blockquote><div className="login-art-bottom"><span>SOCHITRA</span><span>THINK. CREATE. SHARE.</span></div></section>
    <section className="login-form-panel"><div className="login-nav"><Link href="/" className="login-wordmark">Sochitra<span>·</span></Link><Link href="/" className="login-back"><ArrowLeft size={16}/> Back to home</Link></div><div className="login-form"><p className="eyebrow">A little space for big ideas</p><h1>Welcome to your<br/>creative space.</h1><p className="login-subtitle">Sign in to bring your next idea to life.</p>
      {activeState==='unapproved'&&<div className="login-notice" role="alert"><LockKeyhole size={20}/><div><strong>This account doesn’t have access yet.</strong><p>Please use your approved team account.</p></div></div>}
      {activeState==='expired'&&<div className="login-notice"><Clock3 size={20}/><div><strong>Your session has expired.</strong><p>Sign in to continue.</p></div></div>}
      {(activeState==='error'||activeState==='unavailable')&&<div className="login-notice danger" role="alert"><AlertCircle size={20}/><div><strong>We couldn’t complete sign-in.</strong><p>Check your connection and try your approved team account again.</p></div></div>}
      <button className="google-button" onClick={signIn} disabled={!configured||busy} aria-busy={busy}>{busy?<LoaderCircle className="spin" size={20}/>:<GoogleMark/>}{busy?'Connecting to Google…':activeState==='unapproved'?'Try another Google account':'Continue with Google'}</button>
      <p className="login-access"><LockKeyhole size={12}/> Available to approved team members only.</p>
      {!configured&&<div className="setup-notice"><strong>{preview?'Design preview':'Sign-in setup is pending'}</strong><p>{preview?'This is a visual preview. No authentication is simulated.':'Google sign-in and MongoDB need to be configured before team access can be enabled.'}</p><Link href="/preview/dashboard">Explore the dashboard design <ArrowRight size={14}/></Link></div>}
      <Link className="return-home" href="/"><ArrowLeft size={15}/> Return to home page</Link>
    </div><p className="login-footer">Your next story starts with a thought.</p></section>
  </div></main>;
}
function GoogleMark(){return <svg width="21" height="21" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.85 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.78-4.59l-7.98-6.19A23.8 23.8 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.74-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;}
