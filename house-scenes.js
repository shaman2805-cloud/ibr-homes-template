'use strict';
(() => {
 const construction=document.querySelector('#construction');
 if(!construction)return;
 const video=construction.querySelector('video');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const autoplay=()=>innerWidth<=900||innerHeight<=600;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const progress=el=>reduce.matches?0:clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
 let raf=0,started=false,wantedTime=0;
 function seek(){if(autoplay()&&!reduce.matches)return;if(video.readyState>=1&&!video.seeking&&Math.abs(video.currentTime-wantedTime)>.045)video.currentTime=wantedTime;}
 video.addEventListener('seeked',seek);
 video.addEventListener('loadedmetadata',()=>{schedule();});video.addEventListener('loadeddata',schedule);
 video.addEventListener('error',()=>{construction.querySelector('.sequence-status').textContent='Видео недоступно';});
 function render(){
  raf=0;
  const a=progress(construction);
  construction.style.setProperty('--sequence-progress',a);
  const r=construction.getBoundingClientRect();
  if(!started&&r.top<innerHeight*2){started=true;fetch('assets/assembly/construction.mp4').then(r=>{if(!r.ok)throw new Error('video');return r.blob();}).then(blob=>{video.src=URL.createObjectURL(blob);video.load();}).catch(()=>{construction.querySelector('.sequence-status').textContent='Видео недоступно';});}
  if(Number.isFinite(video.duration)&&video.duration>0){
   const small=autoplay();
   if(small&&!reduce.matches){
    const model=construction.querySelector('.tech-model').getBoundingClientRect();
    if(!document.hidden&&model.top<innerHeight&&model.bottom>0){video.loop=true;if(video.paused)video.play().catch(()=>{});}else video.pause();
   }else{video.pause();video.loop=false;wantedTime=(reduce.matches?1:a)*Math.max(0,video.duration-.06);seek();}
   construction.querySelector('.sequence-status').textContent=small&&!reduce.matches?'Сборка дома ↻':`${reduce.matches?100:Math.round(a*100)}%`;
  }
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(render);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else schedule();});
 new IntersectionObserver(schedule).observe(construction.querySelector('.tech-model'));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);schedule();
})();
