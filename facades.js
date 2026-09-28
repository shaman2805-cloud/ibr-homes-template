'use strict';
(() => {
 const section=document.querySelector('.facade-scene');
 if(!section)return;
 const images=[...section.querySelectorAll('.facade-image')];
 const buttons=[...section.querySelectorAll('[data-facade]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));
 let frame=0,active=0;
 function paint(progress){
  const position=progress*(images.length-1),lower=Math.floor(position),mix=position-lower;
  images.forEach((img,i)=>img.style.opacity=i===lower?1:i===lower+1?mix:0);
  active=Math.round(position);
  buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
  section.querySelector('.facade-current').textContent=`0${active+1} / 04`;
  section.querySelector('.facade-stage').setAttribute('aria-label',`Дом с фасадом ${buttons[active].textContent.trim()}`);
 }
 function draw(){
  frame=0;if(!section.classList.contains('is-pinned'))return;
  const span=Math.max(1,section.offsetHeight-innerHeight);
  paint(clamp((-section.getBoundingClientRect().top/span-.06)/.84));
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  const pin=innerHeight>=560&&!reduced.matches;
  section.classList.toggle('is-pinned',pin);
  if(pin)schedule();else paint(active/(images.length-1));
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  if(section.classList.contains('is-pinned')){
   const top=scrollY+section.getBoundingClientRect().top;
   const span=section.offsetHeight-innerHeight;
   // Use the same progress range as vertical scrolling, so the color stays selected.
   window.scrollTo({top:top+span*(.06+.84*i/(images.length-1)),behavior:'instant'});
  }
  paint(i/(images.length-1));
 }));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);
 addEventListener('load',resize);reduced.addEventListener('change',resize);resize();
})();
