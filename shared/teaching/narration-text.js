// Keep the spoken script tied to the displayed lesson, not a separately edited copy.
export function narrationText(step){
 return {
  description:step.text||'',
  task:step.task||'',
  controls:(step.controls||[]).map(([device,text])=>`${device}. ${text}`).join(' '),
  summary:step.done||'',
  quiz:step.quiz?.prompt||''
 };
}
export function spokenText(text){
 return text.replace(/`([^`]+)`/g,(_,keys)=>keys.replace(/\+/g,' plus '))
  .replace(/\bCtrl\b/g,'Control').replace(/\bNumpad\b/g,'Number pad')
  .replace(/\bMMB\b/g,'middle mouse button').replace(/\bAMS\b/g,'A M S')
  .replace(/\bPLA\b/g,'P L A').replace(/\bSTL\b/g,'S T L')
  .replace(/\bUI\b/g,'user interface').replace(/\b3D\b/g,'three D')
  .replace(/→/g,', then ').replace(/×/g,' by ').replace(/\s+/g,' ').trim();
}
