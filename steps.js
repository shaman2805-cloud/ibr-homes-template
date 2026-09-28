'use strict';
(() => {
 const section=document.querySelector('#steps');
 const viewport=section?.querySelector('.steps-window'),track=section?.querySelector('.timeline');
 if(!track||!viewport)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cards=[...track.children],counter=section.querySelector('.steps-current');
 const clamp=n=>Math.max(0,Math.min(1,n));
 let frame=0,distance=0;
 function draw(){
  frame=0;if(!section.classList.contains('is-horizontal'))return;
  const span=Math.max(1,section.offsetHeight-innerHeight);
  const raw=clamp(-section.getBoundingClientRect().top/span);
  const progress=clamp((raw-.06)/.84);
  track.style.transform=`translate3d(${-distance+distance*progress}px,0,0)`;
  section.style.setProperty('--steps-progress',progress);
  const active=Math.min(cards.length-1,Math.round(progress*(cards.length-1)));
  counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  cards.forEach((card,i)=>card.classList.toggle('step-active',i===active));
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  const active=innerHeight>=560&&!reduced.matches;
  section.classList.toggle('is-horizontal',active);
  if(active){
   section.style.setProperty('--step-width',`${viewport.getBoundingClientRect().width}px`);
   section.style.setProperty('--steps-distance',`${Math.max(2400,innerHeight*3.3)}px`);
   distance=Math.max(0,track.getBoundingClientRect().width-viewport.getBoundingClientRect().width);
  }else{
   track.style.removeProperty('transform');section.style.removeProperty('--step-width');section.style.removeProperty('--steps-distance');
  }
  schedule();
 }
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);addEventListener('load',resize);
 reduced.addEventListener('change',resize);resize();
})();
