'use strict';
(() => {
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const models=window.IBR_MODELS, t=s=>window.IBRI18N?.t(s)??s;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const colors=['Антрацит','Белый','Дуб','Коньячный'];
 const storageKey='ibr-concept-project-v1';
 const safeRead=()=>{try{return JSON.parse(localStorage.getItem(storageKey))}catch{return null}};
 const params=new URLSearchParams(location.search),hasLink=models.some(m=>m.id===params.get('model'));
 const saved=safeRead(),seed=hasLink?{model:params.get('model'),style:params.get('style'),plan:params.get('plan'),color:params.has('color')?params.get('color'):null}:saved;
 const index=(v,max)=>Number.isInteger(Number(v))?Math.max(0,Math.min(max,Number(v))):0;
 let selected=Math.max(0,models.findIndex(m=>m.id===seed?.model)),style=index(seed?.style,models[selected].styles.length-1),plan=index(seed?.plan,models[selected].plans.length-1),color=seed?.color==null?null:index(seed.color,3),view='exterior';
 let chosen=!!seed,requestHasModel=false,lastDraft=null,toastTimer;
 const model=()=>models[selected];
 const current=()=>({model:model().id,style,plan,color});
 const isSaved=()=>JSON.stringify(safeRead())===JSON.stringify(current());
 const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target)}}),{threshold:.08}):null;
 document.documentElement.classList.add('js');
 function reveal(){qa('.reveal:not(.is-visible)').forEach(el=>{if(reduced.matches||!revealObserver)el.classList.add('is-visible');else revealObserver.observe(el);});}
 function toast(message){clearTimeout(toastTimer);q('#toast').textContent=message;q('#toast').classList.add('visible');toastTimer=setTimeout(()=>q('#toast').classList.remove('visible'),3800);}
 function lock(){document.body.style.overflow=qa('dialog[open]').length?'hidden':'';}
 function openDialog(el){el.showModal();lock();}
 qa('dialog').forEach(d=>{d.addEventListener('close',()=>{lock();if(d.id==='menu')q('.menu-toggle').setAttribute('aria-expanded','false');});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));});
 q('.menu-toggle').addEventListener('click',()=>{q('.menu-toggle').setAttribute('aria-expanded','true');openDialog(q('#menu'));});
 qa('#menu a').forEach(a=>a.addEventListener('click',()=>q('#menu').close()));
 qa('[data-mood]').forEach(button=>button.addEventListener('click',()=>{const evening=button.dataset.mood==='evening';q('.hero').classList.toggle('is-evening',evening);qa('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 function renderCollection(){
  q('#house-grid').innerHTML=models.slice(0,3).map((m,i)=>`<article class="house-card reveal"><button data-model="${i}" aria-label="Рассмотреть ${esc(m.name)}"><div class="house-photo"><img src="${m.image}" srcset="${m.image.replace('.webp','-small.webp')} 800w, ${m.image} 1920w" sizes="(max-width:700px) 86vw, 31vw" alt="${esc(m.name+' — '+m.styles[0].name)}" loading="lazy"><span class="card-index">0${i+1} / IBR</span></div><div class="card-title"><h3>${esc(m.name)}</h3><span aria-hidden="true">↗</span></div></button><dl><div><dt>Размеры по плану</dt><dd>${esc(m.size)}</dd></div><div><dt>Помещения</dt><dd>${esc(m.roomCount)}</dd></div></dl><p>${esc(m.tag)}</p></article>`).join('');
  const bath=models[3];q('#bath-card').innerHTML=`<article class="bath-card reveal"><img src="${bath.image}" alt="Баня S — Барнхаус" loading="lazy"><div><span class="eyebrow">ПРОСТРАНСТВО ДЛЯ ВОССТАНОВЛЕНИЯ</span><h3>Время для себя</h3><p>Баня с отдельной парной, душевой и гостиной. Ваш личный ритуал отдыха — рядом с домом.</p><button class="text-link" data-model="3">Рассмотреть Баню S <span aria-hidden="true">↗</span></button></div></article>`;
  qa('[data-model]').forEach(b=>b.addEventListener('click',()=>chooseModel(Number(b.dataset.model),true)));
  reveal();
 }
 function chooseModel(n,scroll=false){selected=n;style=0;plan=0;chosen=true;view='exterior';renderProject();if(scroll)q('#atelier').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});}
 function savedButton(){q('#save-project').innerHTML=isSaved()?'<span aria-hidden="true">♥</span> Выбор сохранён':'<span aria-hidden="true">♡</span> Сохранить выбор';q('#save-project').setAttribute('aria-pressed',String(isSaved()));}
 function renderProject(){
  const m=model();q('#model-select').innerHTML=models.map((m,i)=>`<option value="${i}" ${i===selected?'selected':''}>${esc(m.name)}</option>`).join('');
  q('#project-name').textContent=m.name;q('#project-copy').textContent=m.text;
  q('#project-specs').innerHTML=[['Размеры по плану',m.size],['Помещения',m.roomCount],['Планировки',`${m.plans.length} на выбор`],...(color!==null?[['Пожелание по цвету',colors[color]]]:[])].map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  q('#exterior-options').innerHTML=m.styles.map((s,i)=>`<button data-style="${i}" aria-pressed="${i===style}">${esc(s.name)}</button>`).join('');
  q('#plan-options').innerHTML=m.plans.map((p,i)=>`<button data-plan="${i}" aria-pressed="${i===plan}">${String(i+1).padStart(2,'0')} / ${esc(p.name)}</button>`).join('');
  qa('[data-style]').forEach(b=>b.addEventListener('click',()=>{style=Number(b.dataset.style);chosen=true;renderProject();}));
  qa('[data-plan]').forEach(b=>b.addEventListener('click',()=>{plan=Number(b.dataset.plan);chosen=true;renderProject();}));
  q('#project-exterior').src=m.styles[style].image;q('#project-exterior').alt=`${m.name} — ${m.styles[style].name}`;
  q('#project-plan').src=m.plans[plan].image;q('#project-plan').alt=`${m.name}: ${m.plans[plan].name}, вид сверху`;
  q('#plan-copy').textContent=m.plans[plan].text;setView(view);savedButton();
 }
 q('#model-select').addEventListener('change',e=>chooseModel(Number(e.target.value)));
 function setView(next){view=next;const isPlan=next==='plan';q('#project-stage').classList.toggle('is-plan',isPlan);q('#project-panel').setAttribute('aria-labelledby',isPlan?'plan-tab':'exterior-tab');q('#exterior-options').hidden=isPlan;q('#plan-options').hidden=!isPlan;q('#plan-copy').hidden=!isPlan;q('#media-name').textContent=isPlan?model().plans[plan].name:model().styles[style].name;q('#media-note').textContent=isPlan?'Исходная планировка':'Визуализация проекта';qa('[data-view]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.view===view));b.tabIndex=b.dataset.view===view?0:-1;});}
 qa('[data-view]').forEach(b=>{b.addEventListener('click',()=>setView(b.dataset.view));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setView(e.key==='Home'?'exterior':e.key==='End'?'plan':view==='plan'?'exterior':'plan');q(`[data-view="${view}"]`).focus();}});});
 function renderComparison(){const houses=models.slice(0,3);q('#compare-table').innerHTML=`<thead><tr><th scope="col">Ваш будущий дом</th>${houses.map(m=>`<th scope="col">${esc(m.name)}<img src="${m.image.replace('.webp','-small.webp')}" alt="" loading="lazy"></th>`).join('')}</tr></thead><tbody>${[['Размеры по плану',...houses.map(m=>m.size)],['Спальни',...houses.map(m=>m.roomCount)],['Планировки',...houses.map(m=>`${m.plans.length} на выбор`)],['Терраса','17 м²','17 м²','20,2 м²'],['Варианты архитектуры',...houses.map(m=>String(m.styles.length))]].map(row=>`<tr><td>${esc(row[0])}</td>${row.slice(1).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}<tr><td>Следующий шаг</td>${houses.map((m,i)=>`<td><button data-compare-model="${i}">Выбрать ${esc(m.name)} ↗</button></td>`).join('')}</tr></tbody>`;qa('[data-compare-model]').forEach(b=>b.addEventListener('click',()=>{q('#comparison').close();chooseModel(Number(b.dataset.compareModel),true);}));}
 q('#compare-open').addEventListener('click',()=>{renderComparison();openDialog(q('#comparison'));});
 function paintColor(index){qa('.palette-stage img').forEach((image,i)=>image.style.opacity=String(i===index?1:0));qa('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.color)===index)));q('.palette-stage').setAttribute('aria-label','Дом с фасадом '+colors[index]);}
 qa('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=Number(b.dataset.color);paintColor(color);renderProject();}));
 const layers=[
  ['Несущая основа из CLT','Соседние слои древесины расположены под прямым углом. Панели воспринимают нагрузки, а их толщину, соединения и проёмы определяют в проекте. На участок поступают подготовленные элементы.'],
  ['Тепло остаётся дома','Утепление подбирают под климат и режим проживания. Вместе с окнами, герметичными стыками, отоплением и вентиляцией оно формирует комфортный тепловой контур.'],
  ['Защита, которую не видно','Правильный отвод влаги, герметичные примыкания и защита при монтаже помогают сохранять конструкцию. Решения для торцов, проёмов и кровли продумывают заранее.'],
  ['Характер снаружи','Фасад задаёт внешний вид и участвует в защите стены от погоды. Материал, крепления, зазоры и уход согласуют вместе с цветом и архитектурой дома.']
 ];let layer=0;
 function selectLayer(n,focus=false){layer=n;q('#layer-title').textContent=layers[n][0];q('#layer-copy').textContent=layers[n][1];q('#layer-content').setAttribute('aria-labelledby',`layer-tab-${n}`);qa('[data-layer-select]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;if(focus&&i===n)b.focus();});qa('.wall-layer').forEach((el,i)=>el.classList.toggle('is-active',i===n));q('.wall-layers').style.setProperty('--spread',`${innerWidth<700?32+n*4:45+n*8}px`);}
 qa('[data-layer-select]').forEach((b,i)=>{b.addEventListener('click',()=>selectLayer(i));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectLayer(e.key==='Home'?0:e.key==='End'?3:e.key==='ArrowRight'?(i+1)%4:(i+3)%4,true);}});});
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{if(entries[0].isIntersecting)q('.wall-layers').style.setProperty('--spread',`${innerWidth<700?40:64}px`);},{threshold:.5}).observe(q('.wall-diagram'));}
 q('#project-stage').addEventListener('click',()=>{
  const m=model(),isPlan=view==='plan';const source=isPlan?m.plans[plan]:m.styles[style];q('#large-image').src=source.image;q('#large-image').alt=`${m.name} — ${source.name}`;q('#image-caption').textContent=`${m.name} · ${source.name}`;q('#image-original').href=isPlan&&m.planPdf?m.planPdf:source.image;q('#image-dialog').classList.remove('is-zoomed');q('#image-zoom').textContent='Увеличить +';q('#image-zoom').setAttribute('aria-pressed','false');openDialog(q('#image-dialog'));
 });
 q('#image-zoom').addEventListener('click',()=>{const zoom=q('#image-dialog').classList.toggle('is-zoomed');q('#image-zoom').textContent=zoom?'Вписать в экран −':'Увеличить +';q('#image-zoom').setAttribute('aria-pressed',String(zoom));const canvas=q('.image-canvas');requestAnimationFrame(()=>canvas.scrollTo({left:zoom?(canvas.scrollWidth-canvas.clientWidth)/2:0,top:zoom?(canvas.scrollHeight-canvas.clientHeight)/2:0,behavior:'instant'}));});
 q('#save-project').addEventListener('click',()=>{try{if(isSaved()){localStorage.removeItem(storageKey);toast('Выбор удалён из сохранённых');}else{localStorage.setItem(storageKey,JSON.stringify(current()));chosen=true;toast('Выбор сохранён в этом браузере');}savedButton();}catch{toast('Не удалось сохранить выбор. Используйте ссылку на проект.');}});
 function configurationUrl(){const url=new URL(location.href);url.hash='atelier';const state=current();Object.entries(state).forEach(([key,value])=>{if(value===null)url.searchParams.delete(key);else url.searchParams.set(key,value);});url.searchParams.set('lang',window.IBRI18N?.language||'ru');return url.href;}
 q('#share-project').addEventListener('click',async()=>{const url=configurationUrl();history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url);toast('Ссылка на выбранный проект скопирована');}catch{toast('Ссылка на проект — в адресной строке браузера');}});
 function createPrint(){const m=model(),s=m.styles[style],p=m.plans[plan];q('#print-sheet').innerHTML=`<img class="print-logo" src="assets/logo.webp" alt="IBR HOMES"><h1>${esc(t(m.name))}</h1><p>${esc(t(s.name))} · ${esc(t(p.name))}${color!==null?' · '+esc(t('Пожелание по цвету'))+': '+esc(t(colors[color])):''}</p><img class="print-cover" src="${s.image}" alt=""><dl>${[['Размеры по плану',m.size],['Помещения',m.roomCount],['Архитектура',s.name],['Планировка 2D',p.name]].map(([k,v])=>`<div><dt>${esc(t(k))}</dt><dd>${esc(t(v))}</dd></div>`).join('')}</dl><p>${esc(t(m.text))}</p><p class="print-foot">IBR HOMES · +7 700 724 91 23<br>${esc(t('Визуализация проекта. Комплектацию согласуем индивидуально.'))}</p><div class="print-page"><h2>${esc(t('Планировка 2D'))}</h2><p>${esc(t(p.text))}</p><img class="print-plan" src="${p.image}" alt=""><p class="print-foot">${esc(t('Размеры указаны по исходным планам. Терраса и крыльцо показаны отдельно.'))}</p></div>`;}
 q('#print-project').addEventListener('click',async e=>{const button=e.currentTarget;button.disabled=true;try{createPrint();await Promise.allSettled(qa('#print-sheet img').map(img=>img.decode()));window.print();}finally{button.disabled=false;}});
 const form=q('#request-form');
 function requestProject(){const m=model();q('#request-project').innerHTML=requestHasModel?`<img src="${m.styles[style].image}" alt=""><div><strong>${esc(m.name)}</strong><p>${esc(m.styles[style].name)} · ${esc(m.plans[plan].name)}${color!==null?' · '+esc(colors[color]):''}</p></div>`:'<div><strong>Индивидуальный проект</strong><p>Архитектуру и планировку выберем вместе</p></div>';}
 function openRequest(){requestHasModel=chosen;form.hidden=false;q('#request-result').hidden=true;lastDraft=null;form.elements.direction.value=requestHasModel?model().project:'Дом';requestProject();q('.form-error').textContent='';openDialog(q('#request'));}
 qa('[data-contact]').forEach(b=>b.addEventListener('click',()=>{if(b.closest('.project-info'))chosen=true;openRequest();}));
 form.elements.direction.addEventListener('change',e=>{requestHasModel=chosen&&e.target.value===model().project;requestProject();});
 form.addEventListener('input',e=>{e.target.setCustomValidity?.('');q('.form-error').textContent='';});
 function prepareDraft(values){const lines=[t('Здравствуйте! Хочу обсудить проект IBR HOMES.'),`${t('Направление')}: ${t(values.direction)}`];if(requestHasModel){const m=model();lines.push(`${t('Проект')}: ${t(m.name)}`,`${t('Архитектура')}: ${t(m.styles[style].name)}`,`${t('Планировка 2D')}: ${t(m.plans[plan].name)}`,`${t('Размеры по плану')}: ${m.size}`);if(color!==null)lines.push(`${t('Пожелание по цвету')}: ${t(colors[color])}`);}lines.push(`${t('Имя')}: ${values.name}`,`${t('Телефон')}: ${values.phone}`,`${t('Город строительства')}: ${values.city}`,`${t('Участок')}: ${t(values.plot)}`);if(values.comment)lines.push(`${t('Пожелания')}: ${values.comment}`);lines.push(t('Согласен передать эти данные IBR HOMES для обсуждения заявки.'));const message=lines.join('\n');q('#request-summary').textContent=message;q('#request-send').href='https://wa.me/77007249123?text='+encodeURIComponent(message);}
 form.addEventListener('submit',e=>{e.preventDefault();for(const el of form.querySelectorAll('input,textarea,select')){el.setCustomValidity('');if(el.required&&el.type!=='checkbox'&&!el.value.trim())el.setCustomValidity(t('Заполните это поле.'));if(el.name==='phone'&&(!/^\+?[\d\s()\-]+$/.test(el.value.trim())||el.value.replace(/\D/g,'').length<10||el.value.replace(/\D/g,'').length>15))el.setCustomValidity(t('Укажите корректный номер телефона с кодом страны.'));if(el.name==='consent'&&!el.checked)el.setCustomValidity(t('Для продолжения подтвердите согласие.'));if(!el.checkValidity()){el.reportValidity();q('.form-error').textContent='Проверьте выделенное поле.';return;}}lastDraft=Object.fromEntries(new FormData(form));for(const key of Object.keys(lastDraft))lastDraft[key]=lastDraft[key].trim();prepareDraft(lastDraft);form.hidden=true;q('#request-result').hidden=false;q('#request').scrollTop=0;});
 q('#request-edit').addEventListener('click',()=>{form.hidden=false;q('#request-result').hidden=true;});
 addEventListener('ibr:language',()=>{renderProject();if(q('#comparison').open)renderComparison();selectLayer(layer);paintColor(color??0);if(q('#request').open){requestProject();if(lastDraft)prepareDraft(lastDraft);}form.querySelectorAll('input').forEach(el=>el.setCustomValidity(''));});
 addEventListener('resize',()=>selectLayer(layer));
 reduced.addEventListener('change',reveal);
 let scrollFrame=0;const updateHeader=()=>{scrollFrame=0;q('.site-header').classList.toggle('is-scrolled',scrollY>40);};addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateHeader);},{passive:true});updateHeader();
 renderCollection();renderProject();paintColor(color??0);selectLayer(0);reveal();
 if(hasLink)requestAnimationFrame(()=>q('#atelier').scrollIntoView({behavior:'instant'}));
})();
