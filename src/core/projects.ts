import {z} from 'zod';

export const createProjectSchema=z.object({
  title:z.string().trim().min(1).max(100),
  topic:z.string().trim().max(500).default(''),
  language:z.enum(['en','hi']).default('en'),
  targetSeconds:z.union([z.literal(30),z.literal(60),z.literal(90)]).default(60),
  inputMode:z.enum(['idea','upload']).default('idea'),
}).strict();
export const renameProjectSchema=z.object({title:z.string().trim().min(1).max(100),expectedVersion:z.number().int().min(1)}).strict();
export type ProjectState='draft'|'processing'|'ready'|'updating'|'failed';
export type ProjectView={
  id:string;title:string;language:'en'|'hi';targetSeconds:30|60|90;durationSeconds?:number;
  state:ProjectState;stage?:string;thumbnail?:string;updatedAt:string;version:number;
  publication?:{state:'published'|'scheduled'|'needs_attention';account:string;scheduledAt?:string;timezone?:string};
  previousReady?:boolean;error?:string;
};
