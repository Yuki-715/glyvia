function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
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

function setupLanguageSwitcher() {
  const group = document.querySelector('.language');
  if (!group) return;

  const buttons = [...group.querySelectorAll('[data-language]')];
  const text = [...document.querySelectorAll('[data-en]')].map((element) => ({
    element, original: element.textContent, translation: element.dataset.en,
  }));
  const attributes = ['aria-label', 'alt', 'content'].flatMap((attribute) => {
    const key = attribute === 'aria-label' ? 'data-en-label' : `data-en-${attribute}`;
    return [...document.querySelectorAll(`[${key}]`)].map((element) => ({
      element, attribute, original: element.getAttribute(attribute), translation: element.getAttribute(key),
    }));
  });
  const sections = [...document.querySelectorAll('main > section')];
  const header = document.querySelector('.site-header');

  function languageFromUrl() {
    return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'zh-CN';
  }

  function renderLanguage(language) {
    if (document.documentElement.lang === language) return;
    const english = language === 'en';
    document.documentElement.lang = language;
    for (const entry of text) {
      entry.element.textContent = english ? entry.translation : entry.original;
    }
    for (const entry of attributes) {
      entry.element.setAttribute(entry.attribute, english ? entry.translation : entry.original);
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const language = button.dataset.language;
      if (document.documentElement.lang === language) return;

      const readingLine = header.getBoundingClientRect().bottom + 24;
      const section = sections.find((item) => item.getBoundingClientRect().bottom > readingLine);
      const previousTop = section?.getBoundingClientRect().top;
      renderLanguage(language);

      const url = new URL(window.location.href);
      if (language === 'en') url.searchParams.set('lang', language);
      else url.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', url);
      if (section) window.scrollBy(0, section.getBoundingClientRect().top - previousTop);
    });
  }

  renderLanguage(languageFromUrl());
  window.addEventListener('popstate', () => renderLanguage(languageFromUrl()));
  group.hidden = false;
}

setupMobileMenu();
setupLanguageSwitcher();
