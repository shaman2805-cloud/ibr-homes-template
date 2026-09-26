'use strict';
(() => {
 const construction=document.querySelector('#construction'), orbit=document.querySelector('#house-orbit');
 if(!construction||!orbit)return;
 const video=construction.querySelector('video'),picture=orbit.querySelector('img');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const progress=el=>reduce.matches?0:clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
 let raf=0,current=0,last=0,started=false,wantedTime=0,wantedFrame=1,shownFrame=1;
 const cache=new Map();
 function frameUrl(n){return `assets/assembly/${String(n).padStart(2,'0')}.webp`;}
 function getFrame(n){
  if(n<1||n>75||cache.has(n))return;
  const image=new Image();cache.set(n,image);image.onload=()=>{if(n===wantedFrame){picture.src=image.src;shownFrame=n;}};image.src=frameUrl(n);
  if(cache.size>14){for(const key of cache.keys()){if(Math.abs(key-wantedFrame)>5){cache.delete(key);if(cache.size<=10)break;}}}
 }
 function seek(){if((innerHeight<=600)&&!reduce.matches)return;if(video.readyState>=1&&!video.seeking&&Math.abs(video.currentTime-wantedTime)>.045)video.currentTime=wantedTime;}
 video.addEventListener('seeked',seek);
 video.addEventListener('loadedmetadata',()=>{schedule();});video.addEventListener('loadeddata',seek);
 video.addEventListener('error',()=>{construction.querySelector('.sequence-status').textContent='Видео недоступно';});
 function render(now){
  raf=0;const dt=Math.min(64,now-last||16);last=now;
  const raw=progress(construction),a=raw,b=progress(orbit);
  construction.style.setProperty('--sequence-progress',a);orbit.style.setProperty('--sequence-progress',b);
  const r=construction.getBoundingClientRect();
  if(!started&&r.top<innerHeight*2){started=true;fetch('assets/assembly/construction.mp4').then(r=>{if(!r.ok)throw new Error('video');return r.blob();}).then(blob=>{video.src=URL.createObjectURL(blob);video.load();}).catch(()=>{construction.querySelector('.sequence-status').textContent='Видео недоступно';});}
  if(Number.isFinite(video.duration)&&video.duration>0){
   const small=innerHeight<=600;
   if(small&&!reduce.matches){
    const model=construction.querySelector('.tech-model').getBoundingClientRect();
    if(model.top<innerHeight&&model.bottom>0){video.loop=true;if(video.paused)video.play().catch(()=>{});}else video.pause();
   }else{video.pause();video.loop=false;wantedTime=(reduce.matches?1:a)*Math.max(0,video.duration-.06);seek();}
   construction.querySelector('.sequence-status').textContent=`${reduce.matches?100:Math.round(a*100)}%`;
  }
  current=reduce.matches?0:current+(b-current)*(1-Math.exp(-dt/150));
  wantedFrame=1+Math.round(current*74);
  const or=orbit.getBoundingClientRect();
  if(or.top<innerHeight*2&&or.bottom> -innerHeight){
   getFrame(wantedFrame);const ready=cache.get(wantedFrame);
   if(ready?.complete&&ready.naturalWidth&&shownFrame!==wantedFrame){picture.src=ready.src;shownFrame=wantedFrame;}
   for(const n of [wantedFrame+1,wantedFrame-1,wantedFrame+2,wantedFrame-2])getFrame(n);
  }
  orbit.querySelector('.sequence-status').textContent=`${String(shownFrame).padStart(2,'0')} / 75`;
  if(Math.abs(b-current)>.001&&!reduce.matches)raf=requestAnimationFrame(render);
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(render);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);schedule();
})();
