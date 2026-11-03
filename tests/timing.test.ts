import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captionsFromAlignment,cueTime} from '../src/core/timing';
const alignment=(text:string)=>{const characters=Array.from(text);return {characters,character_start_times_seconds:characters.map((_,i)=>i*.1),character_end_times_seconds:characters.map((_,i)=>(i+1)*.1)};};
test('Hindi caption text preserves conjuncts and vowel marks',()=>{const text='पृथ्वी पर वर्षा होती है।';assert.equal(captionsFromAlignment(alignment(text)).map(c=>c.text).join(' '),text);});
test('cue maps a phrase to its original speech position',()=>{assert.ok(Math.abs(cueTime(alignment('Water rises now'),'rises')-.6)<1e-9);});
test('rejects malformed and nonmonotonic provider timing',()=>{const a=alignment('abc');a.character_start_times_seconds[2]=-1;assert.throws(()=>captionsFromAlignment(a));assert.throws(()=>captionsFromAlignment({...a,characters:[]}));});
test('missing animation anchor is an explicit failure',()=>{assert.throws(()=>cueTime(alignment('clouds form'),'rain'));});
