import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evidenceSnippets,groundScript,modelScriptSchema,ScriptOutputError} from '../src/core/script-evidence';
import {validateSourceReferences} from '../src/core/workspace';

const units=[{id:'page-1',label:'Page 1',text:'Water evaporates in sunlight.\nClouds form when vapor cools.\u00a0Rain falls to the ground.'},{id:'slide-2',label:'Slide 2',text:'Plants use light to turn water and carbon dioxide into sugars.'}];
const scene={title:'Evaporation',narration:'Water evaporates in sunlight.',keywords:['Water'],visual:'highlight',evidenceIds:['s1']};
const raw={title:'A clear explanation',scenes:[scene,{...scene,evidenceIds:['s2']}]};
test('source quotations and page/slide references are copied from supplied snippets',()=>{
 const plan=groundScript(raw,units);assert.equal(plan.scenes[0].evidence[0].quote,units[0].text);assert.deepEqual(plan.scenes[0].sourceRefs,['page-1']);assert.deepEqual(plan.scenes[1].sourceRefs,['slide-2']);assert.doesNotThrow(()=>validateSourceReferences(plan,units));
});
test('unknown references and missing evidence remain rejected',()=>{
 for(const evidenceIds of [['missing-source'],[]])assert.throws(()=>groundScript({...raw,scenes:[{...scene,evidenceIds},scene]},units),e=>e instanceof ScriptOutputError&&e.reason==='evidence');
});
test('model-written quotes and references cannot replace server-owned evidence',()=>{
 const plan=groundScript({...raw,scenes:[{...scene,sourceRefs:['fake-page'],evidence:[{unitId:'fake-page',quote:'Invented facts.'}]},scene]},units);
 assert.deepEqual(plan.scenes[0].sourceRefs,['page-1']);assert.equal(plan.scenes[0].evidence[0].quote,units[0].text);
});
test('snippet splitting preserves PDF whitespace, Unicode and exact source substrings',()=>{
 const text=('An example with a long paragraph and Unicode 🌱 text.\n').repeat(50);const source=[{id:'page-1',label:'Page 1',text}];const snippets=evidenceSnippets(source);assert.ok(snippets.length>1);
 for(const snippet of snippets){assert.ok(text.includes(snippet.quote));assert.ok(snippet.quote.length<=360);assert.ok(!/[\uD800-\uDBFF]$/.test(snippet.quote));assert.ok(!/^[\uDC00-\uDFFF]/.test(snippet.quote));}
 assert.equal(modelScriptSchema(snippets).safeParse({...raw,scenes:[{...scene,evidenceIds:[snippets.at(-1)!.id]},scene]}).success,true);
});
test('idea-only scripts have no source evidence; invalid shape is still rejected',()=>{
 const plan=groundScript({...raw,scenes:[{...scene,evidenceIds:[]},{...scene,evidenceIds:[]}]},[]);assert.deepEqual(plan.scenes[0].sourceRefs,[]);assert.deepEqual(plan.scenes[0].evidence,[]);
 assert.throws(()=>groundScript({...raw,scenes:[{...scene,evidenceIds:[]}]},[]),e=>e instanceof ScriptOutputError&&e.reason==='format');
});
