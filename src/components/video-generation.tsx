'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Check,Film,LoaderCircle,RefreshCw,TriangleAlert} from 'lucide-react';
import {generationStages,type GenerationJobView} from '../core/generation';
import type {RevisionView} from '../core/workspace';

export const sampleVideo='https://res.cloudinary.com/v20abvna/video/upload/v1793612284/sochitra/poc/nkcovimpb3hfl3derbfr.mp4';
export function VideoPlayer({revision,preview=false}:{revision:RevisionView;preview?:boolean}){
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 return <><div className="creation-video">{failed?<div role="alert"><TriangleAlert size={30}/><h3>We couldn’t load the preview.</h3><p>Your completed video is saved. Reload to get a fresh playback link.</p><button className="button secondary" onClick={()=>{setFailed(false);setAttempt(n=>n+1);}}><RefreshCw size={15}/> Reload preview</button></div>:<video key={`${revision.id}-${attempt}`} controls playsInline preload="auto" aria-label={`Video preview version ${revision.number||1}`} onError={()=>setFailed(true)} src={preview?sampleVideo:`/api/assets/${revision.assetId}/playback?attempt=${attempt}`}/>}</div><div className="video-ready-label"><Check size={14}/>{preview?'Sample video · Existing water-cycle example':'Video ready'}<span>v{revision.number||1} · {Math.round(revision.duration)}s</span></div></>;
}
export function GenerationProgress({job,preview=false}:{job:GenerationJobView;preview?:boolean}){
 const index=generationStages.indexOf(job.stage as typeof generationStages[number]);
 return <section className="creation-settings generation-progress" aria-label="Video generation progress" aria-live="polite"><p className="eyebrow">{preview?'ILLUSTRATIVE STATE':'YOUR VIDEO IS TAKING SHAPE'}</p><h3><LoaderCircle size={18} className="spin"/> Generating video</h3><p>You can return to your projects and come back later.</p><ol>{generationStages.map((stage,i)=><li key={stage} className={i<index?'complete':i===index?'current':'upcoming'}><span>{i<index?<Check size={13}/>:i===index?<LoaderCircle className="spin" size={14}/>:i+1}</span><div>{stage}<small>{i<index?'Complete':i===index?'In progress':'Upcoming'}</small></div></li>)}</ol><Link className="button secondary" href={preview?'/preview/dashboard':'/dashboard'}>Back to projects</Link></section>;
}
export function EmptyVideo({generating=false,title}:{generating?:boolean;title:string}){return <div className="creation-video"><div>{generating?<LoaderCircle size={36} className="spin"/>:<Film size={36}/>}<h3>{generating?'Your story is taking shape.':title}</h3><p>{generating?'We’re bringing narration, captions, and motion together.':'Your approved script is ready to become a video.'}</p><span>9:16 · Narrated motion graphics</span></div></div>;}
