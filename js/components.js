/**
 * js/components.js
 * Laadt components/header.html en components/footer.html dynamisch.
 * Werkt op GitHub Pages (submap) én lokaal.
 */
async function loadComponents(activePage) {
  const script = document.querySelector('script[src*="components.js"]');
  const src    = script ? script.getAttribute('src') : 'js/components.js';
  // base = alles vóór /js/components.js → root van het project
  const base   = src.includes('/') ? src.substring(0, src.lastIndexOf('/js/') + 1) : '';

  const [headerHTML, footerHTML] = await Promise.all([
    fetchFile(base + 'components/header.html'),
    fetchFile(base + 'components/footer.html'),
  ]);

  if (headerHTML) {
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    setActiveNav(activePage);
    initHeader();
  }
  if (footerHTML) {
    document.getElementById('footer-placeholder').innerHTML = footerHTML;
  }

  initReveal();
}

async function fetchFile(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
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

  // Scroll schaduw
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Sluit menu bij klik op link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Sluit menu bij klik buiten header
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