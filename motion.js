'use strict';
(() => {
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const shell=$('.circle-shell');if(!shell)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const scene=shell.querySelector('.circle-scene'), stages=[...scene.querySelectorAll('article')];
 stages.forEach((stage,i)=>{
  stage.classList.remove('reveal');
  const ring=document.createElementNS('http://www.w3.org/2000/svg','svg');ring.setAttribute('viewBox','0 0 100 100');ring.setAttribute('aria-hidden','true');ring.classList.add('stage-ring');
  for(let n=0;n<2;n++){const c=document.createElementNS(ring.namespaceURI,'circle');for(const [k,v] of Object.entries({cx:50,cy:50,r:49,pathLength:1}))c.setAttribute(k,v);ring.append(c);}
  const counter=document.createElement('span');counter.className='circle-counter';counter.textContent=`0${i+1}`;counter.setAttribute('aria-hidden','true');stage.prepend(ring,counter);
 });
 const caption=document.createElement('div');caption.className='circle-scroll-caption';caption.setAttribute('aria-hidden','true');caption.innerHTML='<span>ОТ ИДЕИ — К ВАШЕМУ ДОМУ</span><i></i><span class="circle-step-label">01 / 03</span>';scene.append(caption);
 const selectors=['.module-heading>.tag','.module-heading>p','.estimate-section>div>p','.estimate-buttons','.advisor-card','.catalog-tabs','.catalog-card','.site-placement .tag','.site-placement ul','.site-placement .big-button','.module-faq>div:first-child','.faq-list details','.question-strip','.journal-card','.social-strip','.inspiration>.caption','footer>.tag','footer>h2','.footer-links','.footer-nav','.footer-bottom'];
 const revealEls=[];
 selectors.forEach(selector=>$$(selector).forEach((el,i)=>{if(el.classList.contains('reveal'))return;el.dataset.motion='rise';el.style.setProperty('--motion-delay',`${Math.min(i%3,2)*85}ms`);revealEls.push(el);}));
 $$('.inspiration-image').forEach(el=>{el.dataset.motion='image';revealEls.push(el);});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting)entry.target.classList.add('motion-in');
   // Re-arm only after fully leaving below the viewport. Scrolling back never hides text being read.
   else if(entry.boundingClientRect.top>innerHeight+60)entry.target.classList.remove('motion-in');
  }),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  revealEls.forEach(el=>observer.observe(el));
 }else revealEls.forEach(el=>el.classList.add('motion-in'));
 // Reveal each content detail when its own position enters the viewport.
 const details=$$('.benefits-grid article>*,.technical-grid article>*,.timeline article>*,.story-row>.tag,.statement>*,.service-card h3,.service-card p,.service-card .tag,.site-placement li,.journal-card h3,.journal-card p,.footer-nav a,.footer-links a');
 if('IntersectionObserver' in window){
  const detailObserver=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('detail-in',e.isIntersecting || e.boundingClientRect.top<0);}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  details.forEach((el,i)=>{el.classList.add('motion-detail');el.style.setProperty('--detail-delay',`${i%3*65}ms`);detailObserver.observe(el);});
 }
 const heroShell=$('.hero-scroll'),heroScene=$('.module-hero');let heroCurrent=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 let frame=0, current=0, target=0, last=0;
 function render(now){
  frame=0;
  const dt=Math.min(64,now-last||16);last=now;
  const fixed=innerHeight>600&&!reduced.matches;
  let heroTarget=0;
  if(heroShell){
   const h=heroShell.getBoundingClientRect();
   heroTarget=reduced.matches?0:clamp(-h.top/Math.max(1,heroShell.offsetHeight-innerHeight));
   heroCurrent=reduced.matches?0:heroCurrent+(heroTarget-heroCurrent)*(1-Math.exp(-dt/90));
   const dissolve=clamp((heroCurrent-.3)/.3), textOut=clamp(heroCurrent/.24), nextText=clamp((heroCurrent-.6)/.18);
   heroScene.style.setProperty('--hero-zoom',1+heroCurrent*.48);
   heroScene.style.setProperty('--hero-dissolve',dissolve);
   heroScene.style.setProperty('--hero-next-zoom',1.18-clamp((heroCurrent-.3)/.7)*.15);
   heroScene.style.setProperty('--hero-copy-opacity',1-textOut);
   heroScene.style.setProperty('--hero-copy-y',`${-textOut*65}px`);
   heroScene.style.setProperty('--hero-chapter-opacity',nextText);
   heroScene.style.setProperty('--hero-chapter-y',`${(1-nextText)*45}px`);
   heroScene.style.setProperty('--hero-progress',heroCurrent);
   heroScene.querySelector('.hero-scroll-cue span').textContent=heroCurrent<.48?'01 / 02':'02 / 02';
  }
  const rect=shell.getBoundingClientRect();
  target=fixed?clamp(-rect.top/Math.max(1,shell.offsetHeight-innerHeight)):clamp((innerHeight-rect.top)/(shell.offsetHeight+innerHeight*.35));
  current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt/75));
  scene.style.setProperty('--scene-progress',current.toFixed(4));scene.style.setProperty('--scene-scale',(1.06+current*.06).toFixed(4));
  const merge= fixed?clamp((current-.48)/.4):0;
  const easedMerge=merge*merge*(3-2*merge);
  const copyOpacity=1-clamp((current-.48)/.18);
  const logoOpacity=fixed?clamp((current-.82)/.13):1;
  const content=scene.querySelector('.circle-content'), brand=scene.querySelector('.merged-brand');
  scene.style.setProperty('--merge-logo-opacity',logoOpacity);
  scene.style.setProperty('--merge-logo-scale',.88+logoOpacity*.12);
  stages.forEach((stage,i)=>{
   const p=fixed?clamp((current-i*.045)/.22):1;
   const ease=1-Math.pow(1-p,3);
   const dx=content.clientWidth/2-stage.offsetLeft-stage.offsetWidth/2;
   const dy=content.clientHeight/2-stage.offsetTop-stage.offsetHeight/2;
   const endScale=brand.offsetWidth/Math.max(1,stage.offsetWidth);
   stage.style.setProperty('--stage-x',`${dx*easedMerge}px`);
   stage.style.setProperty('--stage-y',`${dy*easedMerge+(1-ease)*50*(1-easedMerge)}px`);
   stage.style.setProperty('--stage-scale',(.92+ease*.08)*(1-easedMerge)+endScale*easedMerge);
   stage.style.setProperty('--stage-opacity',fixed?(0.35+ease*.65)*(1-clamp((current-.88)/.09)):1);
   stage.style.setProperty('--stage-ring',p);
   stage.style.setProperty('--circle-copy-opacity',fixed?copyOpacity:1);
  });
  $('.circle-step-label').textContent=current>.85?'IBR HOMES':`${String(Math.min(3,Math.floor(current/.16)+1)).padStart(2,'0')} / 03`;
  const placement=$('.site-placement'), footer=$('footer');
  if(placement){const r=placement.getBoundingClientRect();const p=clamp((innerHeight-r.top)/(innerHeight+r.height));placement.style.setProperty('--placement-y',`${reduced.matches?0:(p-.5)*70}px`);}
  if(footer){const r=footer.getBoundingClientRect();const p=clamp((innerHeight-r.top)/Math.max(1,innerHeight*.8));footer.style.setProperty('--footer-y',`${reduced.matches?0:(1-p)*65}px`);footer.style.setProperty('--footer-opacity',reduced.matches?1:.4+p*.6);}
  if((Math.abs(target-current)>.0008||Math.abs(heroTarget-heroCurrent)>.0008)&&!reduced.matches)frame=requestAnimationFrame(render);
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
 document.body.classList.add('motion-ready');
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);reduced.addEventListener('change',schedule);schedule();
})();
