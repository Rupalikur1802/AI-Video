import {Workspace} from '../../../components/workspace';
import {defaultDraft,type WorkspaceView} from '../../../core/workspace';
import {fixturePlan} from '../../../core/fixtures';
import {demoProjects} from '../../../core/demo-projects';
export default async function Page({searchParams}:{searchParams:Promise<{title?:string;project?:string;state?:string}>}){const {title,project,state}=await searchParams;const sample=demoProjects.find(p=>p.id===project&&p.state==='draft');const initial:WorkspaceView={id:'preview',title:sample?.title||title?.slice(0,100)||'Untitled video',version:1,draft:{...defaultDraft,mode:sample?'idea':'upload',topic:sample?`Explain ${sample.title} in a clear, memorable way.`:'',language:sample?.language||'en',targetSeconds:sample?.targetSeconds||60},source:null,script:null,scriptStale:false,revisions:[],generationAvailable:false};const previewStates=['progress','ready','revised','failed','share'];if(state&&previewStates.includes(state)){
 const plan=fixturePlan('en');initial.script={title:plan.title,scenes:plan.scenes.map(s=>({title:s.title,narration:s.narration,keywords:[s.label],visual:'highlight' as const,sourceRefs:[],evidence:[]}))};initial.draft={...defaultDraft,topic:'Explain the water cycle.'};initial.generationAvailable=false;
 if(state!=='progress'&&state!=='failed')initial.revisions=[{id:'sample-water-cycle',assetId:'sample',createdAt:'2026-11-03T00:00:00.000Z',duration:30,script:initial.script,number:1,language:'en',style:'minimal',captions:true}];
 if(state==='progress'){initial.activeJob={id:'sample-job',state:'processing',stage:'Rendering video'};initial.lastJob={...initial.activeJob,number:1,state:'processing'};}
 if(state==='failed')initial.lastJob={id:'sample-job',number:1,state:'failed',stage:'Rendering video',error:'Illustrative failure. Your script is saved.'};
 if(state==='revised')initial.renderStale=true;
 }return <Workspace key={state||project||title||'new'} initialStep={state==='share'?3:state&&previewStates.includes(state)?2:undefined} initial={initial} user={{name:'Alex Morgan',email:'preview@example.com'}} preview/>;}
