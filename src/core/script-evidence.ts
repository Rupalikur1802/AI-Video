import {z} from 'zod';
import {scriptSchema,scriptSceneSchema,validateSourceReferences,type SourceUnit} from './workspace';

export type EvidenceSnippet={id:string;unitId:string;quote:string};

// The model selects stable IDs. Only the server copies source quotations into a script.
export function evidenceSnippets(units:SourceUnit[]):EvidenceSnippet[]{
 const snippets:EvidenceSnippet[]=[];
 for(const unit of units){
  if(unit.text.trim().length<15)continue;
  for(let start=0;start<unit.text.length;){
   let end=Math.min(start+360,unit.text.length);
   if(end<unit.text.length){
    for(let i=end-1;i>start+180;i--)if(/\s/u.test(unit.text[i])){end=i+1;break;}
    const last=unit.text.charCodeAt(end-1);if(last>=0xd800&&last<=0xdbff)end--;
   }
   const quote=unit.text.slice(start,end).trim();
   if(quote)snippets.push({id:`s${snippets.length+1}`,unitId:unit.id,quote});
   start=end;
  }
 }
 return snippets;
}

export function modelScriptSchema(snippets:EvidenceSnippet[]){
 const ids=snippets.map(s=>s.id);
 const evidenceIds=ids.length?z.array(z.enum(ids as [string,...string[]])).min(1).max(3):z.array(z.string()).max(0);
 return z.object({title:scriptSchema.shape.title,scenes:z.array(scriptSceneSchema.omit({sourceRefs:true,evidence:true}).extend({evidenceIds})).min(2).max(8)});
}

export class ScriptOutputError extends Error{constructor(public reason:'format'|'evidence'){super(reason);}}
export function groundScript(raw:unknown,units:SourceUnit[],snippets=evidenceSnippets(units)){
 const result=modelScriptSchema(snippets).safeParse(raw);
 if(!result.success)throw new ScriptOutputError(result.error.issues.some(i=>i.path.includes('evidenceIds'))?'evidence':'format');
 const known=new Map(snippets.map(s=>[s.id,s]));
 const plan=scriptSchema.parse({...result.data,scenes:result.data.scenes.map(scene=>{
  const {evidenceIds,...rest}=scene;
  const selected=[...new Set(evidenceIds)].map(id=>{const snippet=known.get(id);if(!snippet)throw new ScriptOutputError('evidence');return snippet;});
  return {...rest,sourceRefs:[...new Set(selected.map(s=>s.unitId))],evidence:selected.map(s=>({unitId:s.unitId,quote:s.quote}))};
 })});
 try{validateSourceReferences(plan,units);}catch{throw new ScriptOutputError('evidence');}
 return plan;
}
