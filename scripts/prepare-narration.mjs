import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {software} from '../shared/catalog-data.js';
import {narrationText,spokenText} from '../shared/teaching/narration-text.js';
const manifest={version:1,provider:'ElevenLabs',voice:'Bella',voiceId:'hpp4J3VqNfWAUOO0d1Us',model:'eleven_v4',clips:{},lessons:{}};
const previous=JSON.parse(await readFile(new URL('../shared/narration/manifest.json',import.meta.url),'utf8').catch(()=>'{}'));
for(const app of software)for(const tutorial of app.tutorials){
 const {default:lesson}=await import(`../${app.id}/${tutorial.id}/lesson.js`);
 const steps=manifest.lessons[`${lesson.software}/${lesson.id}`]={};
 for(const step of lesson.steps){
  const fields=steps[step.id]={};
  for(const [kind,display] of Object.entries(narrationText(step))){
   if(!display)continue;
   const text=spokenText(display),id=createHash('sha256').update(`${manifest.voiceId}:${manifest.model}:${text}`).digest('hex').slice(0,20);
   fields[kind]={id,display};manifest.clips[id]??={...previous.clips?.[id],text,file:`${id}.mp3`};
  }
 }
}
await mkdir(new URL('../shared/narration/',import.meta.url),{recursive:true});
await writeFile(new URL('../shared/narration/manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({lessons:Object.keys(manifest.lessons).length,clips:Object.keys(manifest.clips).length,characters:Object.values(manifest.clips).reduce((n,c)=>n+c.text.length,0)}));
