export function createGuidance(root){
  const arrow=document.createElement('div');arrow.id='click-guide';arrow.setAttribute('aria-hidden','true');
  arrow.innerHTML='<svg viewBox="0 0 80 110"><path d="M40 5 8 40h20v61h24V40h20Z"/></svg>';
  function clear(){root.querySelectorAll('.active-target').forEach(el=>{el.classList.remove('active-target');el.removeAttribute('aria-current');});arrow.hidden=true;}
  return {update(spec){
    clear();if(!spec?.target)return;
    const {target,parent,scale=1,anchorY,above=false}=spec;
    target.classList.add('active-target');target.setAttribute('aria-current','step');
    parent.append(arrow);arrow.hidden=false;arrow.classList.toggle('dialog-guide',parent.tagName==='DIALOG');
    const base=parent.getBoundingClientRect(),rect=target.getBoundingClientRect();
    arrow.style.left=`${(rect.left+rect.width/2-base.left)/scale}px`;
    arrow.style.transform=`translateX(-50%)${above?' rotate(180deg)':''}`;
    arrow.style.top=`${above?(rect.top-base.top)/scale-106:((anchorY??rect.bottom)-base.top)/scale+6}px`;
  },clear,dispose(){clear();arrow.remove();}};
}
