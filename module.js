'use strict';
(() => {
 const $ = s => document.querySelector(s);
 const $$ = s => [...document.querySelectorAll(s)];
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const models = window.IBR_MODELS;
 models.forEach(m=>{const img=new Image();img.src=m.image;});
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
 $$('img[data-fallback]').forEach(img => {
  const fail=()=>{if(img.dataset.failed)return;img.dataset.failed='true';img.src=img.dataset.fallback;img.alt='Концептуальная визуализация из демо IBR HOMES';};
  img.addEventListener('error',fail);if(img.complete&&!img.naturalWidth)fail();
 });
 // Keyboard-accessible catalogue.
 let selected=0;
 $('.catalog-tabs').innerHTML=models.map((m,i)=>`<button role="tab" id="model-tab-${m.id}" aria-controls="catalog-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${esc(m.name)}</button>`).join('');
 function selectModel(index, focus=false){
  selected=index;const m=models[index];
  $$('.catalog-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  $('#catalog-panel').setAttribute('aria-labelledby',`model-tab-${m.id}`);
  $('#catalog-photo').src=m.image;$('#catalog-photo').alt=`Визуализация концепции «${m.name}»`;
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
 function plan(m){
  const labels=m.rooms;
  return `<svg viewBox="0 0 760 450" role="img" aria-label="Иллюстративное зонирование: ${esc(labels.join(', '))}"><rect width="760" height="450" fill="#eae6df"/><g stroke="#7a7469" stroke-width="4" fill="#f7f5ef"><rect x="55" y="45" width="650" height="310"/><path d="M420 45V355M420 210H705M55 260H420" fill="none"/><rect x="55" y="370" width="650" height="45" fill="#d7ccba" stroke-width="1" stroke-dasharray="5 4"/></g><g fill="#706b62" font-family="Arial,sans-serif" font-size="18" text-anchor="middle"><text x="235" y="156">${esc(labels[0])}</text><text x="558" y="132">${esc(labels[1])}</text><text x="558" y="289">${esc(labels[2])}</text><text x="235" y="314">Вход / хранение</text><text x="380" y="399">${esc(labels[3])}</text></g><g stroke="#a58b68" stroke-width="6"><path d="M100 45H330M705 82V173M120 355H315"/></g></svg>`;
 }
 $('#model-details').addEventListener('click',()=>{
  const m=models[selected];$('#detail-title').textContent=m.name;$('#detail-copy').textContent=m.text;$('#detail-photo').src=m.image;$('#detail-photo').alt=`Концепция «${m.name}»`;
  $('#detail-rooms').innerHTML=m.rooms.map(r=>`<li>${esc(r)}</li>`).join('');$('#plan-drawing').innerHTML=plan(m);setDetailView('exterior');openDialog($('#model-dialog'));$('#model-dialog').scrollTop=0;
 });
 function lightbox(src,alt,caption){$('#lightbox-image').src=src;$('#lightbox-image').alt=alt;$('#lightbox-caption').textContent=caption;openDialog($('#lightbox'));}
 $('#detail-zoom').addEventListener('click',()=>lightbox(models[selected].image,models[selected].name,'Концептуальная визуализация. Не фотография построенного объекта.'));
 $$('[data-stock]').forEach(b=>b.addEventListener('click',()=>{const img=b.querySelector('img');lightbox(img.currentSrc||img.src,img.alt,img.dataset.failed?'Концепция из демо IBR HOMES.':'Фотография для вдохновения из Pexels. Не объект IBR HOMES.');}));
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
  'Внешние фотографии могут загружаться с Pexels: при этом ваш браузер обращается к серверу изображений. На этой странице нет встроенной аналитики и рекламных трекеров.',
  'Для уточнения вопросов о переданных компании данных свяжитесь с IBR HOMES по номеру +7 700 724 91 23.'
 ]));
 // Questionnaires share contact validation and final confirmation.
 const form=$('#module-form');let mode='full',step=0,pages=[],answers={};
 const modeNames={full:'Расчёт жилого дома',site:'Дом на вашем участке',budget:'Бюджет и комплектация',question:'Вопрос команде'};
 const titles={format:'Какой дом вам ближе?',parameters:'Пространство и комплектация',site:'Расскажите об участке',timing:'Сроки и ориентиры',question:'Что хотите обсудить?',contacts:'Как с вами связаться?'};
 const finishNames={shell:'Домокомплект',warm:'Тёплый контур',turnkey:'Под ключ',advice:'Нужна консультация'};
 const input=(name,label,options={})=>`<label class="${options.wide?'span-2':''}">${label}<input name="${name}" type="${options.type||'text'}" value="${esc(answers[name]||'')}" ${options.required?'required':''} ${options.min!==undefined?`min="${options.min}"`:''} ${options.max!==undefined?`max="${options.max}"`:''} ${options.type==='number'?'step="any"':''} maxlength="${options.length||100}" ${options.autocomplete?`autocomplete="${options.autocomplete}"`:''} ${options.placeholder?`placeholder="${esc(options.placeholder)}"`:''}></label>`;
 const select=(name,label,items)=>`<label>${label}<select name="${name}">${items.map(x=>{const [value,title]=Array.isArray(x)?x:[x,x];return `<option value="${esc(value)}" ${answers[name]===value?'selected':''}>${esc(title)}</option>`;}).join('')}</select></label>`;
 const choices=(name,values)=>`<div class="quiz-choice-grid">${values.map(v=>`<label class="quiz-choice"><input type="radio" name="${name}" value="${esc(v)}" ${answers[name]===v?'checked':''} required><span>${esc(v)}</span></label>`).join('')}</div>`;
 function fields(page){
  if(page==='format')return `<p>Выберите направление. Планировку и характеристики уточним вместе.</p>${choices('format',models.map(m=>m.name))}`;
  if(page==='parameters')return `<div class="quiz-page-fields">${input('area','Желаемая площадь, м²',{type:'number',min:20,max:1000,required:true})}${select('floors','Этажей',['1','2','Нужна консультация'])}${select('finish','Комплектация',Object.entries(finishNames))}${select('bedrooms','Спален',['1','2','3','4 и больше','Пока не решил'])}<label class="span-2">Терраса<select name="terrace">${['Хочу террасу','Без террасы','Нужна консультация'].map(x=>`<option ${answers.terrace===x?'selected':''}>${x}</option>`).join('')}</select></label></div><p class="caption">Площадь — ваше пожелание, а не характеристика выбранной иллюстрации.</p>`;
  if(page==='site')return `<div class="quiz-page-fields">${input('city','Город / место строительства',{required:true,wide:true,autocomplete:'address-level2'})}${select('plot','Участок',['Уже есть','Выбираю участок','Нужна консультация'])}${input('plotArea','Площадь участка, соток (если известна)',{type:'number',min:.1,max:100000})}${select('access','Подъезд',['Есть подъезд','Есть ограничения','Пока не знаю'])}${select('utilities','Коммуникации',['Подведены','Частично','Не подведены','Пока не знаю'])}</div>`;
  if(page==='timing')return `<div class="quiz-page-fields">${select('timing','Когда хотите начать?',['В ближайшие 3 месяца','В течение года','Пока изучаю варианты'])}${select('funding','Финансирование',['Собственные средства','Планирую кредит','Смешанное','Хочу обсудить'])}${input('budget','Ориентир бюджета, ₸ (необязательно)',{type:'number',min:0,max:100000000000,wide:true})}<label class="span-2">Пожелания<textarea name="comment" maxlength="800" rows="3">${esc(answers.comment||'')}</textarea></label></div><p class="caption">Это пожелания для обсуждения, не кредитная заявка и не обещание финансирования.</p>`;
  if(page==='question')return `<div class="quiz-page-fields"><label class="span-2">Ваш вопрос<textarea name="question" maxlength="1200" rows="6" required>${esc(answers.question||'')}</textarea></label></div>`;
  return `<div class="quiz-page-fields">${input('firstName','Имя',{required:true,autocomplete:'given-name',length:60})}${input('lastName','Фамилия',{required:true,autocomplete:'family-name',length:60})}${input('phone','Телефон',{required:true,type:'tel',wide:true,autocomplete:'tel',length:24,placeholder:'+7 700 000 00 00'})}</div><label class="quiz-consent"><input type="checkbox" name="consent" required ${answers.consent?'checked':''}><span>Согласен передать имя, фамилию, телефон и параметры проекта IBR HOMES через WhatsApp для обсуждения заявки.</span></label>`;
 }
 function render(){
  form.hidden=false;$('#quiz-result').hidden=true;const page=pages[step];$('#quiz-title').textContent=titles[page];$('#quiz-fields').innerHTML=fields(page);$('#quiz-counter').textContent=`${step+1} / ${pages.length}`;$('.quiz-progress>span').style.width=`${(step+1)/pages.length*100}%`;$('#quiz-back').disabled=step===0;$('#quiz-next').textContent=step===pages.length-1?'Проверить заявку ↗':'Далее ↗';$('#quiz-error').textContent='';$('#quiz-title').focus({preventScroll:true});$('#quiz').scrollTop=0;
  if(!reduced.matches)$('#quiz-fields').animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 function capture(){
  [...form.elements].forEach(el=>{if(!el.name)return;if(el.type==='checkbox')answers[el.name]=el.checked;else if(el.type==='radio'){if(el.checked)answers[el.name]=el.value;}else answers[el.name]=el.value.trim();});
 }
 function validate(){
  for(const el of $('#quiz-fields').querySelectorAll('input,select,textarea')){
   el.setCustomValidity('');
   if(el.required&&!['radio','checkbox'].includes(el.type)&&!el.value.trim())el.setCustomValidity('Заполните это поле.');
   if(el.name==='phone'&&(!/^\+?[\d\s()\-]+$/.test(el.value.trim())||el.value.replace(/\D/g,'').length<10||el.value.replace(/\D/g,'').length>15))el.setCustomValidity('Укажите корректный номер телефона с кодом страны.');
   if(!el.checkValidity()){el.reportValidity();$('#quiz-error').textContent=el.type==='checkbox'?'Для продолжения подтвердите согласие.':'Проверьте выделенное поле.';return false;}
  }return true;
 }
 form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');$('#quiz-error').textContent='';});
 function openQuiz(nextMode='full',model=null){
  contactToggle(false);if($('#model-dialog').open)$('#model-dialog').close();
  mode=nextMode;step=0;pages=mode==='question'?['question','contacts']:mode==='site'?['site','format','parameters','timing','contacts']:['format','parameters','site','timing','contacts'];
  answers={...answers,format:model?.name||answers.format||'Компактный',area:model?String(model.area):answers.area||'100',floors:answers.floors||'1',finish:answers.finish||'advice'};
  // A numeric area is a draft preference, not a catalogue specification.
  $('#quiz-context').textContent=modeNames[mode];openDialog($('#quiz'));render();
 }
 $$('[data-quiz]').forEach(b=>b.addEventListener('click',()=>openQuiz(b.dataset.quiz)));
 $('#detail-order').addEventListener('click',()=>openQuiz('full',models[selected]));
 $('#quiz-back').addEventListener('click',()=>{capture();if(step>0){step--;render();}});
 const labels={format:'Направление',area:'Желаемая площадь, м²',floors:'Этажей',finish:'Комплектация',bedrooms:'Спален',terrace:'Терраса',city:'Город / место',plot:'Участок',plotArea:'Площадь участка, соток',access:'Подъезд',utilities:'Коммуникации',timing:'Когда начать',funding:'Финансирование',budget:'Бюджет, ₸',comment:'Пожелания',question:'Вопрос',firstName:'Имя',lastName:'Фамилия',phone:'Телефон'};
 function summary(){
  form.hidden=true;$('#quiz-result').hidden=false;$('#quiz-summary').replaceChildren();
  const keys=mode==='question'?['question','firstName','lastName','phone']:Object.keys(labels).filter(k=>k!=='question');
  const lines=[`Здравствуйте! ${modeNames[mode]}.`];
  keys.forEach(key=>{const value=key==='finish'?finishNames[answers[key]]:answers[key];if(!value)return;const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[key];dd.textContent=value;row.append(dt,dd);$('#quiz-summary').append(row);lines.push(`${labels[key]}: ${value}`);});
  let price='Стоимость подготовим индивидуально после уточнения проекта.';
  const rate=config.ratesPerSquareMeter?.[answers.finish];
  if(mode!=='question'&&typeof rate==='number'&&Number.isFinite(rate)&&rate>0)price=`Предварительный ориентир: ${new Intl.NumberFormat('ru-RU').format(Number(answers.area)*rate)} ₸. Площадь × базовая ставка; доставка, основание и дополнительные работы уточняются отдельно.`;
  $('#quiz-price').textContent=mode==='question'?'':price;if(mode!=='question')lines.push(price);lines.push('Согласен передать эти данные IBR HOMES для обсуждения заявки.');
  $('#quiz-send').href=`https://wa.me/${String(config.whatsapp||'77007249123').replace(/\D/g,'')}?text=${encodeURIComponent(lines.join('\n'))}`;
  $('#quiz-status').textContent='';$('#quiz-result h2').focus({preventScroll:true});$('#quiz').scrollTop=0;
 }
 form.addEventListener('submit',e=>{e.preventDefault();if(!validate())return;capture();if(step<pages.length-1){step++;render();}else summary();});
 $('#quiz-edit').addEventListener('click',()=>{step=0;render();});
 $('#quiz-send').addEventListener('click',()=>{$('#quiz-status').textContent='Сообщение подготовлено. Нажмите «Отправить» в WhatsApp. Открытие окна не означает отправку заявки.';});
})();
