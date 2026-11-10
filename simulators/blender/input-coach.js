// Lesson guidance stays outside Blender; only the demonstrator overlays the viewport.
export function createInputCoach({stage,container,onDemonstrate}){
 const panel=document.createElement('div');panel.className='bl-input-coach';
 const title=document.createElement('strong'),sequence=document.createElement('div'),hint=document.createElement('p'),demo=document.createElement('button');sequence.className='bl-key-sequence';demo.type='button';demo.textContent='Show the input';
 panel.append(title,sequence,hint,demo);demo.addEventListener('click',()=>onDemonstrate());
 const mount=document.querySelector('.task-box')||container;mount.append(panel);
 let keys=[];
 function animateKeys(){sequence.classList.remove('demonstrating');void sequence.offsetWidth;sequence.classList.add('demonstrating');}
 function keycap(text){const k=document.createElement('kbd');k.textContent=text;return k;}
 return {
  setStep(step){sequence.classList.remove('demonstrating');keys=step.keys||[];title.textContent=keys.length?'Keys in order':'Mouse control';sequence.replaceChildren();keys.forEach((key,i)=>{const group=document.createElement('span');group.className='bl-key-group';group.dataset.key=key;for(const [j,part] of key.split('+').entries()){if(j)group.append('+');group.append(keycap(part));}group.style.setProperty('--key-order',i);sequence.append(group);if(i<keys.length-1)sequence.append(document.createTextNode(' → '));});hint.textContent=step.inputHint||'The highlighted control is your next action.';panel.hidden=!!step.terminal;
   const task=document.querySelector('#task');if(task){task.replaceChildren();for(const [i,part] of step.task.split('`').entries())task.append(i%2?keycap(part):document.createTextNode(part));}
  },
  help(message,correction,{animate=true}={}){hint.textContent=message;if(correction){title.textContent='Try this input';sequence.replaceChildren();correction.forEach((key,i)=>{const group=document.createElement('span');group.className='bl-key-group';group.dataset.key=key;group.style.setProperty('--key-order',i);key.split('+').forEach((part,j)=>{if(j)group.append('+');group.append(keycap(part));});sequence.append(group);if(i<correction.length-1)sequence.append(document.createTextNode(' → '));});}sequence.classList.remove('demonstrating');if(animate)animateKeys();},
  animateKeys,
  pressed(key){for(const el of sequence.children)el.classList.toggle('pressed',el.dataset.key?.toLowerCase()===key.toLowerCase());},
  hint(message){hint.textContent=message;},
  dispose(){panel.remove();}
 };
}
