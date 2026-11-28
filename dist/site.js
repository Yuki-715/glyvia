function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle], .menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.body.classList.add('menu-ready');
  toggle.hidden = false;
}

// English is the source text in the HTML; Chinese lives in data-zh attributes.
function setupLanguageSwitcher() {
  const group = document.querySelector('.language');
  if (!group) return;

  const buttons = [...group.querySelectorAll('[data-language]')];
  const text = [...document.querySelectorAll('[data-zh]')].map((element) => ({
    element, original: element.textContent, translation: element.dataset.zh,
  }));
  const attributes = ['aria-label', 'alt', 'content'].flatMap((attribute) => {
    const key = attribute === 'aria-label' ? 'data-zh-label' : `data-zh-${attribute}`;
    return [...document.querySelectorAll(`[${key}]`)].map((element) => ({
      element, attribute, original: element.getAttribute(attribute), translation: element.getAttribute(key),
    }));
  });
  const sections = [...document.querySelectorAll('main > section')];
  const header = document.querySelector('.site-header');
  let current = 'en';

  function languageFromUrl() {
    return new URLSearchParams(window.location.search).get('lang') === 'zh' ? 'zh-CN' : 'en';
  }

  function renderLanguage(language) {
    if (current === language) return;
    current = language;
    const chinese = language === 'zh-CN';
    document.documentElement.lang = language;
    for (const entry of text) entry.element.textContent = chinese ? entry.translation : entry.original;
    for (const entry of attributes) {
      entry.element.setAttribute(entry.attribute, chinese ? entry.translation : entry.original);
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const language = button.dataset.language;
      if (current === language) return;

      // Keep the section the reader is looking at in place when text length changes.
      const readingLine = header.getBoundingClientRect().bottom + 24;
      const section = sections.find((item) => item.getBoundingClientRect().bottom > readingLine);
      const previousTop = section?.getBoundingClientRect().top;
      renderLanguage(language);

      const url = new URL(window.location.href);
      if (language === 'zh-CN') url.searchParams.set('lang', 'zh');
      else url.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', url);
      if (section) window.scrollBy(0, section.getBoundingClientRect().top - previousTop);
    });
  }

  renderLanguage(languageFromUrl());
  window.addEventListener('popstate', () => renderLanguage(languageFromUrl()));
  group.hidden = false;
}
function setupNavHighlight() {
  const links = [...document.querySelectorAll('#site-nav a[href^="#"]')];
  const targets = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window) || targets.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      }
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  for (const target of targets) observer.observe(target);
}

// Marks today's date on the research-plan chart while the plan is running.
function setupGanttToday() {
  const gantt = document.querySelector('.gantt[data-start]');
  const marker = gantt?.querySelector('.g-today');
  if (!marker) return;

  const start = new Date(`${gantt.dataset.start}T00:00:00`);
  const days = Number(gantt.dataset.weeks) * 7;
  const elapsed = (Date.now() - start.getTime()) / 86400000;
  if (Number.isNaN(elapsed) || elapsed < 0 || elapsed > days) return;

  marker.style.setProperty('--p', (elapsed / days).toFixed(4));
  marker.hidden = false;
}

setupMobileMenu();
setupLanguageSwitcher();
setupNavHighlight();
setupGanttToday();