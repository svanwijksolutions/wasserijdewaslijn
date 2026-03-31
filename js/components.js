/**
 * js/components.js
 * Laadt Components/header.html en Components/footer.html.
 * Werkt lokaal (file://) én op GitHub Pages.
 */
async function loadComponents(activePage) {

  // Bepaal de root van het project op basis van het script-pad
  const script = document.querySelector('script[src*="components.js"]');
  const src    = script ? script.getAttribute('src') : 'js/components.js';
  // src = "js/components.js"  →  base = ""  (root = zelfde map als de HTML)
  const base   = src.includes('/') ? src.substring(0, src.indexOf('/js/') + 1) : '';

  // Probeer hoofdletter én kleine letter variant
  const [headerHTML, footerHTML] = await Promise.all([
    fetchFirstMatch(base, ['Components', 'components'], 'header.html'),
    fetchFirstMatch(base, ['Components', 'components'], 'footer.html'),
  ]);

  if (headerHTML) {
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    setActiveNav(activePage);
    initHeader();
  } else {
    console.error('header.html niet gevonden');
  }

  if (footerHTML) {
    document.getElementById('footer-placeholder').innerHTML = footerHTML;
  } else {
    console.error('footer.html niet gevonden');
  }

  initReveal();
}

async function fetchFirstMatch(base, folders, filename) {
  for (const folder of folders) {
    const url = `${base}${folder}/${filename}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch (_) { /* probeer volgende */ }
  }
  return null;
}

function setActiveNav(page) {
  document.querySelectorAll('#nav-menu a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

function initHeader() {
  const header = document.getElementById('site-header');
  const burger = document.getElementById('hamburger');
  const menu   = document.getElementById('nav-menu');
  if (!header || !burger || !menu) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target) && menu.classList.contains('open')) closeMenu();
  });

  function closeMenu() {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger > *').forEach(el => obs.observe(el));
}