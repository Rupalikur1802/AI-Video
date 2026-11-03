import {config} from 'dotenv';
import {generateScript} from '../src/server/gemini';
import {groundScript} from '../src/core/script-evidence';
import {defaultDraft,type WorkspaceView} from '../src/core/workspace';
config({path:'.env.local',quiet:true} as Parameters<typeof config>[0]);
// Synthetic/public fixture only. Never reads a saved project or uploaded document.
if(process.argv.slice(2).some(arg=>!['en','hi','idea'].includes(arg)))throw new Error('Only synthetic fixture options en, hi, and idea are supported.');
const language=process.argv.includes('hi')?'hi':'en',mode=process.argv.includes('idea')?'idea':'upload';
const workspace:WorkspaceView={id:'fixture',title:'Synthetic script check',version:1,draft:{...defaultDraft,mode,language,topic:'Explain the water cycle.'},script:null,source:mode==='upload'?{id:'fixture',name:'synthetic-notes.txt',kind:'txt',count:2,warnings:[],units:[{id:'notes-1',label:'Notes 1',text:'The sun warms water and causes evaporation.\nWater vapor cools and condenses into clouds.'},{id:'notes-2',label:'Notes 2',text:'Rain returns water to the ground. The water cycle moves water between the surface and atmosphere.'}]}:null,scriptStale:false,revisions:[],generationAvailable:false};
const originalFetch=globalThis.fetch;
try{
 globalThis.fetch=async(input,init)=>{
  const response=await originalFetch(input,init);const payload=await response.clone().json();const candidate=payload.candidates?.[0],text=candidate?.content?.parts?.filter((p:{thought?:boolean})=>!p.thought).map((p:{text?:string})=>p.text||'').join('')||'';
  const report:Record<string,unknown>={status:response.status,finishReason:candidate?.finishReason,textLength:text.length};
  try{groundScript(JSON.parse(text),workspace.source?.units||[]);report.scriptValid=true;}catch{report.scriptValid=false;}
  console.log(JSON.stringify(report));return response;
 };
 const plan=await generateScript(workspace);console.log(JSON.stringify({verified:true,mode,language,scenes:plan.scenes.length,words:plan.scenes.map(s=>s.narration).join(' ').split(/\s+/u).length}));
}catch(error){console.log(JSON.stringify({verified:false,code:(error as {code?:string}).code||'CHECK_FAILED'}));process.exitCode=1;}
finally{globalThis.fetch=originalFetch;}
