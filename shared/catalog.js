import {software} from './catalog-data.js?v=blender-1';
const base=new URL('../',import.meta.url),selected=document.body.dataset.software;
const items=selected?software.filter(s=>s.id===selected):software;
const list=document.querySelector('#catalog');
for(const app of items){
 const section=document.createElement('section');section.className='software-section';
 const heading=document.createElement('div');heading.className='software-heading';
 const text=document.createElement('div'),eyebrow=document.createElement('p'),h2=document.createElement('h2'),description=document.createElement('p');
 eyebrow.className='eyebrow';eyebrow.textContent=app.category;h2.textContent=app.name;description.textContent=app.description;
 text.append(eyebrow,h2,description);heading.append(text);
 if(!selected){const a=document.createElement('a');a.className='software-link';a.href=new URL(`${app.id}/`,base);a.textContent=`${app.tutorials.length} tutorial${app.tutorials.length===1?'':'s'} →`;heading.append(a);}
 section.append(heading);const cards=document.createElement('div');cards.className='tutorial-grid';
 for(const lesson of app.tutorials){
  const card=document.createElement('a');card.className='tutorial-card';card.href=new URL(`${app.id}/${lesson.id}/`,base);
  const number=document.createElement('span');number.className='lesson-number';number.textContent=lesson.number;
  const badge=document.createElement('span');badge.className='simulation-badge';badge.textContent='INTERACTIVE SIMULATION';
  const title=document.createElement('h3');title.textContent=lesson.title;const desc=document.createElement('p');desc.textContent=lesson.description;
  const topics=document.createElement('div');topics.className='topics';for(const label of lesson.topics){const span=document.createElement('span');span.textContent=label;topics.append(span);}
  const bottom=document.createElement('div');bottom.className='card-bottom';const detail=document.createElement('span');detail.textContent=`${lesson.steps} guided steps`;const action=document.createElement('strong');action.textContent='Open tutorial →';bottom.append(detail,action);
  card.append(number,badge,title,desc,topics,bottom);cards.append(card);
 }section.append(cards);list.append(section);
}
