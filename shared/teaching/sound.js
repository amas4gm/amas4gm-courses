export function createSound(button){
const $=()=>button;
let soundOn=true,audioContext;
try{soundOn=localStorage.getItem('amas-course-sound')!=='off';}catch{}
function updateSoundButton(){$('#sound-toggle').textContent=soundOn?'♪ Sound on':'♪ Sound off';$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));}
updateSoundButton();
$('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem('amas-course-sound',soundOn?'on':'off');}catch{}updateSoundButton();if(soundOn)playCue('success');});
function playCue(kind){
  if(!soundOn)return;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    const notes=kind==='partial'?[659]:kind==='retry'?[196,147]:kind==='complete'?[523,659,784,1047]:[523,784];
    const now=audioContext.currentTime;
    notes.forEach((frequency,i)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=now+i*.105;
      oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.055,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.18);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.2);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
  }catch{/* Sound is optional; the lesson remains usable without audio support. */}
}

return {play:playCue,dispose(){audioContext?.close();}};
}
