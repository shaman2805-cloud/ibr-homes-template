'use strict';
(()=>{
 const section=document.querySelector('.tech-story'),track=section?.querySelector('.tech-story-track'),viewport=section?.querySelector('.tech-feature-viewport');if(!track||!viewport)return;
 const cards=[...track.querySelectorAll('.tech-feature')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,current=0,distance=0,last=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function resize(){
  const active=innerHeight>600&&!reduced.matches;
  section.classList.toggle('is-scrubbing',active);
  distance=Math.max(0,track.scrollWidth-viewport.clientWidth);
  section.style.setProperty('--tech-distance',`${Math.max(3000,(cards.length-1)*innerHeight*.7)}px`);schedule();
 }
 function draw(now){frame=0;const dt=Math.min(64,now-last||16);last=now;
  const active=section.classList.contains('is-scrubbing');
  const p=active?clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)):0;
  current=active?current+(p-current)*(1-Math.exp(-dt/85)):0;
  track.style.setProperty('--tech-offset',`${-distance*current}px`);
  section.querySelector('.tech-story-count').textContent=`${Math.min(cards.length,Math.round(current*(cards.length-1))+1)} / ${cards.length} ПРЕИМУЩЕСТВ`;
  const bounds=viewport.getBoundingClientRect();
  cards.forEach(card=>{const r=card.getBoundingClientRect();card.classList.toggle('tech-feature-active',!active||r.left<bounds.right-10&&r.right>bounds.left+10);});
  if(Math.abs(p-current)>.0006&&active)frame=requestAnimationFrame(draw);
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
