'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowDown, ArrowRight, ArrowUp, AudioLines, Captions, Check, CircleCheck, Clock3, FileText, History, Menu, MessageSquare, Play, Sparkles, SlidersHorizontal, Volume2, VolumeX, WandSparkles, X} from 'lucide-react';

const sampleVideo='https://res.cloudinary.com/v20abvna/video/upload/v1793612284/sochitra/poc/nkcovimpb3hfl3derbfr.mp4';
const waves=[8,15,24,18,11,20,27,14,9,23,18,28,15,7,20,12,23,16];
const steps=[
  ['Describe','Start with a topic, a question, or your notes. Give your idea a place to begin.'],
  ['Review','Shape the script before it becomes a video. Find the words that sound like you.'],
  ['Refine','Make changes through conversation. Adjust the pacing, voice, and visual emphasis.'],
  ['Share','Download your MP4, or publish and schedule it on Instagram when connected.'],
];

function Brand(){return <a className="brand" href="#top" aria-label="Sochitra home"><img src="/icon.svg" width="32" height="32" alt=""/><span>Sochitra</span></a>;}
function Eyebrow({children}:{children:React.ReactNode}){return <p className="eyebrow">{children}</p>;}

export function Homepage(){
  const router=useRouter();
  const [menuOpen,setMenuOpen]=useState(false);
  const [modal,setModal]=useState<'sample'|'concept'|null>(null);
  const [concept,setConcept]=useState({title:'',image:''});
  const [muted,setMuted]=useState(true);
  const [demoApplied,setDemoApplied]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const previousFocus=useRef<HTMLElement|null>(null);
  const video=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    if(modal){previousFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();}
    else if(dialog.current?.open){dialog.current.close();previousFocus.current?.focus();}
    const old=document.body.style.overflow;
    if(modal)document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=old;};
  },[modal]);
  const access=()=>{setMenuOpen(false);router.push('/login');};
  const previewConcept=(title:string,image:string)=>{setConcept({title,image});setModal('concept');};
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header" id="top"><div className="container header-inner">
      <div className="header-left"><Brand/><nav className="desktop-nav" aria-label="Main navigation"><a href="#creations">Explore</a><a href="#how-it-works">How it works</a></nav></div>
      <div className="header-actions"><button className="text-button sign-in" onClick={access}>Sign in</button><button className="button primary small" onClick={access}>Start creating <ArrowRight size={15}/></button><button className="menu-button" aria-label={menuOpen?'Close navigation':'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button></div>
    </div>{menuOpen&&<nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation"><a href="#creations" onClick={()=>setMenuOpen(false)}>Explore</a><a href="#how-it-works" onClick={()=>setMenuOpen(false)}>How it works</a><button onClick={access}>Sign in</button></nav>}</header>
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="format-badge"><span className="status-dot"/><span>30–90 second videos <span className="badge-separator">·</span> English and Hindi narration</span></div>
          <h1 id="hero-title">Your imagination.<br/><span>Set in motion.</span></h1>
          <p className="hero-description">Turn ideas into expressive videos with animated visuals, natural narration, and captions that follow your story.</p>
          <div className="hero-actions"><button className="button primary" onClick={access}>Start creating <ArrowRight size={17}/></button><a className="button secondary" href="#creations"><Play size={17}/> Explore examples</a></div>
          <div className="hero-details"><span><Sparkles size={16}/> Purposeful motion</span><span className="detail-dot">·</span><span><AudioLines size={17}/> Voice and visuals, in sync</span></div>
        </div>
        <div className="hero-visual"><div className="hero-glow"/><div className="hero-frame">
          <img className="hero-art" src="/images/design-0.png" alt="A glass prism refracting luminous violet and gold waves" fetchPriority="high"/>
          <div className="frame-shade"/><div className="frame-top"><span className="pill"><span className="rose-dot"/> Concept preview</span><span className="pill">9:16</span></div>
          <button className="play-button hero-play" aria-label="Watch the real Sochitra sample video" onClick={()=>setModal('sample')}><Play size={27} fill="currentColor"/></button>
          <div className="audio-panel"><div className="audio-heading"><span>Light, brought to life</span><button className="sound-button" onClick={()=>setMuted(!muted)} aria-label={muted?'Enable sound for sample playback':'Mute sample playback'} aria-pressed={!muted}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}<span>{muted?'Muted':'Sound on'}</span></button></div><div className="waveform" aria-hidden="true">{waves.map((height,i)=><i key={i} style={{height,opacity:.35+(i%4)*.2}}/>)}<div className="wave-track"><span/></div></div><p>“Every idea has a story waiting to move.”</p><span className="sample-note">Play opens our 30-second water-cycle sample</span></div>
        </div><div className="visual-footnote"><span>IMAGINATION, FRAME BY FRAME</span><ArrowDown size={14}/></div></div>
      </section>

      <section className="section container" id="creations" aria-labelledby="creations-title"><div className="section-heading"><div><Eyebrow>Showcase library</Eyebrow><h2 id="creations-title">See what an idea can become.</h2></div><p>From the things you know to the stories you want to tell. Make every frame mean something.</p></div>
        <div className="showcase-grid"><article className="feature-card"><button className="feature-image image-button" onClick={()=>previewConcept('Explain a concept.','/images/design-1.png')} aria-label="View Explain a concept artwork"><img src="/images/design-1.png" alt="A faceted crystal radiating fine golden threads of light" loading="lazy"/><span className="image-badges"><span className="pill">Concept preview</span></span><span className="play-button"><Play size={23} fill="currentColor"/></span></button><div className="feature-body"><Eyebrow>Ideas made visible</Eyebrow><h3>Explain a concept.</h3><p>Bring complex ideas into focus with clear visual stories and narration that moves with every scene.</p><div className="caption-sample"><Captions size={19}/><span>“A little clarity can change how you see everything.”</span></div></div></article>
        <div className="supporting-cards"><article className="support-card"><button className="support-image image-button" onClick={()=>previewConcept('Share your expertise.','/images/design-2.png')} aria-label="View Share your expertise artwork"><img src="/images/design-2.png" alt="An intricate illuminated architectural wireframe" loading="lazy"/><span className="mini-play"><Play size={18}/></span></button><div><Eyebrow>Concept preview</Eyebrow><h3>Share your expertise.</h3><p>Turn what you know into something people can see, hear, and understand.</p></div></article>
          <article className="support-card"><button className="support-image image-button" onClick={()=>previewConcept('Tell your brand’s story.','/images/design-3.png')} aria-label="View brand story artwork"><img src="/images/design-3.png" alt="Sculptural silver lettering woven with violet light" loading="lazy"/><span className="mini-play"><Play size={18}/></span></button><div><Eyebrow>Concept preview</Eyebrow><h3>Tell your brand’s story.</h3><p>Give your ideas, purpose, and process a distinctive visual voice.</p></div></article>
          <div className="format-strip"><div><strong>30–90s</strong><span>Video length</span></div><div><strong>In sync</strong><span>Voice & captions</span></div><div><strong>1080p</strong><span>MP4 output</span></div></div>
        </div></div>
      </section>

      <section className="section container pipeline" aria-labelledby="pipeline-title"><div className="section-intro"><Eyebrow>Synchronized storytelling</Eyebrow><h2 id="pipeline-title">From the first thought<br/>to the final frame.</h2><p>Your idea sets the direction. Sochitra brings the script, motion, narration, and captions together.</p></div><div className="pipeline-grid">
        <article className="pipeline-card"><div className="card-top"><span>01 · The idea</span><FileText size={18}/></div><label>Your starting point</label><div className="inset-box">“Explain how light carries information.”</div><div className="card-bottom"><span className="status-dot"/> One thought. Endless possibility.</div></article>
        <div className="connector"><ArrowRight size={20}/></div>
        <article className="pipeline-card"><div className="card-top"><span>02 · The script</span><Captions size={18}/></div><div className="inset-box script-excerpt"><div><span>SCENE 01</span><span>Light in motion</span></div><p>“Pulses of light travel through a glass core, carrying <mark>information across vast distances.</mark>”</p></div><div className="card-bottom">Your words, shaped into a story.<Check size={16}/></div></article>
        <div className="connector"><ArrowRight size={20}/></div>
        <article className="pipeline-card render-card"><div className="card-top"><span>03 · The scene</span><span>Concept preview</span></div><button className="render-art image-button" onClick={()=>previewConcept('Light in motion','/images/design-4.png')} aria-label="Inspect light scene concept"><img src="/images/design-4.png" alt="A prism with vivid light waves against a dark background" loading="lazy"/><span className="scene-caption">Information, carried by light.</span></button><div className="render-bottom"><span><CircleCheck size={17}/> Motion meets meaning</span><button onClick={()=>previewConcept('Light in motion','/images/design-4.png')}>Inspect <ArrowRight size={14}/></button></div></article>
      </div></section>

      <section className="section container direction" aria-labelledby="direction-title"><div className="section-intro"><Eyebrow>Direction without complexity</Eyebrow><h2 id="direction-title">Give direction.<br/>Keep your vision.</h2><p>No complex tracks or keyframe curves. Shape the result with a simple conversation.</p><ul className="direction-list"><li><SlidersHorizontal size={19}/> Adjust pacing, tone, and visual emphasis</li><li><History size={19}/> Return to an earlier version</li></ul></div><div className={`revision-demo ${demoApplied?'is-applied':''}`}><span className="demo-label">INTERACTIVE CONCEPT</span><div className="feedback"><MessageSquare size={21}/><div><span>Your creative feedback</span><p>“Make the opening stronger. Slow down the animation.”</p></div></div><div className="adjustments"><div className="adjustment-heading"><span>Scene 01 adjustments</span><span className="state-badge">{demoApplied?'Preview updated':'Ready to preview'}</span></div><div className="change-chip"><Check size={16}/> Stronger opening</div><div className="change-chip"><Check size={16}/> Slower animation</div><div className="demo-timeline" aria-hidden="true"><span/><span/><span/><i/></div><div className="demo-explanation"><Clock3 size={16}/><span>{demoApplied?'A little more room for the idea to land.':'Preview how a revision changes the pacing.'}</span></div></div><div className="revision-actions"><span aria-live="polite">{demoApplied?'Illustrative preview only. No video was generated.':'Try this illustrative interaction.'}</span><button className="button primary small" onClick={()=>setDemoApplied(!demoApplied)}>{demoApplied?<History size={16}/>:<WandSparkles size={16}/>} {demoApplied?'Reset demo':'Preview changes'}</button></div></div></section>

      <section className="section container workflow" id="how-it-works" aria-labelledby="workflow-title"><Eyebrow>How it works</Eyebrow><h2 id="workflow-title">Simple to begin.<br/>Yours to shape.</h2><div className="workflow-grid">{steps.map(([title,description],i)=><article key={title}><span className="step-number">0{i+1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="container closing-section"><div className="closing"><span className="closing-spark"><Sparkles size={24}/></span><h2>Your next story<br/>starts here.</h2><p>Give your imagination a little room to move.</p><button className="button primary" onClick={access}>Start creating <ArrowRight size={17}/></button><span className="access-note">Currently available to approved team members.</span></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><Brand/><span>© 2026 Sochitra.</span></div><a href="#top"><ArrowUp size={17}/> Back to top</a></div></footer>
    <dialog ref={dialog} className={`site-dialog ${modal==='sample'?'video-dialog':''}`} onCancel={()=>setModal(null)} onClose={()=>setModal(null)} onClick={e=>{if(e.target===dialog.current)setModal(null);}} aria-labelledby="dialog-title"><button className="dialog-close" aria-label="Close dialog" onClick={()=>setModal(null)}><X size={22}/></button>
      {modal==='sample'&&<><h2 id="dialog-title">Made with Sochitra</h2><p className="dialog-description">The water cycle · English · 30 seconds</p><video ref={video} src={sampleVideo} controls autoPlay muted={muted} playsInline preload="metadata" aria-label="English water-cycle sample with burned-in captions"/><p className="dialog-footnote">Real AI narration, motion graphics, and synchronized captions.</p></>}
      {modal==='concept'&&<><Eyebrow>Concept artwork</Eyebrow><h2 id="dialog-title">{concept.title}</h2><p className="dialog-description">Design reference artwork, not a generated video.</p><img className="concept-full" src={concept.image} alt={concept.title}/><button className="button secondary" onClick={()=>setModal('sample')}><Play size={16}/> Watch our real video sample</button></>}
    </dialog>
  </>;
}
