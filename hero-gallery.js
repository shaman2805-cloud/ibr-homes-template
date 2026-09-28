'use strict';
(() => {
 const shell=document.querySelector('.hero-scroll'), scene=shell.querySelector('.module-hero');
 const frames=[...scene.querySelectorAll('.hero-frame')],buttons=[...scene.querySelectorAll('[data-hero-slide]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let queued=0,active=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const pinned=()=>innerHeight>600&&!reduced.matches;
 function paint(position){
  const current=Math.min(3,Math.max(0,position)),lower=Math.floor(current),mix=current-lower;
  frames.forEach((image,i)=>{image.style.opacity=i===lower?1:i===lower+1?mix:0;image.style.transform=reduced.matches?'none':`scale(${1+Math.max(0,current-i)*.025})`;});
  active=Math.round(current);buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
  scene.querySelector('.hero-scroll-cue span').textContent=`0${active+1} / 04`;
  scene.style.setProperty('--hero-progress',current/3);
  // Copy remains readable over all four photographs.
  scene.style.setProperty('--hero-copy-opacity',1);scene.style.setProperty('--hero-copy-y','0px');
 }
 function draw(){queued=0;if(!pinned())return;const p=clamp(-shell.getBoundingClientRect().top/(shell.offsetHeight-innerHeight));paint(clamp((p-.06)/.84)*3);}
 function schedule(){if(!queued)queued=requestAnimationFrame(draw);}
 function choose(i){
  i=(i+4)%4;
  if(pinned()){const y=scrollY+shell.getBoundingClientRect().top+(shell.offsetHeight-innerHeight)*(.06+.84*i/3);scrollTo({top:y,behavior:'instant'});}
  paint(i);
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>choose(i)));
 let start=null;
 scene.addEventListener('touchstart',e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 scene.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)choose(active+(dx<0?1:-1));start=null;},{passive:true});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',()=>pinned()?schedule():paint(active));
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(entries[0].isIntersecting)frames.slice(1).forEach(i=>i.loading='eager');},{rootMargin:'100px'}).observe(scene);
 paint(0);schedule();
})();
