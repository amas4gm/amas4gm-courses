// Stable step IDs keep progress independent of display order. Bump version for incompatible lessons.
export function progressKey(lesson){return `amas-tutorial:${lesson.software}:${lesson.id}:v${lesson.version}`;}
export function normalizeProgress(lesson,saved={}){
  const ids=lesson.steps.filter(s=>!s.terminal).map(s=>s.id);
  const supplied=new Set(Array.isArray(saved?.completed)?saved.completed:[]);
  const completed=ids.filter(id=>supplied.has(id));
  const firstIncomplete=lesson.steps.findIndex(s=>!s.terminal&&!supplied.has(s.id));
  const unlocked=firstIncomplete<0?lesson.steps.length-1:firstIncomplete;
  const requested=lesson.steps.findIndex(s=>s.id===saved?.current);
  const practiced=lesson.steps.filter(s=>s.quiz&&!completed.includes(s.id)&&Array.isArray(saved?.practiced)&&saved.practiced.includes(s.id)).map(s=>s.id);
  // A retired step resumes at the next unfinished task, preserving prior work.
  return {current:lesson.steps[Math.max(0,Math.min(requested<0?unlocked:requested,unlocked))].id,completed,practiced};
}
export function loadProgress(lesson,storage){
  try{
    const current=storage.getItem(progressKey(lesson));
    if(current!==null)return normalizeProgress(lesson,JSON.parse(current));
    for(const migration of lesson.progressMigrations||[]){
      const previous=storage.getItem(migration.key);
      if(previous!==null){const migrated=normalizeProgress(lesson,migration.migrate(JSON.parse(previous)));saveProgress(lesson,migrated,storage);return migrated;}
    }
    if(lesson.legacyProgress){
      const old=JSON.parse(storage.getItem(lesson.legacyProgress.key));
      if(old&&Array.isArray(old.completed)){
        const ids=lesson.legacyProgress.stepIds;
        const migrated=normalizeProgress(lesson,{current:ids[old.index],completed:old.completed.filter(Number.isInteger).map(i=>ids[i])});
        saveProgress(lesson,migrated,storage);return migrated;
      }
    }
  }catch{/* Storage may be blocked in an embedded lesson. */}
  return normalizeProgress(lesson);
}
export function saveProgress(lesson,state,storage){try{storage.setItem(progressKey(lesson),JSON.stringify(state));}catch{}}

// Retry clears only this checkpoint, including a pending popup quiz.
export function retryStepProgress(lesson,saved,id){
 const target=lesson.steps.find(s=>s.id===id&&!s.terminal);
 if(!target)return normalizeProgress(lesson,saved);
 return normalizeProgress(lesson,{current:id,completed:(saved.completed||[]).filter(value=>value!==id),practiced:(saved.practiced||[]).filter(value=>value!==id)});
}
export function completedThroughStep(lesson,completed,practiced,index){
 return lesson.steps.slice(0,index+1).filter(s=>completed.has(s.id)||practiced.has(s.id));
}
