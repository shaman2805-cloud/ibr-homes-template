'use strict';
(() => {
 const section = document.querySelector('#facades');
 if (!section) return;
 const colors = [ ['gray','Антрацит'], ['white','Белый'], ['oak','Дуб'], ['cognac','Коньячный'] ];
 const stage = section.querySelector('.facade-images');
 const frames = [...stage.querySelectorAll('img')];
 const swatches = [...section.querySelectorAll('[data-facade-color]')];
 const lights = [...section.querySelectorAll('[data-facade-light]')];
 const label = section.querySelector('.facade-scene-label');
 const status = section.querySelector('#facade-status');
 const t = value => window.IBRI18N?.t(value) || value;
 let color = 0, mood = 'day', committedColor = 0, committedMood = 'day', activeFrame = 0, ticket = 0, chosen = false;
 window.IBRPalette = { get name() { return chosen ? colors[committedColor][1] : null; } };
 function source(index, lighting, small = false) {
  return `assets/facades/${colors[index][0]}${lighting === 'night' ? '-night' : ''}${small ? '-small' : ''}.webp`;
 }
 function controls() {
  swatches.forEach((button, i) => button.setAttribute('aria-pressed', String(i === committedColor)));
  lights.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.facadeLight === committedMood)));
  const caption = `${t(colors[committedColor][1])} · ${t(committedMood === 'night' ? 'Ночь' : 'День')}`;
  label.textContent = caption;
  stage.setAttribute('aria-label', `${t('Цвет фасада')}: ${caption}`);
 }
 async function show() {
  const request = ++ticket, nextColor = color, nextMood = mood;
  const frameIndex = 1 - activeFrame, image = frames[frameIndex];
  section.setAttribute('aria-busy', 'true');
  image.srcset = `${source(nextColor,nextMood,true)} 800w, ${source(nextColor,nextMood)} ${nextMood === 'night' || nextColor !== 3 ? 1672 : 1920}w`;
  image.sizes = '(max-width:700px) 100vw, 94vw';
  image.src = source(nextColor,nextMood);
  try {
   await image.decode();
   if (request !== ticket) return;
   frames[activeFrame].classList.remove('is-active');
   image.classList.add('is-active');
   activeFrame = frameIndex; committedColor = nextColor; committedMood = nextMood;
   section.classList.toggle('is-night', committedMood === 'night');
   controls();
   status.textContent = `${t(colors[committedColor][1])} · ${t(committedMood === 'night' ? 'Ночь' : 'День')}`;
  } catch {
   if (request !== ticket) return;
   color = committedColor; mood = committedMood;
   status.textContent = t('Не удалось загрузить изображение. Попробуйте ещё раз.');
  } finally {
   if (request === ticket) section.removeAttribute('aria-busy');
  }
 }
 swatches.forEach((button, index) => button.addEventListener('click', () => { color = index; chosen = true; show(); }));
 lights.forEach(button => button.addEventListener('click', () => { mood = button.dataset.facadeLight; show(); }));
 // All controls remain ordinary tab stops; arrows offer a faster way to compare.
 [swatches, lights].forEach(buttons => buttons.forEach((button, index) => button.addEventListener('keydown', event => {
  const next = { ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
  if (next === undefined) return;
  event.preventDefault(); buttons[next].focus({ preventScroll: true }); buttons[next].click();
 })));
 addEventListener('ibr:language', controls);
 controls();
})();
