import {z} from 'zod';
import type {ScriptPlan,WorkspaceDraft} from './workspace';
export const generationStages=['Preparing narration','Synchronizing captions','Animating scenes','Rendering video','Preparing preview'] as const;
export type GenerationStage=typeof generationStages[number];
export type GenerationJobView={id:string;state:'queued'|'processing'|'ready'|'failed';stage:string;error?:string;number:number};
export const generationRequestSchema=z.object({expectedVersion:z.number().int().positive()}).strict();
export function renderIdentity(script:ScriptPlan,draft:WorkspaceDraft){return JSON.stringify({renderer:'sochitra-v1',script,language:draft.language,voice:draft.voice,style:draft.style,captions:draft.captions,targetSeconds:draft.targetSeconds});}
