'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const chapters=[...document.querySelector('main').children].slice(1);
 const cards=[...document.querySelectorAll('.clt-details article')];
 const stack=document.querySelector('.clt-explainer');
 let frame=0;
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting||entry.boundingClientRect.top<0){entry.target.classList.add('chapter-visible');observer.unobserve(entry.target);}
  }),{rootMargin:'0px 0px -12% 0px',threshold:0});
  chapters.forEach(chapter=>{chapter.classList.add('chapter-enter');observer.observe(chapter);});
  const details=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('detail-visible');details.unobserve(entry.target);}
  }),{threshold:.1});
  cards.forEach(card=>details.observe(card));
 }else cards.forEach(card=>card.classList.add('detail-visible'));
 function draw(){
  frame=0;if(!stack||reduced.matches)return;
  const progress=Math.max(0,Math.min(1,(innerHeight-stack.getBoundingClientRect().top)/(innerHeight+stack.offsetHeight)));
  stack.style.setProperty('--clt-spread',`${28*(1-progress)}px`);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);schedule();
})();
