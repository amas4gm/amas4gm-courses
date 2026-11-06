import test from 'node:test';
import assert from 'node:assert/strict';
import lesson from '../bambu-studio/getting-started/lesson.js';
import {loadProgress,saveProgress,normalizeProgress,progressKey} from '../shared/teaching/progress.js';
import {createCountdown} from '../shared/teaching/countdown.js';
import {safeReturnUrl,resolveCourseReturn} from '../shared/teaching/return-to-course.js';
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('legacy progress migrates by the old ordering and requires the new Top task',()=>{
 const storage=memory();storage.setItem(lesson.legacyProgress.key,JSON.stringify({index:14,completed:Array.from({length:14},(_,i)=>i)}));
 const state=loadProgress(lesson,storage);
 assert.equal(state.current,'top-view');assert.equal(state.completed.length,13);assert.ok(!state.completed.includes('check'));assert.ok(!state.completed.includes('top-view'));
 assert.deepEqual(JSON.parse(storage.getItem(progressKey(lesson))),state);
});
test('resume before the inserted step retains the current lesson',()=>{
 const storage=memory();storage.setItem(lesson.legacyProgress.key,JSON.stringify({index:8,completed:[0,1,2,3,4,5,6,7]}));
 assert.equal(loadProgress(lesson,storage).current,'import-model');
});
test('restart overrides legacy progress without clearing another tutorial',()=>{
 const storage=memory(),other={...lesson,id:'orienting-models'};
 saveProgress(other,{current:'pan',completed:['prepare']},storage);
 storage.setItem(lesson.legacyProgress.key,JSON.stringify({index:2,completed:[0,1]}));
 saveProgress(lesson,{current:'prepare',completed:[]},storage);
 assert.equal(loadProgress(lesson,storage).current,'prepare');assert.deepEqual(loadProgress(lesson,storage).completed,[]);
 assert.equal(JSON.parse(storage.getItem(progressKey(other))).current,'pan');
});
test('malformed or unavailable storage cannot block a lesson',()=>{
 const storage=memory();storage.setItem(progressKey(lesson),'invalid');assert.equal(loadProgress(lesson,storage).current,'prepare');
 assert.equal(loadProgress(lesson,undefined).current,'prepare');assert.doesNotThrow(()=>saveProgress(lesson,{},undefined));
 assert.equal(normalizeProgress(lesson,{current:'complete',completed:['nonsense']}).current,'prepare');
});
test('a completed new task unlocks retained later progress',()=>{
 const all=lesson.steps.filter(s=>!s.terminal).map(s=>s.id);
 assert.equal(normalizeProgress(lesson,{current:'complete',completed:all}).current,'complete');
});
test('countdown pauses when hidden and needs five seconds of visible practice',()=>{
 const timer=createCountdown(5000,0);let result;
 for(let t=100;t<=2000;t+=100)result=timer.tick(t);assert.equal(result.progress,.4);
 for(let t=2100;t<=10000;t+=100)result=timer.tick(t,false);assert.equal(result.progress,.4);
 for(let t=10100;t<=12900;t+=100)result=timer.tick(t);assert.equal(result.done,false);
 result=timer.tick(13000);assert.equal(result.done,true);assert.equal(result.seconds,0);
});
test('lesson supplies one Top-view task directly after zoom and includes an import effect',()=>{
 const zoom=lesson.steps.findIndex(s=>s.id==='zoom');assert.equal(lesson.steps[zoom+1].id,'top-view');
 assert.equal(lesson.steps.filter(s=>!s.terminal).length,14);
 assert.ok(!lesson.steps.some(s=>s.id==='check'));assert.ok(lesson.steps[zoom+1].quiz);
 assert.deepEqual(lesson.steps.find(s=>s.id==='import-model').simulation.effects,{modelVisible:true});
 assert.equal(lesson.initialState.modelVisible,false);assert.equal(lesson.initialState.view,'home');
});
test('a pending popup quiz survives reload and cannot unlock the next step',()=>{
 const completed=lesson.steps.slice(0,-2).map(s=>s.id),storage=memory();
 saveProgress(lesson,{current:'complete',completed,practiced:['top-view']},storage);
 const state=loadProgress(lesson,storage);assert.equal(state.current,'top-view');assert.deepEqual(state.practiced,['top-view']);assert.ok(!state.completed.includes('top-view'));
});
test('version one migration distinguishes camera completion from passing its old quiz',()=>{
 const storage=memory(),completed=lesson.steps.filter(s=>!s.terminal).map(s=>s.id),key=lesson.progressMigrations[0].key;
 storage.setItem(key,JSON.stringify({current:'check',completed}));
 const pending=loadProgress(lesson,storage);assert.equal(pending.current,'top-view');assert.deepEqual(pending.practiced,['top-view']);assert.ok(!pending.completed.includes('top-view'));
 const finished=memory();finished.setItem(key,JSON.stringify({current:'complete',completed:[...completed,'check']}));
 const state=loadProgress(lesson,finished);assert.equal(state.current,'complete');assert.equal(state.completed.length,14);assert.deepEqual(state.practiced,[]);
});
test('return destination preserves course and catalog links with a safe fallback',()=>{
 const root='https://example.org/course/',current=root+'software/intro/';
 assert.equal(safeReturnUrl(root,root,current),root);
 assert.equal(safeReturnUrl('https://moodle.example/course/view.php?id=5',root,current),'https://moodle.example/course/view.php?id=5');
 assert.equal(safeReturnUrl('javascript:alert(1)',root,current),root);
 assert.equal(safeReturnUrl('',root,current),root);
 assert.equal(safeReturnUrl(current+'?embed=1',root,current),root);
});
test('a fresh catalog launch replaces a previously remembered external course',()=>{
 const root='https://example.org/course/',current=root+'software/intro/',previous='https://moodle.example/course/view.php?id=5';
 assert.equal(resolveCourseReturn({root,current,previous,referrer:root}),root);
 assert.equal(resolveCourseReturn({root,current,previous,referrer:''}),previous);
 assert.equal(resolveCourseReturn({root,current,previous,referrer:previous,explicit:root}),root);
});
