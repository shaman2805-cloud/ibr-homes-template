'use strict';
(() => {
 document.querySelectorAll('.steps-scene').forEach(section => {
  const viewport = section.querySelector('.steps-window');
  const track = section.querySelector('.timeline');
  if (!track || !viewport) return;
  const cards = [...track.children];
  const links = [...section.querySelectorAll('[data-step]')];
  const counter = section.querySelector('.steps-current');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const last = cards.length - 1;
  let frame = 0, distance = 0, position = 0, previousTime = 0, active = -1;

  function select(index) {
   if (index === active) return;
   active = index;
   if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
   links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
   });
   cards.forEach((card, i) => card.classList.toggle('step-active', i === index));
  }

  // Pause at each stage for reading, then ease into the next leftward move.
  function targetPosition() {
   const span = Math.max(1, section.offsetHeight - innerHeight);
   const raw = clamp(-section.getBoundingClientRect().top / span);
   const phase = clamp((raw - .06) / .84) * last;
   const stage = Math.floor(phase);
   const blend = clamp((phase - stage - .13) / .74);
   return (stage + blend * blend * (3 - 2 * blend)) / last;
  }

  function paint() {
   track.style.transform = `translate3d(${-distance * position}px,0,0)`;
   links.forEach((link, i) => link.style.setProperty('--stage-fill', clamp(position * last - i + 1)));
   select(Math.min(last, Math.round(position * last)));
  }

  function draw(time) {
   frame = 0;
   if (!section.classList.contains('is-horizontal')) {
    const nearest = cards.reduce((best, card, i) => Math.abs(card.getBoundingClientRect().top - 150) < Math.abs(cards[best].getBoundingClientRect().top - 150) ? i : best, 0);
    select(nearest);
    return;
   }
   const target = targetPosition();
   const elapsed = previousTime ? Math.min(64, time - previousTime) : 16;
   previousTime = time;
   // Time-based damping keeps wheel and touch smooth at any refresh rate.
   position += (target - position) * (1 - Math.exp(-elapsed / 85));
   if (Math.abs(target - position) < .00003) position = target;
   paint();
   if (position !== target) frame = requestAnimationFrame(draw);
   else previousTime = 0;
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function resize() {
   section.classList.toggle('is-horizontal', innerHeight >= 620 && !reduced.matches);
   if (section.classList.contains('is-horizontal')) {
    const width = viewport.getBoundingClientRect().width;
    section.style.setProperty('--step-width', `${width}px`);
    section.style.setProperty('--steps-distance', `${Math.max(2100, innerHeight * last * .95)}px`);
    distance = Math.max(0, track.getBoundingClientRect().width - width);
    position = targetPosition();
    paint();
   } else {
    track.style.removeProperty('transform');
    section.style.removeProperty('--step-width');
    section.style.removeProperty('--steps-distance');
    links.forEach(link => link.style.removeProperty('--stage-fill'));
   }
   previousTime = 0;
   schedule();
  }

  function goTo(index) {
   if (!section.classList.contains('is-horizontal')) {
    cards[index].scrollIntoView({ behavior: 'instant', block: 'start' });
    return;
   }
   const top = scrollY + section.getBoundingClientRect().top;
   const span = section.offsetHeight - innerHeight;
   scrollTo({ top: top + span * (.06 + .84 * index / last), behavior: 'smooth' });
  }
  links.forEach((link, index) => {
   link.addEventListener('click', event => { event.preventDefault(); goTo(index); });
   link.addEventListener('keydown', event => {
    const next = { ArrowRight: Math.min(last, index + 1), ArrowLeft: Math.max(0, index - 1), Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    links[next].focus({ preventScroll: true });
    goTo(next);
   });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  addEventListener('load', resize);
  reduced.addEventListener('change', resize);
  resize();
 });
})();
