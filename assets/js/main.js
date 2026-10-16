document.documentElement.classList.add('js');

// Keyboard navigation stays immediate; press motion is reserved for pointer input.
document.addEventListener('pointerdown', () => {
  document.documentElement.dataset.input = 'pointer';
}, { passive: true });
document.addEventListener('keydown', () => {
  document.documentElement.dataset.input = 'keyboard';
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
if (menu && nav) {
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const wasOpen = menu.getAttribute('aria-expanded') === 'true';
    closeMenu();
    if (wasOpen) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(entry => entry.section);
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  let current = nav.querySelector('a[aria-current]') || links[0];

  const positionIndicator = () => {
    if (!current || getComputedStyle(nav).position !== 'fixed') return;
    const y = current.offsetTop + (current.offsetHeight - indicator.offsetHeight) / 2;
    indicator.style.transform = `translateY(${y}px)`;
  };
  const updateCurrentSection = () => {
    if (!sections.length) return;
    const boundary = innerHeight * .35;
    const atBottom = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2;
    let active = sections[0];
    for (const entry of sections) {
      if (entry.section.getBoundingClientRect().top <= boundary) active = entry;
    }
    if (atBottom) active = sections[sections.length - 1];
    if (current !== active.link) {
      current = active.link;
      links.forEach(link => {
        if (link === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    positionIndicator();
  };
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      updateCurrentSection();
    });
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(nav);
    observer.observe(document.querySelector('main'));
  }
  document.fonts.ready.then(scheduleUpdate);
  updateCurrentSection();
  requestAnimationFrame(() => indicator.classList.add('is-ready'));
}

const cards = [...document.querySelectorAll('[data-category]')];
const filters = [...document.querySelectorAll('[data-filter]')];
for (const button of filters) {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach(card => { card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category); });
    const count = cards.filter(card => !card.hidden).length;
    const output = document.querySelector('.project-count');
    if (output) output.textContent = `${String(count).padStart(2, '0')} projects`;
  });
}

document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
