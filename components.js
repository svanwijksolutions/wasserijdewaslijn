/**
 * components.js
 * Waterdicht pad-systeem voor GitHub Pages in een submap.
 * Werkt ook met hoofdlettergevoelige mapnamen (Components vs components).
 */
async function loadComponents(activePage) {

    // ── Bepaal de root van het project dynamisch ─────────────
    // window.location.pathname = bijv. /wasserijdewaslijn/diensten.html
    // We pakken het pad tot en met de submap, ongeacht bestandsnaam.
    const scriptTag = document.querySelector('script[src*="components.js"]');
    const scriptSrc = scriptTag ? scriptTag.getAttribute('src') : 'components.js';

    // Bepaal de base: map waar components.js in staat (= root van project)
    const base = scriptSrc.includes('/')
        ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1)
        : '';

    // Probeer beide hoofdletter-varianten van de map
    const folderVariants = ['Components', 'components'];

    const headerHTML = await fetchFirstMatch(base, folderVariants, 'header.html');
    const footerHTML = await fetchFirstMatch(base, folderVariants, 'footer.html');

    // ── Injecteren ───────────────────────────────────────────
    if (headerHTML) {
        document.getElementById('header-placeholder').innerHTML = headerHTML;
        setActiveNav(activePage);
        initHeader();
    } else {
        console.error('header.html kon niet worden gevonden in Components/ of components/');
    }

    if (footerHTML) {
        document.getElementById('footer-placeholder').innerHTML = footerHTML;
    } else {
        console.error('footer.html kon niet worden gevonden in Components/ of components/');
    }

    // ── Scroll reveal ────────────────────────────────────────
    initReveal();
}

/**
 * Probeert meerdere mapvarianten totdat één succesvol laadt.
 * Geeft de HTML-tekst terug, of null als niets werkt.
 */
async function fetchFirstMatch(base, folders, filename) {
    for (const folder of folders) {
        const url = `${base}${folder}/${filename}`;
        try {
            const res = await fetch(url);
            if (res.ok) return await res.text();
        } catch (_) {
            // Probeer volgende variant
        }
    }
    return null;
}

/**
 * Markeert de actieve navigatielink op basis van de paginanaam.
 */
function setActiveNav(page) {
    document.querySelectorAll('#nav-menu a[data-page]').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
}

/**
 * Initialiseert header-gedrag: scroll-schaduw + hamburger menu.
 */
function initHeader() {
    const header = document.getElementById('site-header');
    const burger = document.getElementById('hamburger');
    const menu   = document.getElementById('nav-menu');

    if (!header || !burger || !menu) return;

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Scroll-reveal via IntersectionObserver.
 */
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
}