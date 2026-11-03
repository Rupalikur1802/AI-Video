import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {TimedScene, Video} from '../core/model';

const Scene: React.FC<{scene: TimedScene; fps:number}> = ({scene:s,fps}) => {
  const frame=useCurrentFrame(), seconds=frame/fps;
  const caption=s.captions.find(c=>seconds>=c.start && seconds<c.end);
  const active=seconds>=s.cueSeconds;
  const opacity=interpolate(frame,[0,12],[0,1],{extrapolateRight:'clamp'});
  const up=s.kind==='evaporation', rain=s.kind==='precipitation', cloud=s.kind==='condensation';
  return <AbsoluteFill style={{background:'#071b30',color:'#f4f8ff',fontFamily:'"Nirmala UI", "Noto Sans Devanagari", sans-serif',padding:72,opacity}}>
    {s.audioSrc ? <Audio src={staticFile(s.audioSrc)}/> : null}
    <div style={{fontSize:25,letterSpacing:4,color:'#62ddcc'}}>SOCHITRA</div>
    <h1 style={{fontSize:78,lineHeight:1.25,marginTop:90}}>{s.title}</h1>
    <svg viewBox="0 0 900 850" style={{width:'100%',height:850}}>
      <circle cx="155" cy="130" r="68" fill="#ffc96c"/>
      {Array.from({length:8},(_,i)=><line key={i} x1="155" y1="35" x2="155" y2="10" stroke="#ffc96c" strokeWidth="7" transform={`rotate(${i*45} 155 130)`}/>)}
      <path d="M0 650 Q180 590 360 650 T720 650 T1080 650 V850 H0Z" fill="#176c9b"/>
      <path d="M0 680 Q180 620 360 680 T720 680 T1080 680" stroke="#69e6da" strokeWidth="8" fill="none"/>
      <g opacity={cloud ? (active ? 1 : .3) : .85} fill="#e3eef8">
        <ellipse cx="595" cy="235" rx="165" ry="60"/><circle cx="535" cy="195" r="67"/><circle cx="635" cy="180" r="85"/>
      </g>
      {(up||s.kind==='intro') && Array.from({length:5},(_,i)=>{const y=600-((frame*2+i*85)%350);return <g key={i} opacity={active?1:.25}><path d={`M${240+i*55} ${y+65} v-65 l-13 20 m13 -20 l13 20`} stroke="#64e7ce" strokeWidth="8" fill="none"/></g>;})}
      {rain && Array.from({length:12},(_,i)=><path key={i} d={`M${460+i%6*48} ${310+((frame*5+Math.floor(i/6)*140)%280)} l-13 30`} stroke="#70cfff" strokeWidth="9" opacity={active?1:.2}/>)}
      {s.kind==='collection' && <path d="M850 460 Q800 530 740 540 T610 650" stroke="#64e7ce" strokeWidth="18" fill="none" strokeDasharray="35 12" strokeDashoffset={-frame*2}/>}
      <text x="450" y="790" textAnchor="middle" fill="#bdf7ed" fontSize="38">{s.label}</text>
    </svg>
    <div style={{position:'absolute',bottom:240,left:75,right:75,textAlign:'center',fontSize:49,lineHeight:1.5,fontWeight:600,background:caption?'#102d46':'transparent',borderRadius:22,padding:25,minHeight:145}}>{caption?.text}</div>
  </AbsoluteFill>;
};
export const Explainer:React.FC<{video:Video}>=({video})=><AbsoluteFill>{video.scenes.map((s,i)=><Sequence key={i} from={s.startFrame} durationInFrames={s.durationInFrames}><Scene scene={s} fps={video.fps}/></Sequence>)}{video.fixture&&<div style={{position:'absolute',bottom:40,width:'100%',textAlign:'center',color:'#f9ca79',fontSize:26}}>SILENT DEMO · ESTIMATED TIMING</div>}</AbsoluteFill>;
const defaultVideo:Video={title:'Water cycle',language:'en',fixture:true,fps:30,durationInFrames:900,scenes:[]};
export const Root=()=> <Composition id="WaterCycle" component={Explainer} width={1080} height={1920} fps={30} durationInFrames={900} defaultProps={{video:defaultVideo}} calculateMetadata={({props})=>({durationInFrames:props.video.durationInFrames,fps:props.video.fps})}/>;
