import test from 'node:test';
import assert from 'node:assert/strict';
import lesson from '../bambu-studio/slicing-and-printing/lesson.js';
import {createLayerPractice,validDevice,layerHeight} from '../simulators/bambu-studio/print-state.js';
import {parseMoney,benchyJob,validateBenchyCost} from '../shared/calculator/exercise.js';
import {calculatePrint} from '../shared/calculator/pricing.mjs';
import {normalizeProgress} from '../shared/teaching/progress.js';

test('layer inspection requires lowering then restoring the upper handle',()=>{
 const practice=createLayerPractice();assert.equal(practice.input(599).complete,false);assert.equal(practice.input(301).first,false);
 assert.equal(practice.input(300).first,true);assert.equal(practice.input(250).first,false);assert.equal(practice.input(598).complete,false);assert.equal(practice.input(599).complete,true);
 assert.equal(createLayerPractice().input(599).complete,false);assert.equal(layerHeight(1),.2);assert.ok(Math.abs(layerHeight(599)-48.04)<1e-9);
});
test('either lab device is accepted; invalid stored values are discarded',()=>{assert.equal(validDevice('Steve'),'Steve');assert.equal(validDevice('Candus'),'Candus');assert.equal(validDevice('Tommy'),null);assert.equal(validDevice(null),null);});
test('calculator answers use exact cents and reject malformed amounts',()=>{
 for(const answer of ['1.10','$1.10',' 1.1 '])assert.equal(parseMoney(answer),110);
 for(const answer of ['', '-1.10','1,10','1.109','1e2','NaN','9'.repeat(400)])assert.equal(parseMoney(answer),null);
});
test('supported Benchy inputs produce the reference price with reference rates',()=>{
 const config={per_print:[{name:'Reference sum',amount:.6007816377171216}],time_rates:[{name:'Reference sum',rate_per_hour:.13834}],percentages:[],order_minimum:0};
 assert.equal(Math.round(calculatePrint(benchyJob,config).total*100),110);
 assert.equal(benchyJob.materialCost,lesson.estimates.cost);assert.equal(benchyJob.printMinutes,lesson.estimates.minutes);
});
test('pricing unavailability fails closed with a retry message',async()=>{
 const oldFetch=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('offline');};try{const result=await validateBenchyCost('1.10');assert.equal(result.ok,false);assert.match(result.message,/could not be checked/);}finally{globalThis.fetch=oldFetch;}
});
test('unanswered cost popup stays locked after reload; supports precede billing',()=>{
 const quizIndex=lesson.steps.findIndex(s=>s.id==='read-estimates'),completed=lesson.steps.slice(0,quizIndex).map(s=>s.id);
 const progress=normalizeProgress(lesson,{current:'print-plate',completed,practiced:['read-estimates']});assert.equal(progress.current,'read-estimates');assert.deepEqual(progress.practiced,['read-estimates']);
 assert.equal(lesson.steps[quizIndex].quiz.type,'external-cost');assert.ok(completed.indexOf('enable-support')<completed.indexOf('reslice'));assert.ok(completed.includes('compare-supports'));
});
