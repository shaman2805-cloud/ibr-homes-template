/* Scroll-driven architectural 3D model, built locally from geometry.
   Visual reference: the supplied timber barn house. Not a construction/BIM model. */
const section=document.querySelector('.model-construction');
const host=section.querySelector('.house-model-view');
const slider=document.querySelector('#house-angle');
const output=document.querySelector('#house-angle-value');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let started=false,visible=false,controller=null;
const clamp=v=>Math.max(0,Math.min(1,v));
function scrollProgress(){return clamp((-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)-.05)/.83);}
function sync(){if(controller&&section.classList.contains('is-scrubbing')&&!reduced.matches)controller.turn(scrollProgress());}
async function initialize(){
 if(started)return;started=true;
 try{
  const T=await import('./assets/vendor/three.module.min.js');
  const canvas=document.querySelector('#house-model-canvas');
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-10,10,7,-7,.1,120);
  camera.position.set(13,9.5,16);camera.lookAt(0,1.1,0);
  scene.add(new T.HemisphereLight(0xe9f2ff,0x77664f,2.6));
  const sun=new T.DirectionalLight(0xfff5e6,4);sun.position.set(-7,12,9);sun.castShadow=true;
  sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:40});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;scene.add(sun);
  const fill=new T.DirectionalLight(0xc3d6e2,1.6);fill.position.set(10,7,-12);scene.add(fill);
  const house=new T.Group();house.position.z=-.5;scene.add(house);
  const mat=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const timber=mat(0xb69872),endgrain=mat(0xc4a984),metal=mat(0x353a38,.55,.45),deck=mat(0x727470),concrete=mat(0xa3a298),wall=mat(0xa28a69),dark=mat(0x252d29),linen=mat(0xded2b7),cushion=mat(0xb7a48b);
  // Slight board variation gives texture without downloading large materials.
  const boxGeo=new T.BoxGeometry(1,1,1);
  function box(w,h,d,x,y,z,material=timber,parent=house){const mesh=new T.Mesh(boxGeo,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function batch(items,material){const mesh=new T.InstancedMesh(boxGeo,material,items.length),matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),quat=new T.Quaternion();items.forEach((a,i)=>{position.set(a[3],a[4],a[5]);scale.set(a[0],a[1],a[2]);matrix.compose(position,quat,scale);mesh.setMatrixAt(i,matrix);const c=new T.Color(material.color);c.multiplyScalar(.90+(i%11)/65);mesh.setColorAt(i,c);});mesh.castShadow=mesh.receiveShadow=true;house.add(mesh);return mesh;}
  // Floor, foundation beams and terraces.
  box(6.8,.28,7.5,0,.42,0,concrete);box(6.7,.16,7.5,0,.64,0,deck);
  box(6.9,.26,2.75,0,.47,5.08,dark);
  const boards=[];for(let n=0;n<46;n++)boards.push([.141,.14,2.78,-3.37+n*.15,.67,5.08]);batch(boards,deck);
  for(let n=0;n<3;n++){box(6.9,.12,.4,0,.57-n*.16,6.65+n*.36,deck);box(6.5,.13,.2,0,.44-n*.15,6.7+n*.35,dark);}
  // Side-wall cladding is segmented around actual openings.
  const openings={right:[{z:-1.7,w:1.1,bottom:1.35,top:2.1},{z:2,w:.85,bottom:.74,top:2.72}],left:[{z:-1.7,w:1.4,bottom:1.35,top:2.4},{z:1.15,w:1.4,bottom:1.35,top:2.4}]};
  function side(x,list){
   const strips=[];const sideSign=Math.sign(x);
   for(let z=-3.69;z<3.75;z+=.15){const hole=list.find(o=>z>o.z-o.w/2-.035&&z<o.z+o.w/2+.035);const bands=hole?[[.74,hole.bottom],[hole.top,3.12]]:[[.74,3.12]];
    bands.forEach(([lo,hi])=>{if(hi>lo+.01)strips.push([.16,hi-lo,.138,x,(lo+hi)/2,z]);});}
   batch(strips,timber);
   list.forEach(o=>windowUnit(x+sideSign*.01,(o.top+o.bottom)/2,o.z,o.w,o.top-o.bottom,sideSign*Math.PI/2));
  }
  // Window reflectance and softly visible linen, all rendered as 3D surfaces.
  const reflection=document.createElement('canvas');reflection.width=128;reflection.height=256;const rc=reflection.getContext('2d');const gradient=rc.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#bed1d4');gradient.addColorStop(.5,'#667e79');gradient.addColorStop(1,'#283d36');rc.fillStyle=gradient;rc.fillRect(0,0,128,256);rc.fillStyle='#2e4c4170';for(let i=0;i<14;i++){const x=(i*47)%128;rc.beginPath();rc.moveTo(x,45+(i%5)*18);rc.lineTo(x-20,210);rc.lineTo(x+20,210);rc.fill();}
  const glassMap=new T.CanvasTexture(reflection);glassMap.colorSpace=T.SRGBColorSpace;
  const glass=new T.MeshStandardMaterial({color:0xcbd4cd,map:glassMap,roughness:.22,metalness:.45,transparent:true,opacity:.58,depthWrite:false});
  function windowUnit(x,y,z,w,h,angle=0){
   const group=new T.Group();group.position.set(x,y,z);group.rotation.y=angle;house.add(group);
   box(w+.1,h+.1,.13,0,0,0,dark,group);box(w-.07,h-.07,.035,0,0,.081,glass,group);
   // A linen inner face keeps glass from reading as an empty black opening.
   box(w-.12,h-.12,.02,0,0,.067,linen,group);
   for(let a=-w/2+.08;a<w/2-.03;a+=.08)box(.018,h-.12,.018,a,0,.077,cushion,group);
   box(.045,h,.065,0,0,.115,metal,group);
   if(h>1.8)box(.035,.25,.05,w*.36,-.15,.13,metal,group);
  }
  side(3.35,openings.right);side(-3.35,openings.left);
  // Main panoramic facade with four framed glass bays.
  const front=3.75;
  for(let i=0;i<4;i++)windowUnit(-2.4+i*1.6,1.91,front,1.51,2.3);
  box(6.7,.17,.22,0,3.05,front,timber);box(6.7,.13,.22,0,.76,front,metal);
  for(const x of [-3.35,3.35])box(.2,2.45,.2,x,1.93,front,timber);
  // Rear elevation, gable infill and a small bedroom window.
  const rear=[];for(let x=-3.28;x<3.35;x+=.15){const inWindow=Math.abs(x)<.95;const height=3.12+.95*(1-Math.abs(x)/3.35);if(inWindow){rear.push([.138,.5,.16,x,.99,-3.75]);rear.push([.138,height-2.5,.16,x,(height+2.5)/2,-3.75]);}else rear.push([.138,height-.74,.16,x,(height+.74)/2,-3.75]);}batch(rear,timber);windowUnit(0,1.87,-3.85,1.82,1.18,Math.PI);
  const shape=new T.Shape();shape.moveTo(-3.35,3.13);shape.lineTo(0,4.08);shape.lineTo(3.35,3.13);shape.closePath();const gable=new T.Mesh(new T.ShapeGeometry(shape),endgrain);gable.position.z=front+.03;gable.castShadow=true;house.add(gable);
  // Roof extends over the terrace; standing seams follow both slopes.
  const roofSlope=Math.atan2(.98,3.58),slopeLength=Math.hypot(.98,3.58);
  for(const sideSign of [-1,1]){const panel=box(slopeLength,.1,10.25,sideSign*1.79,3.65,1.13,metal);panel.rotation.z=-sideSign*roofSlope;
   for(let z=-3.94;z<6.28;z+=.43){const seam=box(slopeLength,.065,.026,sideSign*1.79,3.72,z,metal);seam.rotation.z=-sideSign*roofSlope;}
   const fascia=box(slopeLength,.22,.16,sideSign*1.79,3.57,6.28,endgrain);fascia.rotation.z=-sideSign*roofSlope;
   box(.09,.12,10.3,sideSign*3.57,3.16,1.12,metal);
  }
  box(.12,.1,10.35,0,4.17,1.1,metal);
  // Porch posts, side entry, handrail, furniture and wall lights.
  for(const x of [-3.35,3.35])box(.24,2.55,.24,x,1.99,6.2,timber);
  box(1.2,.26,1.8,4,.46,2,deck);for(let i=0;i<2;i++)box(.36,.15,1.85,4.8+i*.34,.45-i*.17,2,deck);
  for(const z of [1.13,2.87]){box(.1,.9,.1,4.47,1.14,z,timber);box(1.2,.08,.08,3.95,1.57,z,timber);}
  // Two low seats on the terrace.
  for(const x of [-2,1.9]){const chair=new T.Group();chair.position.set(x,.7,4.95);house.add(chair);box(.7,.12,.66,0,.42,0,timber,chair);box(.66,.19,.59,0,.55,0,cushion,chair);box(.68,.64,.12,0,.87,-.28,cushion,chair);for(const dx of [-.29,.29])for(const dz of [-.24,.24])box(.05,.44,.05,dx,.22,dz,metal,chair);}
  const table=new T.Mesh(new T.CylinderGeometry(.36,.36,.07,32),endgrain);table.position.set(0,1.26,5.15);table.castShadow=true;house.add(table);box(.08,.55,.08,0,.96,5.15,metal);
  for(const x of [-3.16,3.16]){box(.11,.32,.13,x,2.25,3.9,metal);const light=new T.Mesh(new T.PlaneGeometry(.08,.17),new T.MeshBasicMaterial({color:0xffdea0}));light.position.set(x,2.24,3.972);house.add(light);}
  // Thin architectural presentation base and ground-contact shadow.
  const base=new T.Mesh(new T.CylinderGeometry(8.9,8.9,.12,80),mat(0xd8d5cd));base.position.y=-.25;base.receiveShadow=true;house.add(base);
  const shadow=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({opacity:.18}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.32;shadow.receiveShadow=true;scene.add(shadow);
  let target=0,current=0,frame=0,last=0;
  function render(now){frame=0;if(document.hidden||!visible){last=0;return;}const dt=Math.min(50,now-last||16);last=now;current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt/100));house.rotation.y=-current*Math.PI*2;renderer.render(scene,camera);section.dataset.modelAngle=String(Math.round(current*360));if(Math.abs(current-target)>.00008)frame=requestAnimationFrame(render);}
  function schedule(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const span=Math.max(6.8,10.7/aspect);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();schedule();}
  controller={turn(p){target=clamp(p);slider.value=Math.round(target*360);output.value=`${Math.round(target*360)}°`;section.style.setProperty('--sequence-progress',target);schedule();},schedule};
  new ResizeObserver(resize).observe(host);resize();sync();schedule();section.classList.add('model-ready');section.dataset.modelState='ready';slider.disabled=false;
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;section.classList.remove('model-ready');section.dataset.modelState='fallback';slider.disabled=true;});
  canvas.addEventListener('webglcontextrestored',()=>{section.classList.add('model-ready');section.dataset.modelState='ready';slider.disabled=false;resize();});
 }catch(error){section.dataset.modelState='fallback';slider.disabled=true;section.classList.remove('model-ready');section.querySelector('.model-source').textContent=window.IBRI18N?.t('Визуализация барнхауса')||'Визуализация барнхауса';}
}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){initialize();controller?.schedule();}},{rootMargin:'250px'}).observe(host);
slider.addEventListener('input',()=>{
 const p=Number(slider.value)/360;output.value=`${Math.round(p*360)}°`;controller?.turn(p);
 if(section.classList.contains('is-scrubbing')&&!reduced.matches){const top=scrollY+section.getBoundingClientRect().top+(section.offsetHeight-innerHeight)*(.05+.83*p);scrollTo({top,behavior:'instant'});}
});
addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);reduced.addEventListener('change',sync);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync();controller?.schedule();}});
