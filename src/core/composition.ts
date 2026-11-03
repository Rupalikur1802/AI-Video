import type {ScriptPlan,WorkspaceDraft} from './workspace';
import type {Caption} from './model';
export type GenericScene=ScriptPlan['scenes'][number]&{audioUrl:string;startFrame:number;durationInFrames:number;captions:Caption[];keywordFrames?:number[]};
export type GenericVideo={title:string;fps:number;durationInFrames:number;style:WorkspaceDraft['style'];captions:boolean;scenes:GenericScene[]};
