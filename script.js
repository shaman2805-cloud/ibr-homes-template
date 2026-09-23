const formats = [
  {
    title: 'Компактный<br>дом',
    summary: 'Продуманное пространство для тех, кому важно всё необходимое — и ничего лишнего.',
    image: 'assets/compact-house.webp',
    alt: 'Концептуальная визуализация компактного CLT-дома',
    select: 'Компактный дом',
    idea: ['Пространство с вашим характером', 'Выберите отправную точку, а мы обсудим, как адаптировать дом под участок, привычки и состав семьи.'],
    planning: ['Каждый метр — по делу', 'Зоны для отдыха, встреч и повседневных дел можно организовать под ваш привычный ритм. Точная планировка создаётся после обсуждения проекта.'],
    appearance: ['Тёплая, лаконичная архитектура', 'Фасад и детали будущего дома обсудим вместе. Изображение выше показывает возможное настроение, а не готовую модель.']
  },
  {
    title: 'Семейный<br>дом',
    summary: 'Место для общих вечеров, личного пространства и планов на годы вперёд.',
    image: 'assets/family-house.webp',
    alt: 'Концептуальная визуализация семейного двухэтажного CLT-дома',
    select: 'Семейный дом',
    idea: ['Дом для разных моментов жизни', 'Общие пространства и тихие уголки складываются в единый сценарий для всей семьи.'],
    planning: ['Пространство для каждого', 'Состав помещений, этажность и связи между зонами определим вместе на основе ваших пожеланий и участка.'],
    appearance: ['Архитектура, к которой хочется возвращаться', 'Дерево, свет и пропорции формируют облик дома. Визуализация служит отправной точкой для обсуждения.']
  },
  {
    title: 'Индивидуальный<br>проект',
    summary: 'Начните с идеи. Поможем превратить ваши пожелания в архитектурное решение.',
    image: 'assets/hero-house.webp',
    alt: 'Концептуальная визуализация индивидуального CLT-дома с террасой',
    select: 'Индивидуальный проект',
    idea: ['Формат начинается с вас', 'Расскажите о вашем образе жизни и участке, чтобы мы вместе нашли подходящее направление проекта.'],
    planning: ['Планировка под вашу задачу', 'Количество и расположение помещений обсуждаются индивидуально. Здесь нет фиксированного набора комнат.'],
    appearance: ['Свой образ будущего дома', 'Форма, материалы и характер фасада станут частью личного проекта после обсуждения с командой.']
  }
];

const formatTabs = [...document.querySelectorAll('.format-tab')];
const detailTabs = [...document.querySelectorAll('.detail-tab')];
const formatPanel = document.getElementById('format-panel');
const detailPanel = document.getElementById('detail-panel');
const formatImage = document.getElementById('format-image');
const formatSelect = document.getElementById('client-format');
let currentFormat = 0;
let currentDetail = 'idea';
let imageChangeTimer;

function renderDetail() {
  const active = detailTabs.find(tab => tab.dataset.detail === currentDetail);
  detailTabs.forEach(tab => {
    const selected = tab === active;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  detailPanel.setAttribute('aria-labelledby', active.id);
  const [title, text] = formats[currentFormat][currentDetail];
  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-text').textContent = text;
  document.getElementById('detail-index').textContent = `${String(currentFormat + 1).padStart(2, '0')} / 03`;
}

function renderFormat(index) {
  if (index < 0 || index >= formats.length) return;
  currentFormat = index;
  const selected = formats[index];
  formatTabs.forEach((tab, tabIndex) => {
    const active = index === tabIndex;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  formatPanel.setAttribute('aria-labelledby', formatTabs[index].id);
  document.getElementById('format-code').textContent = `/ ${String(index + 1).padStart(2, '0')}`;
  document.getElementById('format-title').innerHTML = selected.title;
  document.getElementById('format-summary').textContent = selected.summary;
  document.getElementById('visual-counter').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
  window.clearTimeout(imageChangeTimer);
  formatImage.classList.add('is-fading');
  imageChangeTimer = window.setTimeout(() => {
    formatImage.src = selected.image;
    formatImage.alt = selected.alt;
    formatImage.classList.remove('is-fading');
  }, 130);
  renderDetail();
}

function enableTabKeys(tabs, onSelect) {
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      onSelect(next);
      tabs[next].focus();
    });
  });
}

formatTabs.forEach((tab, index) => tab.addEventListener('click', () => renderFormat(index)));
detailTabs.forEach((tab, index) => {
  tab.id = `detail-tab-${index}`;
  tab.addEventListener('click', () => { currentDetail = tab.dataset.detail; renderDetail(); });
});
enableTabKeys(formatTabs, renderFormat);
enableTabKeys(detailTabs, index => { currentDetail = detailTabs[index].dataset.detail; renderDetail(); });
renderDetail();

document.getElementById('format-cta').addEventListener('click', () => {
  formatSelect.value = formats[currentFormat].select;
});

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
function closeMenu() {
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const opened = mainNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const city = String(data.get('city') || '').trim();
  const format = String(data.get('format') || 'Пока выбираю');
  const message = [
    'Здравствуйте! Хочу обсудить дом с IBR HOMES.',
    `Меня зовут ${name}.`,
    city ? `Место строительства: ${city}.` : '',
    `Интересует: ${format}.`
  ].filter(Boolean).join('\n');
  const url = `https://wa.me/77007249123?text=${encodeURIComponent(message)}`;
  window.location.assign(url);
});

document.getElementById('year').textContent = String(new Date().getFullYear());
