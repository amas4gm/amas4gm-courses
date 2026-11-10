import {numericValue} from './state.js';
export function setupValue(raw,setting){
 if(setting==='unitScale'&&!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(raw).trim()))return NaN;
 if(/deg|°/i.test(String(raw)))return NaN;
 return numericValue(raw);
}
export function setupReady(raw,simulation){const value=setupValue(raw,simulation.setting);return Number.isFinite(value)&&value>0&&Math.abs(value-simulation.value)<1e-8;}
