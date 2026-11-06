import {parsePricing,calculatePrint} from './pricing.mjs';
export const calculatorUrl='https://amas4gm.github.io/print-cost-calculator/';
export const benchyJob=Object.freeze({name:'Benchy practice',printerId:'x2d',materialCost:.25,printHours:1,printMinutes:50,operatorMinutes:0,payRate:0});
export function parseMoney(value){const text=String(value).trim().replace(/^\$\s*/, '');if(!/^(?:\d+)(?:\.\d{1,2})?$/.test(text))return null;const cents=Math.round(Number(text)*100);return Number.isSafeInteger(cents)?cents:null;}
export async function validateBenchyCost(answer){
 const cents=parseMoney(answer);if(cents===null)return {ok:false,message:'Enter the final cost in dollars and cents, for example 2.35.'};
 try{const response=await fetch(new URL('pricing.xml',calculatorUrl),{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Pricing unavailable');const pricing=parsePricing(await response.text()),config=pricing.printers.find(p=>p.id==='x2d');if(!config||pricing.currency!=='USD')throw new Error('X2D pricing unavailable');
 const expected=Math.round(calculatePrint(benchyJob,config).total*100);
 return cents===expected?{ok:true,message:'Correct. This is the AMAS price, including the machine charges added by the calculator.'}:{ok:false,message:'Check X2D, material cost $0.25, 1 hour 50 minutes, and zero staff labor. Use the final Benchy job total from the calculator, not just the slicer’s material cost.'};
 }catch{return {ok:false,message:'The calculator’s current pricing could not be checked. Check your connection, reopen the calculator, and try again.'};}
}
