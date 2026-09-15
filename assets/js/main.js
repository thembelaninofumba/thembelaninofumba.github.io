document.documentElement.classList.add('js');

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
  matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of nav.querySelectorAll('a')) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  }
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
