import {z} from 'zod';
import type {GenerationJobView} from './generation';
export const MAX_SOURCE_BYTES=4*1024*1024;
export const MAX_SOURCE_UNITS=60;
export const MAX_SOURCE_CHARACTERS=100_000;
export type SourceUnit={id:string;label:string;text:string};
export type SourceView={id:string;name:string;kind:'pdf'|'pptx'|'txt';count:number;units:SourceUnit[];warnings:string[]};
export const draftSchema=z.object({
  mode:z.enum(['idea','upload']),topic:z.string().max(10000),language:z.enum(['en','hi']),
  audience:z.string().min(1).max(200),targetSeconds:z.union([z.literal(30),z.literal(60),z.literal(90)]),
  focusMode:z.enum(['summary','focus']),focus:z.string().max(500),
  voice:z.literal('sarah'),style:z.enum(['minimal','blueprint','kinetic']),captions:z.boolean(),
}).strict();
export const scriptSceneSchema=z.object({title:z.string().min(1).max(80),narration:z.string().min(1).max(1600),keywords:z.array(z.string().max(70)).min(1).max(4),visual:z.enum(['highlight','steps','comparison']),sourceRefs:z.array(z.string().max(30)).max(8),evidence:z.array(z.object({unitId:z.string().max(30),quote:z.string().min(1).max(500)})).max(5)});
export const scriptSchema=z.object({title:z.string().min(1).max(100),scenes:z.array(scriptSceneSchema).min(2).max(8)});
export type WorkspaceDraft=z.infer<typeof draftSchema>;
export type ScriptPlan=z.infer<typeof scriptSchema>;
export type WorkspaceView={id:string;title:string;version:number;draft:WorkspaceDraft;source:SourceView|null;script:ScriptPlan|null;scriptStale:boolean;revisions:RevisionView[];activeJob?:{id:string;state:string;stage:string;error?:string};generationAvailable:boolean;generationUnavailableReason?:string;lastJob?:GenerationJobView;renderStale?:boolean};
export type RevisionView={id:string;createdAt:string;duration:number;script:ScriptPlan;assetId:string;number?:number;language?:'en'|'hi';style?:WorkspaceDraft['style'];captions?:boolean;inputHash?:string};
export const defaultDraft:WorkspaceDraft={mode:'idea',topic:'',language:'en',audience:'Beginners',targetSeconds:60,focusMode:'summary',focus:'',voice:'sarah',style:'minimal',captions:true};
export function sourceKind(name:string){const kind=name.split('.').at(-1)?.toLowerCase();if(kind!=='pdf'&&kind!=='pptx'&&kind!=='txt')throw new Error('Use a PDF, PPTX, or TXT file.');return kind;}
export function validateSourceReferences(plan:ScriptPlan,units:SourceUnit[]){
  const known=new Map(units.map(u=>[u.id,u]));
  for(const scene of plan.scenes){
    if(units.length&&(!scene.sourceRefs.length||!scene.evidence.length))throw new Error('A source-based scene needs supporting references.');
    for(const ref of scene.sourceRefs)if(!known.has(ref))throw new Error('Unknown source reference.');
    for(const evidence of scene.evidence)if(!scene.sourceRefs.includes(evidence.unitId)||!known.get(evidence.unitId)?.text.includes(evidence.quote))throw new Error('Source evidence could not be verified.');
  }
}
export function scriptEstimate(plan:ScriptPlan|null){return plan?Math.round(plan.scenes.map(s=>s.narration).join(' ').trim().split(/\s+/u).length/2.2):0;}

export function scriptContext(draft:WorkspaceDraft){const {mode,topic,language,audience,targetSeconds,focusMode,focus}=draft;return JSON.stringify({mode,topic,language,audience,targetSeconds,focusMode,focus});}
