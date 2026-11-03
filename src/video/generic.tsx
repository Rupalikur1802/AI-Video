import React from 'react';
import {AbsoluteFill,Audio,Sequence,interpolate,useCurrentFrame,staticFile} from 'remotion';
import type {GenericVideo,GenericScene} from '../core/composition';

function MotionScene({scene,style,captions,index}:{scene:GenericScene;style:GenericVideo['style'];captions:boolean;index:number}){
  const frame=useCurrentFrame(),seconds=frame/30;
  const progress=interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'});
  const caption=scene.captions.find(c=>seconds>=c.start&&seconds<c.end);
  const accent=style==='blueprint'?'#a2d5d0':style==='kinetic'?'#f3c873':'#c4a1ff';
  return <AbsoluteFill style={{background:style==='blueprint'?'#122529':'#141019',fontFamily:'Sochitra Devanagari, Nirmala UI, Arial, sans-serif',color:'#f8f3ff',padding:80}}>
    <Audio src={scene.audioUrl}/>
    <div style={{fontSize:24,letterSpacing:5,color:accent}}>SOCHITRA <span style={{opacity:.5,float:'right'}}>0{index+1}</span></div>
    <h1 style={{fontSize:68,lineHeight:1.45,fontWeight:650,margin:'100px 0 55px',opacity:progress,transform:`translateY(${(1-progress)*20}px)`}}>{scene.title}</h1>
    <div style={{position:'relative',height:650,display:'flex',flexDirection:scene.visual==='comparison'?'row':'column',gap:28,justifyContent:'center',alignItems:'stretch'}}>
      {scene.keywords.map((word,i)=>{
        const cue=scene.keywordFrames?.[i]??22+i*13;
        const reveal=interpolate(frame,[cue,cue+18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        return <div key={i} style={{position:'relative',padding:'32px 36px',minHeight:110,border:`2px solid ${accent}55`,borderRadius:20,background:`${accent}0b`,display:'flex',alignItems:'center',gap:25,opacity:reveal,transform:`translateX(${(1-reveal)*35}px)`,flex:scene.visual==='comparison'?1:undefined,fontSize:scene.visual==='comparison'?35:43,lineHeight:1.5,overflowWrap:'anywhere'}}><span style={{fontSize:25,color:accent}}>0{i+1}</span>{word}</div>;
      })}
      <svg viewBox="0 0 900 30" style={{position:'absolute',bottom:-45,width:'100%'}}><path d="M0 15 H900" stroke={accent} strokeWidth="2" strokeDasharray="8 15" strokeDashoffset={-frame}/><circle cx={30+(frame*2)%840} cy="15" r="7" fill={accent}/></svg>
    </div>
    {captions&&caption&&<div style={{position:'absolute',left:70,right:70,bottom:230,textAlign:'center',fontSize:43,lineHeight:1.65,padding:'24px 28px',background:'#21192ce8',borderRadius:18,color:'#fcf9ff'}}>{caption.text}</div>}
  </AbsoluteFill>;
}
export function GenericExplainer({video}:{video:GenericVideo}){return <AbsoluteFill><style>{`@font-face{font-family:'Sochitra Devanagari';src:url('${staticFile('fonts/devanagari.ttf')}') format('truetype');font-weight:100 900;}`}</style>{video.scenes.map((scene,i)=><Sequence key={i} from={scene.startFrame} durationInFrames={scene.durationInFrames}><MotionScene scene={scene} index={i} style={video.style} captions={video.captions}/></Sequence>)}</AbsoluteFill>;}
