'use strict';
(()=>{
 const section=document.querySelector('.tech-story'),track=section?.querySelector('.tech-story-track');if(!track)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,current=0,distance=0,last=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function resize(){distance=Math.max(0,track.scrollWidth-innerWidth+innerWidth*.034);section.style.setProperty('--tech-distance',`${Math.max(3200,distance*1.4+1400)}px`);schedule();}
 function draw(now){frame=0;const dt=Math.min(64,now-last||16);last=now;
  const active=innerHeight>600&&!reduced.matches;
  const p=active?clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)):0;
  const target=clamp((p-.38)/.59);current=active?current+(target-current)*(1-Math.exp(-dt/100)):0;
  track.style.transform=active?`translate3d(${-distance*current}px,0,0)`:'';track.style.setProperty('--mobile-tech-transform',active?`translate3d(${-distance*current}px,0,0)`:'none');
  section.querySelector('.tech-story-count').textContent=current<.02?'КОНСТРУКЦИЯ → ДЕТАЛИ':`${Math.min(6,Math.max(1,Math.ceil(current*6)))} / 6 ПРЕИМУЩЕСТВ`;
  section.querySelectorAll('.tech-feature').forEach(card=>{const r=card.getBoundingClientRect();card.classList.toggle('tech-feature-active',!active||r.left<innerWidth*.95&&r.right>0);});
  if(Math.abs(target-current)>.0006&&active)frame=requestAnimationFrame(draw);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);addEventListener('load',resize);reduced.addEventListener('change',resize);resize();
})();

(()=>{
 const media=document.querySelector('[data-ambient]');if(!media)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let visible=false,loaded=false;
 const sync=()=>{if(visible&&!loaded){media.load();loaded=true;}if(visible&&!reduce.matches)media.play().catch(()=>{});else media.pause();};
 if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();},{rootMargin:'150px'}).observe(media);
 else{visible=true;sync();}
 reduce.addEventListener('change',sync);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)media.pause();else sync();});
})();
