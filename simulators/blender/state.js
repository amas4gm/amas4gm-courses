// Pure validation shared by the adapter and regression tests. Values use millimeters.
export function numericValue(raw){
 const match=String(raw).trim().match(/^(-?(?:\d+(?:\.\d*)?|\.\d+))\s*(mm|cm|m|deg|°)?$/i);
 if(!match)return NaN;
 return Number(match[1])*({cm:10,m:1000}[match[2]?.toLowerCase()]||1);
}
export function meetsGoal(raw,goal,kind='length'){if(kind==='length'&&/(deg|°)/i.test(String(raw)))return false;if(kind==='angle'&&/[mc]/i.test(String(raw)))return false;const value=numericValue(raw);return Number.isFinite(value)&&Math.abs(value-goal)<0.001;}
export function checkpointFor(step,completed){return completed?(step.simulation.after||step.simulation.asset):step.simulation.asset;}
