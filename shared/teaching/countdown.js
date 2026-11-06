// Accumulate visible time only; a background tab must not consume practice time.
export function createCountdown(duration,clock=0){
  let elapsed=0,last=clock;
  return {tick(now,visible=true){if(visible)elapsed+=Math.max(0,Math.min(now-last,100));last=now;return {progress:Math.min(1,elapsed/duration),seconds:Math.max(0,Math.ceil((duration-elapsed)/1000)),done:elapsed>=duration};}};
}
