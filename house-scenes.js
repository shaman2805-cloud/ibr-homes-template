'use strict';
(() => {
 const section=document.querySelector('.photo-construction');
 const model=section?.querySelector('.tech-model');
 const canvas=model?.querySelector('.assembly-canvas');
 if(!canvas)return;
 const pieces=[...canvas.querySelectorAll('.assembly-piece')];
 const final=canvas.querySelector('.assembly-complete');
 const status=section.querySelector('.sequence-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const ease=n=>1-Math.pow(1-clamp(n),3);
 const mobile=()=>innerWidth<=900||innerHeight<=600;
 const stages=[
  {start:0,end:0,x:0,y:0},
  {start:.05,end:.28,x:-125,y:-35},
  {start:.15,end:.40,x:-90,y:-135},
  {start:.27,end:.52,x:0,y:-175},
  {start:.39,end:.64,x:85,y:-140},
  {start:.51,end:.77,x:155,y:-50},
  {start:.64,end:.94,x:0,y:-210}
 ];
 let frame=0,visible=false,last=0,elapsed=0;
 function pose(progress){
  const p=reduced.matches?1:progress;
  pieces.forEach((piece,i)=>{
   const stage=stages[i];
   const t=i===0?1:clamp((p-stage.start)/(stage.end-stage.start));
   const e=ease(t);
   piece.style.opacity=clamp(t*3);
   piece.style.transform=`translate3d(${stage.x*(1-e)}px,${stage.y*(1-e)}px,0)`;
  });
  final.style.opacity=clamp((p-.94)/.06);
  section.style.setProperty('--sequence-progress',p);
  const label=p<.16?'Основание':p<.5?'Стены и остекление':p<.7?'Терраса':p<.94?'Кровля':'Дом собран';
  const translated=window.IBRI18N?.t(label)||label;
  const nextStatus=mobile()&&!reduced.matches?`${translated} ↻`:translated;
  if(status.textContent!==nextStatus)status.textContent=nextStatus;
 }
 function draw(now){
  frame=0;
  if(document.hidden){last=0;return;}
  if(reduced.matches){pose(1);last=0;return;}
  if(mobile()){
   if(!visible){last=0;return;}
   if(last)elapsed+=Math.min(100,now-last);
   last=now;
   const t=elapsed%12000;
   const progress=t<8000?t/8000:t<10500?1:1-(t-10500)/1500;
   pose(progress);frame=requestAnimationFrame(draw);
  }else{
   last=0;
   const progress=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight));
   pose(clamp(progress/.92));
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  canvas.style.setProperty('--assembly-width',`${Math.min(model.clientWidth,model.clientHeight*1.5,1150)}px`);
  last=0;schedule();
 }
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting;
   if(!visible){cancelAnimationFrame(frame);frame=0;last=0;}
   else schedule();
  }).observe(model);
 }else visible=true;
 if('ResizeObserver' in window)new ResizeObserver(resize).observe(model);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);addEventListener('load',resize);
 reduced.addEventListener('change',()=>{elapsed=0;resize();});
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 section.classList.add('assembly-ready');pose(reduced.matches?1:0);resize();
})();
