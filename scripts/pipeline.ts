import {config} from 'dotenv';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {v2 as cloudinary} from 'cloudinary';
import {planSchema, type Alignment, type Language, type Video} from '../src/core/model';
import {fixturePlan} from '../src/core/fixtures';
import {captionsFromAlignment, cueTime} from '../src/core/timing';

config({path:'.env.local',quiet:true} as Parameters<typeof config>[0]);
const [command='doctor',rawLanguage='en']=process.argv.slice(2);
if (!['en','hi'].includes(rawLanguage)) throw new Error('Language must be en or hi');
const language=rawLanguage as Language;
const output=path.resolve('out',language);
const requireEnv=(key:string)=>{const value=process.env[key]?.trim();if(!value)throw new Error(`Missing configuration: ${key}`);return value;};
async function request(url:string,init:RequestInit) {
  const response=await fetch(url,{...init,signal:AbortSignal.timeout(120000)});
  if(!response.ok) {
    const provider=new URL(url).hostname.includes('googleapis')?'Gemini':'ElevenLabs';
    const payload=await response.json().catch(()=>null);
    let message=String(payload?.error?.message||payload?.detail?.message||'Check credentials, model access, or free quota.');
    for(const [name,value] of Object.entries(process.env))if(value&&/KEY|SECRET|TOKEN/.test(name))message=message.replaceAll(value,'[redacted]');
    throw new Error(`${provider} request failed (${response.status}): ${message}. No automatic retry was made.`);
  }
  return response.json();
}
async function main(){
  await mkdir(output,{recursive:true});
  if(command==='doctor'){
    for(const name of ['GEMINI_API_KEY','GEMINI_MODEL','ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID_EN','ELEVENLABS_VOICE_ID_HI','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'])console.log(`${name}: ${process.env[name]?.trim()?'configured':'missing'}`);
    console.log(`ElevenLabs use confirmed: ${process.env.ELEVENLABS_USE_CONFIRMED==='true'}`);return;
  }
  if(command==='fixture'||command==='generate'||command==='narrate'){
    const fixture=command==='fixture';
    let plan=fixturePlan(language);
    if(command==='narrate')plan=planSchema.parse(JSON.parse(await readFile(path.join(output,'plan.json'),'utf8')));
    if(!fixture&&command!=='narrate'){
      const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
      const result=await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':requireEnv('GEMINI_API_KEY')},body:JSON.stringify({contents:[{parts:[{text:`Write a factually correct 30-second water cycle explainer for children, in ${language==='hi'?'Hindi using Devanagari':'English'}. Return JSON only matching this example structure: ${JSON.stringify(fixturePlan(language))}. Keep the exact five scene kinds and order. Use about ${language==='hi'?'60':'65'} words TOTAL across all narration. Each cuePhrase must be a verbatim phrase in its narration. No markdown.`}]}],generationConfig:{responseMimeType:'application/json'}})});
      const text=result.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join('');
      plan=planSchema.parse(JSON.parse(text));
      if(plan.language!==language)throw new Error('Provider returned wrong language');
    }
    await writeFile(path.join(output,'plan.json'),JSON.stringify(plan,null,2));
    const video:Video={title:plan.title,language,fixture,fps:30,durationInFrames:0,scenes:[]};
    for(let i=0;i<plan.scenes.length;i++){
      const scene=plan.scenes[i];let alignment:Alignment;let audioSrc:string|undefined;
      if(fixture){
        const chars=Array.from(scene.narration),step=5.6/chars.length;
        alignment={characters:chars,character_start_times_seconds:chars.map((_,j)=>j*step),character_end_times_seconds:chars.map((_,j)=>(j+1)*step)};
      }else{
        if(process.env.ELEVENLABS_USE_CONFIRMED!=='true')throw new Error('Set ELEVENLABS_USE_CONFIRMED=true after confirming permitted use; narration was not requested.');
        const voice=requireEnv(`ELEVENLABS_VOICE_ID_${language.toUpperCase()}`);
        const result=await request(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':requireEnv('ELEVENLABS_API_KEY')},body:JSON.stringify({text:scene.narration,model_id:process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2',language_code:language,voice_settings:{stability:.65,similarity_boost:.75}})});
        alignment=result.normalized_alignment||result.alignment;
        if(!alignment||!result.audio_base64)throw new Error('Narration missing audio or alignment');
        captionsFromAlignment(alignment);
        audioSrc=`generated/${language}/scene-${i}.mp3`;
        await mkdir(path.resolve('public/generated',language),{recursive:true});
        await writeFile(path.resolve('public',audioSrc),Buffer.from(result.audio_base64,'base64'));
        await writeFile(path.join(output,`alignment-${i}.json`),JSON.stringify(alignment,null,2));
      }
      const captions=captionsFromAlignment(alignment);
      const end=alignment.character_end_times_seconds.at(-1)!;
      const durationInFrames=fixture?180:Math.ceil((end+.4)*30);
      video.scenes.push({...scene,startFrame:video.durationInFrames,durationInFrames,audioSrc,captions,cueSeconds:cueTime(alignment,scene.cuePhrase)});
      video.durationInFrames+=durationInFrames;
      console.log(`${language}: scene ${i+1}/5 prepared`);
    }
    // Hold the closing takeaway when speech finishes early; never cut narration.
    if(video.durationInFrames<900){
      video.scenes[video.scenes.length-1].durationInFrames+=900-video.durationInFrames;
      video.durationInFrames=900;
    }
    await writeFile(path.join(output,'video.json'),JSON.stringify(video,null,2));
    console.log(`Saved ${fixture?'silent fixture':'narrated composition'} (${(video.durationInFrames/30).toFixed(1)}s). Run npm run render -- ${language}`);return;
  }
  if(command==='render'||command==='still'){
    const video=JSON.parse(await readFile(path.join(output,'video.json'),'utf8')) as Video;
    const serveUrl=await bundle({entryPoint:path.resolve('src/video/index.ts'),publicDir:path.resolve('public')});
    const inputProps={video};const composition=await selectComposition({serveUrl,id:'WaterCycle',inputProps});
    if(command==='still'){
      await renderStill({serveUrl,composition,inputProps,frame:300,output:path.join(output,'preview.png')});
      console.log(`Preview: ${path.join(output,'preview.png')}`);return;
    }
    let last=-1;
    await renderMedia({serveUrl,composition,inputProps,codec:'h264',outputLocation:path.join(output,'water-cycle.mp4'),concurrency:2,onProgress:({progress})=>{const percent=Math.floor(progress*10)*10;if(percent!==last){last=percent;console.log(`Render ${percent}%`);}}});
    console.log(`Rendered: ${path.join(output,'water-cycle.mp4')}`);return;
  }
  if(command==='upload'){
    const video=JSON.parse(await readFile(path.join(output,'video.json'),'utf8')) as Video;
    if(video.fixture)throw new Error('Silent fixtures are not uploaded as completed narrated videos.');
    cloudinary.config({cloud_name:requireEnv('CLOUDINARY_CLOUD_NAME'),api_key:requireEnv('CLOUDINARY_API_KEY'),api_secret:requireEnv('CLOUDINARY_API_SECRET'),secure:true});
    const result=await cloudinary.uploader.upload(path.join(output,'water-cycle.mp4'),{resource_type:'video',folder:'sochitra/poc',overwrite:false});
    await writeFile(path.join(output,'cloudinary.json'),JSON.stringify({publicId:result.public_id,url:result.secure_url,duration:result.duration},null,2));
    console.log(`Uploaded: ${result.secure_url}`);return;
  }
  throw new Error('Unknown command');
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Pipeline failed');process.exitCode=1;});
