'use strict';
(() => {
 const $ = s => document.querySelector(s);
 const $$ = s => [...document.querySelectorAll(s)];
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const models = window.IBR_MODELS;

 const articles = window.IBR_ARTICLES;
 const config = window.IBR_CALCULATOR || {whatsapp:'77007249123'};
 document.documentElement.classList.add('js');
 $$('.stagger-group').forEach(group=>[...group.children].forEach((el,i)=>el.style.setProperty('--item-delay',`${Math.min(i%3,2)*100}ms`)));
 if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.08});
  $$('.reveal,.stagger-group>article').forEach(el => io.observe(el));
 } else $$('.reveal,.stagger-group>article').forEach(el => el.classList.add('visible'));
 const rail=$('#process'), track=rail?.querySelector('.service-track');
 const clamp=v=>Math.max(0,Math.min(1,v));
 let railDistance=0, pending=false;
 function sizeRail(){
  if(!rail)return;
  track.style.transform='';
  if(innerWidth<=700||reduced.matches){rail.style.removeProperty('--rail-height');return;}
  railDistance=Math.max(0,track.scrollWidth-track.clientWidth);
  rail.style.setProperty('--rail-height',`${innerHeight+Math.max(1000,railDistance*1.4)+220}px`);
 }
 const draw = () => {
  pending=false;
  const bubbleEl=$('.contact-bubble');
  if(bubbleEl)bubbleEl.hidden=scrollY<innerHeight*.7;
  $('.reading-progress').style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;
  if(!reduced.matches && innerWidth>700){

   if(rail){
    const progress=clamp(-rail.getBoundingClientRect().top/Math.max(1,rail.offsetHeight-innerHeight-220));
    track.style.transform=`translate3d(${-railDistance*progress}px,0,0)`;
    rail.style.setProperty('--rail-progress',progress);
    rail.querySelector('.service-current').textContent=String(Math.min(4,Math.floor(progress*4)+1)).padStart(2,'0');
   }
   const story=$('.story');
   if(story){const progress=clamp(-story.getBoundingClientRect().top/Math.max(1,story.offsetHeight-innerHeight));story.querySelector('img').style.transform=`scale(${1.055+progress*.06})`;}

  }else{
   if(track)track.style.transform='';
   if($('.story img'))$('.story img').style.transform='';
  }
 };
 const schedule = () => {if(!pending){pending=true;requestAnimationFrame(draw);}};
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',()=>{sizeRail();schedule();});
 reduced.addEventListener('change',()=>{sizeRail();schedule();});
 addEventListener('load',()=>{sizeRail();schedule();});sizeRail();draw();
 const lock = () => {document.body.style.overflow=$$('dialog[open]').length?'hidden':'';};
 const openDialog = el => {el.showModal();lock();};
 const requestClose = d => {
  if(d.dataset.closing)return;
  if(reduced.matches){d.close();return;}
  d.dataset.closing='true';
  const motion=d.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(12px)'}],{duration:190,easing:'ease-in',fill:'forwards'});
  motion.onfinish=()=>{d.close();motion.cancel();delete d.dataset.closing;};
 };
 $$('dialog').forEach(d => {
  d.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>d.close()));
  d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click',()=>requestClose(d)));
  d.addEventListener('cancel',e=>{e.preventDefault();requestClose(d);});
  d.addEventListener('close',()=>{lock();$('.menu-toggle').setAttribute('aria-expanded',String($('#module-menu').open));});
 });
 $('.menu-toggle').addEventListener('click',()=>{openDialog($('#module-menu'));$('.menu-toggle').setAttribute('aria-expanded','true');});
 $$('#module-menu nav a').forEach(a => a.addEventListener('click',()=>$('#module-menu').close()));
 const bubble=$('.contact-bubble'), contact=$('#contact-card');
 const contactToggle = shown => {contact.hidden=!shown;bubble.setAttribute('aria-expanded',String(shown));};
 bubble.addEventListener('click',()=>contactToggle(contact.hidden));$('.contact-close').addEventListener('click',()=>{contactToggle(false);bubble.focus();});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!contact.hidden){contactToggle(false);bubble.focus();}});
 // Keyboard-accessible catalogue.
 let selected=0;
 $('.catalog-tabs').innerHTML=models.map((m,i)=>`<button role="tab" id="model-tab-${m.id}" aria-controls="catalog-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${esc(m.name)}</button>`).join('');
 function selectModel(index, focus=false){
  selected=index;const m=models[index];
  $$('.catalog-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  $('#catalog-panel').setAttribute('aria-labelledby',`model-tab-${m.id}`);
  $('#catalog-photo').srcset=`${m.image.replace('.webp','-small.webp')} 800w, ${m.image} 1920w`;$('#catalog-photo').src=m.image;$('#catalog-photo').alt=`Визуализация концепции «${m.name}»`;
  if(!reduced.matches)$('#catalog-photo').animate([{opacity:.45,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  $('#catalog-name').textContent=m.name;$('#catalog-tag').textContent=m.tag;
  if(focus)$$('.catalog-tabs button')[index].focus();
 }
 $$('.catalog-tabs button').forEach((b,i)=>{
  b.addEventListener('click',()=>selectModel(i));
  b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%models.length;else if(e.key==='ArrowLeft')n=(i-1+models.length)%models.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=models.length-1;else return;e.preventDefault();selectModel(n,true);});
 });selectModel(0);
 function setDetailView(view, focus=false){
  $$('.detail-tabs button').forEach(b=>{const on=b.dataset.view===view;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
  $('#detail-exterior').hidden=view!=='exterior';$('#detail-plan').hidden=view!=='plan';
 }
 $$('.detail-tabs button').forEach(b=>{b.addEventListener('click',()=>setDetailView(b.dataset.view));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setDetailView(e.key==='Home'?'exterior':e.key==='End'?'plan':b.dataset.view==='plan'?'exterior':'plan',true);}});});
 function styleGallery(m){
  const gallery=$('#style-gallery');gallery.replaceChildren();
  m.styles.forEach(style=>{const button=document.createElement('button');button.type='button';button.className='style-option';const image=document.createElement('img');image.src=style.image.replace('.webp','-small.webp');image.alt=style.name;image.loading='lazy';const label=document.createElement('span');label.textContent=style.name+' ↗';button.append(image,label);button.addEventListener('click',()=>lightbox(style.image,style.name,'Архитектурная визуализация · '+style.name));gallery.append(button);});
 }
 $('#model-details').addEventListener('click',()=>{
  const m=models[selected];$('#detail-title').textContent=m.name;$('#detail-copy').textContent=m.text;$('#detail-photo').src=m.image;$('#detail-photo').alt=`Концепция «${m.name}»`;
  $('#detail-rooms').innerHTML=m.rooms.map(r=>`<li>${esc(r)}</li>`).join('');styleGallery(m);setDetailView('exterior');openDialog($('#model-dialog'));$('#model-dialog').scrollTop=0;
 });
 function lightbox(src,alt,caption){$('#lightbox-image').src=src;$('#lightbox-image').alt=alt;$('#lightbox-caption').textContent=caption;openDialog($('#lightbox'));}
 $('#detail-zoom').addEventListener('click',()=>lightbox(models[selected].image,models[selected].name,'Концептуальная визуализация. Не фотография построенного объекта.'));
 $$('[data-stock]').forEach(b=>b.addEventListener('click',()=>{const img=b.querySelector('img');lightbox(img.dataset.full||img.currentSrc||img.src,img.alt,img.alt+' · IBR HOMES');}));
 const accordionAnimations=new WeakMap();
 $$('.faq-list details').forEach(details=>{
  details.querySelector('summary').addEventListener('click',event=>{
   if(reduced.matches)return;
   event.preventDefault();
   const opening=details.dataset.expanded!=='true';
   const from=details.getBoundingClientRect().height;
   accordionAnimations.get(details)?.cancel();
   details.dataset.expanded=String(opening);
   if(opening)details.open=true;
   const target=opening?details.getBoundingClientRect().height:details.querySelector('summary').getBoundingClientRect().height+1;
   const animation=details.animate([{height:`${from}px`},{height:`${target}px`}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
   accordionAnimations.set(details,animation);
   animation.onfinish=()=>{details.open=opening;accordionAnimations.delete(details);};
  });
 });
 // Real, local articles rather than empty links.
 $('#journal-cards').innerHTML=articles.map((a,i)=>`<button class="journal-card" data-article="${i}"><img src="${esc(a.image)}" alt="Иллюстрация: ${esc(a.title)}" loading="lazy"><span>${esc(a.label)}</span><h3>${esc(a.title)}</h3><p>Читать материал ↗</p></button>`).join('');
 function article(title,label,paragraphs){$('#article-title').textContent=title;$('#article-label').textContent=label;$('#article-body').replaceChildren();paragraphs.forEach(p=>{const el=document.createElement('p');el.textContent=p;$('#article-body').append(el);});openDialog($('#article-dialog'));$('#article-dialog').scrollTop=0;}
 $$('[data-article]').forEach(b=>b.addEventListener('click',()=>{const a=articles[Number(b.dataset.article)];article(a.title,a.label,a.paragraphs);}));
 $('#privacy-open').addEventListener('click',()=>article('Как работает заявка','Данные в форме',[
  'Вы вводите имя, фамилию, номер телефона и параметры дома. Эта версия сайта использует их только для подготовки сообщения в WhatsApp. Поля остаются в памяти открытой страницы и очищаются после её перезагрузки.',
  'Сайт не сохраняет заявку в собственной базе данных. Открытие ссылки WhatsApp передаёт подготовленный текст в сервис WhatsApp; компания получает сообщение только после того, как вы нажмёте «Отправить» в WhatsApp.',
  'Фотографии загружаются вместе с сайтом. На этой странице нет встроенной аналитики и рекламных трекеров.',
  'Для уточнения вопросов о переданных компании данных свяжитесь с IBR HOMES по номеру +7 700 724 91 23.'
 ]));
 // One questionnaire for every estimate CTA. Nothing is sent automatically.
 const form=$('#module-form');let step=0,answers={};
 const pages=['project','plot','city','timing','area','contacts'];
 const titles={project:'Какой проект рассматриваете?',plot:'У вас есть земельный участок?',city:'В каком городе планируете строительство?',timing:'Когда планируете начать строительство?',area:'Какая площадь интересует?',contacts:'Заполните форму и мы с вами свяжемся.'};
 const input=(name,label,options={})=>`<label class="${options.wide?'span-2':''}">${label}<input name="${name}" type="${options.type||'text'}" value="${esc(answers[name]||'')}" required maxlength="${options.length||100}" ${options.autocomplete?`autocomplete="${options.autocomplete}"`:''} ${options.placeholder?`placeholder="${esc(options.placeholder)}"`:''}></label>`;
 const choices=(name,values)=>`<fieldset class="quiz-choice-grid"><legend class="sr-only">${titles[name]}</legend>${values.map(v=>`<label class="quiz-choice"><input type="radio" name="${name}" value="${esc(v)}" ${answers[name]===v?'checked':''} required><span>${esc(v)}</span></label>`).join('')}</fieldset>`;
 function fields(page){
  if(page==='project')return choices('project',['Баня','Дом','База отдыха']);
  if(page==='plot')return choices('plot',['Да','Нет']);
  if(page==='city')return `<div class="quiz-page-fields">${input('city','Город строительства',{wide:true,autocomplete:'address-level2',placeholder:'Например, Астана'})}</div><p class="caption">Если планируете строительство за городом, укажите ближайший населённый пункт.</p>`;
  if(page==='timing')return choices('timing',['В ближайшие 3 месяца','В ближайший год','Еще не знаю']);
  if(page==='area')return choices('area',['До 40 м²','41–60 м²','61–90 м²','Более 90 м²']);
  return `<div class="quiz-page-fields">${input('firstName','Имя',{autocomplete:'given-name',length:60})}${input('lastName','Фамилия',{autocomplete:'family-name',length:60})}${input('phone','Номер телефона',{type:'tel',wide:true,autocomplete:'tel',length:24,placeholder:'+7 700 000 00 00'})}</div><label class="quiz-consent"><input type="checkbox" name="consent" required ${answers.consent?'checked':''}><span>Согласен передать имя, фамилию, телефон и параметры проекта IBR HOMES через WhatsApp для обсуждения заявки.</span></label><p class="caption">На следующем экране проверьте ответы и отправьте сообщение в WhatsApp.</p>`;
 }
 function render(){
  form.hidden=false;$('#quiz-result').hidden=true;const page=pages[step];$('#quiz-title').textContent=titles[page];$('#quiz-fields').innerHTML=fields(page);$('#quiz-counter').textContent=step<5?`Вопрос ${step+1} из 5`:'Контактные данные';$('.quiz-progress>span').style.width=`${(step+1)/pages.length*100}%`;$('#quiz-back').disabled=step===0;$('#quiz-next').textContent=step===pages.length-1?'Проверить заявку ↗':'Далее ↗';$('#quiz-error').textContent='';$('#quiz-title').focus({preventScroll:true});$('#quiz').scrollTop=0;
  if(!reduced.matches)$('#quiz-fields').animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 function capture(){
  [...form.elements].forEach(el=>{if(!el.name)return;if(el.type==='checkbox')answers[el.name]=el.checked;else if(el.type==='radio'){if(el.checked)answers[el.name]=el.value;}else answers[el.name]=el.value.trim();});
 }
 function validate(){
  for(const el of $('#quiz-fields').querySelectorAll('input')){
   el.setCustomValidity('');
   if(el.required&&!['radio','checkbox'].includes(el.type)&&!el.value.trim())el.setCustomValidity('Заполните это поле.');
   if(el.name==='phone'&&(!/^\+?[\d\s()\-]+$/.test(el.value.trim())||el.value.replace(/\D/g,'').length<10||el.value.replace(/\D/g,'').length>15))el.setCustomValidity('Укажите корректный номер телефона с кодом страны.');
   if(!el.checkValidity()){el.reportValidity();$('#quiz-error').textContent=el.type==='checkbox'?'Для продолжения подтвердите согласие.':el.type==='radio'?'Выберите один из вариантов.':'Проверьте выделенное поле.';return false;}
  }return true;
 }
 form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');$('#quiz-error').textContent='';});
 function openQuiz(nextMode='full',model=null){
  contactToggle(false);if($('#model-dialog').open)$('#model-dialog').close();
  step=0;if(model){answers.project=model.project;answers.model=model.name;}
  $('#quiz-context').textContent='Расчёт стоимости проекта';openDialog($('#quiz'));render();
 }
 $$('[data-quiz]').forEach(b=>b.addEventListener('click',()=>openQuiz(b.dataset.quiz)));
 $('#detail-order').addEventListener('click',()=>openQuiz('full',models[selected]));
 $('#quiz-back').addEventListener('click',()=>{capture();if(step>0){step--;render();}});
 const labels={project:'Проект',model:'Формат из каталога',plot:'Есть земельный участок',city:'Город строительства',timing:'Начало строительства',area:'Интересующая площадь',firstName:'Имя',lastName:'Фамилия',phone:'Телефон'};
 function summary(){
  form.hidden=true;$('#quiz-result').hidden=false;$('#quiz-summary').replaceChildren();
  const lines=['Здравствуйте! Хочу рассчитать стоимость проекта IBR HOMES.'];
  Object.keys(labels).forEach(key=>{const value=answers[key];if(!value)return;const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[key];dd.textContent=value;row.append(dt,dd);$('#quiz-summary').append(row);lines.push(`${labels[key]}: ${value}`);});
  $('#quiz-price').textContent='Подготовим предварительный расчёт после уточнения планировки и комплектации.';
  lines.push('Согласен передать эти данные IBR HOMES для обсуждения заявки.');
  $('#quiz-send').href=`https://wa.me/${String(config.whatsapp||'77007249123').replace(/\D/g,'')}?text=${encodeURIComponent(lines.join('\n'))}`;
  $('#quiz-status').textContent='';$('#quiz-result h2').focus({preventScroll:true});$('#quiz').scrollTop=0;
 }
 form.addEventListener('change',e=>{if(e.target.name==='project'&&answers.model){const m=models.find(m=>m.name===answers.model);if(m?.project!==e.target.value)delete answers.model;}});
 form.addEventListener('submit',e=>{e.preventDefault();if(!validate())return;capture();if(step<pages.length-1){step++;render();}else summary();});
 $('#quiz-edit').addEventListener('click',()=>{step=0;render();});
 $('#quiz-send').addEventListener('click',()=>{$('#quiz-status').textContent='Сообщение подготовлено. Нажмите «Отправить» в WhatsApp. Открытие окна не означает отправку заявки.';});
})();
