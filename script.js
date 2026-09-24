'use strict';
(() => {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#menu');
  const toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    menu.showModal(); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
  });
  const closeMenu = () => menu.close();
  document.querySelector('.close-menu').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .1 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  const services = document.querySelector('.services');
  const track = document.querySelector('.service-track');
  const story = document.querySelector('.story');
  const heroImage = document.querySelector('.story-bg img');
  let frame = false;
  function animateScroll() {
    frame = false;
    const pageProgress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.querySelector('.reading-progress').style.transform = `scaleX(${pageProgress})`;
    if (innerWidth <= 700 || reduced.matches) { track.style.transform = ''; heroImage.style.transform = ''; return; }
    const section = services.getBoundingClientRect();
    const distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + parseFloat(getComputedStyle(track.parentElement).paddingLeft) * 2);
    const progress = Math.min(1, Math.max(0, -section.top / Math.max(1, services.offsetHeight - innerHeight)));
    document.querySelector('.service-current').textContent = String(Math.min(4, 1 + Math.floor(progress * 4))).padStart(2, '0');
    track.style.transform = `translate3d(${-distance * progress}px,0,0)`;
    const storyProgress = Math.min(1, Math.max(0, -story.getBoundingClientRect().top / story.offsetHeight));
    heroImage.style.transform = `scale(${1.08 + storyProgress * .08})`;
  }
  const schedule = () => { if (!frame) { frame = true; requestAnimationFrame(animateScroll); } };
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); reduced.addEventListener('change', schedule); schedule();

  const form = document.querySelector('#calculator-form');
  form.noValidate = true;
  const panels = [...form.querySelectorAll('.calc-step')];
  const progressLabels = [...document.querySelectorAll('.calc-progress span')];
  const finishNames = { shell: 'Домокомплект', warm: 'Тёплый контур', turnkey: 'Под ключ', advice: 'Нужна консультация' };
  const config = window.IBR_CALCULATOR || { whatsapp: '77007249123', ratesPerSquareMeter: {} };
  let step = 0;
  let whatsAppUrl = '';
  function showStep(index) {
    step = index;
    document.querySelector('.calc-progress').style.setProperty('--calc-step', step);
    panels.forEach((panel, i) => { panel.hidden = i !== step; });
    progressLabels.forEach((label, i) => {
      label.classList.toggle('active', i === step);
      if (i === step) label.setAttribute('aria-current', 'step'); else label.removeAttribute('aria-current');
    });
    panels[step].querySelector('h3').focus({ preventScroll: true });
    document.querySelector('.calc-panel').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  function validate(index) {
    for (const input of panels[index].querySelectorAll('input,select,textarea')) {
      input.setCustomValidity('');
      if (input.required && input.type !== 'checkbox' && !input.value.trim()) input.setCustomValidity('Пожалуйста, заполните это поле.');
      if (input.name === 'phone') {
        const raw = input.value.trim(); const digits = raw.replace(/\D/g, '');
        if (!/^\+?[\d\s()\-]+$/.test(raw) || digits.length < 10 || digits.length > 15) input.setCustomValidity('Введите номер телефона с кодом страны, например +7 700 000 00 00.');
      }
      if (!input.checkValidity()) { if (step !== index) showStep(index); input.reportValidity(); return false; }
    }
    return true;
  }
  form.addEventListener('input', event => { if (event.target.setCustomValidity) event.target.setCustomValidity(''); });
  function values() { return Object.fromEntries([...new FormData(form)].map(([k,v]) => [k, typeof v === 'string' ? v.trim() : v])); }
  function estimate(data) {
    const rate = config.ratesPerSquareMeter?.[data.finish];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return 'Индивидуальный расчёт: стоимость подготовим после уточнения проекта.';
    const sum = Number(data.area) * rate;
    return `Предварительный ориентир: ${new Intl.NumberFormat('ru-RU').format(sum)} ₸. Площадь × базовая ставка; доставка, участок и дополнительные работы уточняются отдельно.`;
  }
  function prepare() {
    const data = values();
    const rows = [ ['Формат',data.format], ['Площадь',`${data.area} м²`], ['Этажей',data.floors], ['Комплектация',finishNames[data.finish]], ['Город / место',data.city], ['Участок',data.plot], ['Начало',data.timing], ['Имя и фамилия',`${data.firstName} ${data.lastName}`], ['Телефон',data.phone] ];
    if (data.comment) rows.push(['Пожелания',data.comment]);
    const summary = document.querySelector('#request-summary'); summary.replaceChildren();
    for (const [title,value] of rows) {
      const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
      dt.textContent = title; dd.textContent = value; row.append(dt,dd); summary.append(row);
    }
    const price = estimate(data); document.querySelector('#estimate').textContent = price;
    const message = ['Здравствуйте! Хочу обсудить проект дома IBR HOMES.', ...rows.map(([k,v]) => `${k}: ${v}`), price, 'Согласен передать эти данные IBR HOMES для обсуждения проекта.'].join('\n');
    whatsAppUrl = `https://wa.me/${String(config.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    const fallback = document.querySelector('#whatsapp-fallback'); fallback.href = whatsAppUrl; fallback.hidden = true;
    document.querySelector('#send-status').textContent = '';
  }
  function next() { if (validate(step)) { if (step === 1) prepare(); showStep(step + 1); } }
  form.querySelectorAll('.next-step').forEach(button => button.addEventListener('click', next));
  form.querySelectorAll('.back-step').forEach(button => button.addEventListener('click', () => showStep(step - 1)));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step < 2) { next(); return; }
    if (!validate(0) || !validate(1)) return;
    prepare();
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    document.querySelector('#send-status').textContent = 'Сообщение подготовлено. Отправьте его в открывшемся WhatsApp — до этого заявка не поступит в компанию.';
    document.querySelector('#whatsapp-fallback').hidden = false;
  });
  document.querySelectorAll('[data-format]').forEach(link => link.addEventListener('click', () => { form.elements.format.value = link.dataset.format; showStep(0); }));
})();
