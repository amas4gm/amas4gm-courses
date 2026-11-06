export function safeReturnUrl(referrer,siteRoot,current){
 try{const url=new URL(referrer);if(!['http:','https:'].includes(url.protocol)||url.href===current)return siteRoot;
   // Never make a tutorial or its credits page its own return destination.
   if(url.origin===new URL(siteRoot).origin&&(url.pathname===new URL(current).pathname||url.pathname.endsWith('/credits.html')))return siteRoot;
   return url.href;
 }catch{return siteRoot;}
}
export function captureReturnToCourse(lesson){
 const root=new URL('../../',import.meta.url).href,key=`amas-return:${lesson.software}:${lesson.id}`;
 // Course authors can supply a full return URL when cross-origin referrer policy omits its path.
 const explicit=new URLSearchParams(location.search).get('returnTo');
 let previous;try{previous=sessionStorage.getItem(key);}catch{}
 const returnUrl=resolveCourseReturn({explicit,referrer:document.referrer,previous,root,current:location.href});
 try{sessionStorage.setItem(key,returnUrl);}catch{}
 return function returnToCourse(){
   // Moodle embeds return to the containing course rather than navigating inside the frame.
   if(window.top!==window.self){try{window.top.location.href=returnUrl;return;}catch{location.assign(returnUrl);return;}}
   if(window.opener||history.length===1){
     try{if(window.opener&&!window.opener.closed)window.opener.focus();window.close();}catch{}
     // Browsers may refuse to close a manually created tab. A real return link still works.
     setTimeout(()=>location.assign(returnUrl),200);return;
   }
   if(document.referrer===returnUrl&&history.length>1){history.back();return;}
   location.assign(returnUrl);
 };
}
export function resolveCourseReturn({explicit,referrer,previous,root,current}){
 if(explicit)return safeReturnUrl(explicit,root,current);
 let selfReferral=false;try{const url=new URL(referrer);selfReferral=url.origin===new URL(current).origin&&(url.pathname===new URL(current).pathname||url.pathname.endsWith('/credits.html'));}catch{}
 if((!referrer||selfReferral)&&previous)return safeReturnUrl(previous,root,current);
 return safeReturnUrl(referrer,root,current);
}
