/* ════════════════════════════════════════════════════
   AKHTAR IMAM PORTFOLIO — main.js
   Features: dark/light toggle | menu overlay |
             project filtering | scroll reveal |
             smooth scroll | header scroll state |
             contact form
════════════════════════════════════════════════════ */

'use strict';

// ─── DOM REFS ───────────────────────────────────────
const html = document.documentElement;
const body = document.body;
const header = document.getElementById('header');
const themeToggle = document.getElementById('theme-toggle');
const menuToggle = document.getElementById('menu-toggle');
const fullscreenMenu = document.getElementById('fullscreen-menu');
const menuLinks = document.querySelectorAll('.menu-link');
const genesisTrack = document.getElementById('genesis-track');
const projectsList = document.getElementById('projects-list');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');
const carouselDots = document.getElementById('carousel-dots');
let genesisItems = [];
let currentCarouselIndex = 0;

function escapeHtml(s) {
  if (s == null) return '';
  const t = String(s);
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let revealEls = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

// Modal DOM Refs
const modalOut = document.getElementById('project-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalTag = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalSummary = document.getElementById('modal-summary');
const modalLocation = document.getElementById('modal-location');
const modalArea = document.getElementById('modal-area');
const modalClient = document.getElementById('modal-client');
const modalType = document.getElementById('modal-type');
const modalStatus = document.getElementById('modal-status');
const modalRole = document.getElementById('modal-role');


// ─── THEME (dark / light) ───────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', saved);
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ─── FULLSCREEN MENU ─────────────────────────────────
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  body.classList.add('menu-open');
  if (fullscreenMenu) fullscreenMenu.classList.add('open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'true');
    const label = menuToggle.querySelector('.menu-label');
    if (label) label.textContent = 'Close';
  }
  body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOpen = false;
  body.classList.remove('menu-open');
  if (fullscreenMenu) fullscreenMenu.classList.remove('open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    const label = menuToggle.querySelector('.menu-label');
    if (label) label.textContent = 'Menu';
  }
  body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    menuOpen ? closeMenu() : openMenu();
  });
}

menuLinks.forEach(link => {
  link.addEventListener('click', () => { closeMenu(); });
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});


// ─── HEADER SCROLL STATE ─────────────────────────────
let lastScroll = 0;
const scrollThreshold = 60;

function onScroll() {
  const y = window.scrollY;
  // Add .scrolled class for glassmorphism
  if (y > scrollThreshold) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = y;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load


// ─── SCROLL REVEAL (Intersection Observer) ───────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // once only
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));


// ─── CAROUSEL HELPERS ─────────────────────────────────
function getVisibleItems() {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  return isMobile ? 1 : (isTablet ? 2 : 3);
}

function getPages() {
  const visible = getVisibleItems();
  return Math.max(1, Math.ceil(genesisItems.length / visible));
}

function rebuildDots() {
  if (!carouselDots) return;
  carouselDots.innerHTML = '';
  const pages = getPages();
  for (let i = 0; i < pages; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `carousel-dot ${i === currentCarouselIndex ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.onclick = () => goToSlide(i);
    carouselDots.appendChild(dot);
  }
}

function getCategoryLabel(category) {
  if (category === 'residential') return 'High Rise Residential';
  if (category === 'it-office') return 'Commercial Buildings';
  if (category === 'villas') return 'Villas';
  if (category === 'healthcare') return 'Commercial Buildings';
  if (category === 'masterplan') return 'Commercial Buildings';
  return 'Commercial Buildings';
}

function toTitleCase(s) {
  if (!s) return '';
  // Preserve common acronyms
  const preserve = new Set(['DSR', 'AWHO', 'ARK', 'KE', 'WF']);
  return s
    .split(' ')
    .map(w => {
      const clean = w.replace(/[^A-Za-z]/g, '');
      if (preserve.has(clean.toUpperCase())) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

const IMAGE_POSITION_OVERRIDES = {
  'POULOMI FLORIQUE': 'center top'
};

// Fixed carousel ordering (as requested)
const CAROUSEL_ORDER = [
  "Arsis Dommasandra",
  "DSR EVOQ",
  "Highland Greenz",
  "Ozone Polestar",
  "AWHO Tundup Vihar",
  "Adora De Goa",
  "The Tree",
  "DSR THE ADDRESS",
  "ARK OAK TREE",
  "Shimmering Heights",
  "Assetz Jakkur",
  "Amitha Wisdom Homes",
  "AWHO Clubhouse",
  "Ozone WF 48",
  "SLK Green Park",
  "Vaishnavi IT Park",
  "Shilpita Tech Park",
  "Adani Tiroda Township",
  "Adani Kawai Township",
  "PAVANI MIRABILIA",
  "POULOMI FLORIQUE",
  "DSR ELIXIR VILLAS",
  "Purva Zenium"
];

async function loadJsonCarousel(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(data?.projects) && data.projects.length > 0) return data.projects;
    return null;
  } catch (_) {
    return null;
  }
}

// ─── DYNAMIC PROJECTS RENDER ───────────────────────────
async function renderProjects() {
  try {
    if (typeof PROJECTS === 'undefined') return;

    const portfolioCarousel = await loadJsonCarousel('portfolio_carousel.json');
    const pdfCarousel = portfolioCarousel || await loadJsonCarousel('pdf_carousel.json');

    const orderedNames = CAROUSEL_ORDER;

    const imageMap = {};
    if (pdfCarousel && pdfCarousel.length) {
      pdfCarousel.forEach(x => {
        const n = typeof x === 'string' ? x : x?.name;
        const img = typeof x === 'object' ? x?.image : undefined;
        if (n && img) imageMap[n.toLowerCase().trim()] = img;
      });
    }

    const projectByName = new Map(
      PROJECTS.map((proj, idx) => [proj.name.toLowerCase().trim(), { ...proj, originalIdx: idx }])
    );

    genesisItems = orderedNames
      .map(name => projectByName.get(name.toLowerCase().trim()))
      .filter(Boolean)
      .map(p => {
        const key = p.name.toLowerCase().trim();
        return imageMap[key] ? { ...p, image: imageMap[key] } : p;
      });

    if (genesisTrack) {
      genesisTrack.innerHTML = '';
      if (carouselDots) carouselDots.innerHTML = '';

      genesisItems.forEach((proj, idx) => {
        const imgSrc = proj.image || 'images/residential.png';
        const itemHTML = `
        <article class="carousel-item" data-modal-idx="${proj.originalIdx}">
          <img class="carousel-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(proj.name)}" loading="lazy" />
          <div class="carousel-caption">
            <h3>${escapeHtml(toTitleCase(proj.name))}</h3>
            <p>${escapeHtml(proj.location || '')}</p>
          </div>
        </article>
      `;
        genesisTrack.insertAdjacentHTML('beforeend', itemHTML);

        const itemEl = genesisTrack.lastElementChild;
        if (itemEl) {
          const img = itemEl.querySelector('.carousel-img');
          if (img) {
            img.onerror = function () {
              if (this._fallbacks && this._fallbacks.length) {
                const next = this._fallbacks.shift();
                this.src = next;
              } else {
                this.src = 'images/residential.png';
                this.onerror = null;
              }
            };
            // Per-project object-position override to improve composition
            const pos = IMAGE_POSITION_OVERRIDES[proj.name];
            if (pos) img.style.objectPosition = pos;
            const slug = (proj.name || '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            const candidates = [];
            if (proj.image) candidates.push(proj.image);
            candidates.push(`Images for Portfolio/${proj.name}.png`);
            candidates.push(`Images for Portfolio/${proj.name}.jpg`);
            candidates.push(`Images for Portfolio/${proj.name}.jpeg`);
            candidates.push(`Images for Portfolio/${proj.name}.webp`);
            candidates.push(`Images for Portfolio/${proj.name}.avif`);
            candidates.push(`images/genesis/${slug}.png`);
            candidates.push(`images/genesis/${slug}.jpg`);
            candidates.push(`images/genesis/${slug}.webp`);
            img._fallbacks = candidates.filter(p => p !== img.src);
            img.addEventListener('load', () => {
              updateCarousel();
            }, { once: true });
          }
          itemEl.addEventListener('click', () => openModal(proj.originalIdx));
        }
      });
      currentCarouselIndex = 0;
      rebuildDots();
      setTimeout(() => updateCarousel(), 0);
    }

    if (projectsList) {
      projectsList.innerHTML = '';

      function groupKey(category) {
        const cat = category || '';
        if (cat === 'residential' || cat === 'villas') return 'Residential';
        return 'Commercial';
      }
      const byCategory = new Map();
      PROJECTS.forEach((proj, idx) => {
        const key = groupKey(proj.category);
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push({ proj, idx });
      });

      const categories = ['Residential', 'Commercial'];

      function buildCategoryCard(category, cIdx) {
        const items = byCategory.get(category) || [];
        const delay = (cIdx % 10) * 0.05;
        const section = document.createElement('section');
        section.className = 'city-card reveal';
        section.style.setProperty('--delay', `${delay}s`);
        section.innerHTML = `
        <h3 class="city-title">${escapeHtml(category)}</h3>
        <ul class="city-list"></ul>
      `;
        const ul = section.querySelector('.city-list');
        items.forEach(({ proj, idx }) => {
          let tagDisplay = getCategoryLabel(proj.category);
          const li = document.createElement('li');
          li.className = 'city-project';
          li.innerHTML = `
          <div class="city-project-main">
            <span class="city-project-name">${proj.name}</span>
            <span class="city-project-meta">${tagDisplay} • ${proj.location}</span>
          </div>
          <button type="button" class="city-project-open" aria-label="Open details">View</button>
        `;
          li.addEventListener('click', () => openModal(idx));
          const btn = li.querySelector('.city-project-open');
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              openModal(idx, { noPhoto: true });
            });
          }
          ul.appendChild(li);
        });
        return section;
      }

      const container = document.createElement('div');
      container.className = 'cities-grid';
      const leftCol = document.createElement('div');
      leftCol.className = 'cities-column-left';
      const rightCol = document.createElement('div');
      rightCol.className = 'cities-column-right';

      categories.forEach((cat, cIdx) => {
        const card = buildCategoryCard(cat, cIdx);
        if (cat === 'Residential') {
          leftCol.appendChild(card);
        } else {
          rightCol.appendChild(card);
        }
      });

      container.appendChild(leftCol);
      container.appendChild(rightCol);
      projectsList.appendChild(container);
    }

    revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach(el => revealObserver.observe(el));
    initCardCursors();
    currentCarouselIndex = 0;
    updateCarousel();
    if (genesisItems.length <= 1) {
      carouselPrev?.setAttribute('disabled', 'true');
      carouselNext?.setAttribute('disabled', 'true');
    } else {
      carouselPrev?.removeAttribute('disabled');
      carouselNext?.removeAttribute('disabled');
    }
  } catch (e) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

// ─── CAROUSEL LOGIC ────────────────────────────────────
function updateCarousel() {
  if (!genesisTrack || genesisItems.length === 0) return;
  const visibleItems = getVisibleItems();
  const pages = getPages();
  const maxPage = pages - 1;
  if (currentCarouselIndex > maxPage) currentCarouselIndex = maxPage;

  // Pixel-accurate translate to avoid gap misalignment and hidden last slides
  const firstItem = genesisTrack.querySelector('.carousel-item');
  if (firstItem) {
    const itemWidth = Math.max(firstItem.getBoundingClientRect().width, firstItem.offsetWidth);
    let gap = 30;
    const children = genesisTrack.querySelectorAll('.carousel-item');
    if (children.length >= 2) {
      const a = children[0].getBoundingClientRect();
      const b = children[1].getBoundingClientRect();
      const calcGap = b.left - (a.left + a.width);
      if (!Number.isNaN(calcGap) && calcGap >= 0) gap = calcGap;
    } else {
      try {
        const cs = window.getComputedStyle(genesisTrack);
        const g = parseFloat(cs.gap || cs.columnGap || '30');
        if (!Number.isNaN(g)) gap = g;
      } catch (_) { }
    }
    const maxStart = Math.max(0, genesisItems.length - visibleItems);
    const startIndex = Math.min(currentCarouselIndex * visibleItems, maxStart);
    const shift = (itemWidth + gap) * startIndex;
    genesisTrack.style.transform = `translateX(-${shift}px)`;
  }

  // Update dots and controls
  const dots = carouselDots?.querySelectorAll('.carousel-dot');
  dots?.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentCarouselIndex);
  });
  if (carouselPrev && carouselNext) {
    if (maxPage <= 0) {
      carouselPrev.setAttribute('disabled', 'true');
      carouselNext.setAttribute('disabled', 'true');
    } else {
      carouselPrev.removeAttribute('disabled');
      carouselNext.removeAttribute('disabled');
    }
  }
}

function goToSlide(idx) {
  currentCarouselIndex = idx;
  updateCarousel();
}

if (carouselPrev) {
  carouselPrev.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentCarouselIndex > 0) {
      currentCarouselIndex -= 1; // move one page
      updateCarousel();
    }
  });
}

if (carouselNext) {
  carouselNext.addEventListener('click', (e) => {
    e.preventDefault();
    const pages = getPages();
    const maxPage = pages - 1;
    if (currentCarouselIndex < maxPage) {
      currentCarouselIndex += 1; // move one page
      updateCarousel();
    }
  });
}

window.addEventListener('resize', () => {
  rebuildDots();
  updateCarousel();
});


// ─── MODAL LOGIC ───────────────────────────────────────
// options.noPhoto: true = hide image (used for list "View" button)
function openModal(idx, options) {
  const proj = PROJECTS[idx];
  if (!proj) return;

  const noPhoto = options && options.noPhoto === true;
  modalOut.classList.toggle('no-photo', noPhoto);

  if (!noPhoto) {
    modalImg.src = proj.image || '';
    modalImg.alt = proj.name;
  } else {
    modalImg.removeAttribute('src');
  }

  let tagDisplay = getCategoryLabel(proj.category);
  modalTag.textContent = tagDisplay;

  modalTitle.textContent = proj.name;
  modalSummary.textContent = proj.summary || '';

  modalLocation.textContent = proj.location || '—';
  modalArea.textContent = proj.area || '—';
  modalClient.textContent = proj.client || '—';
  modalType.textContent = proj.type || '—';
  modalStatus.textContent = proj.status || '—';
  modalRole.textContent = proj.role || '—';

  modalOut.classList.add('open');
  body.style.overflow = 'hidden';
}

function closeModal() {
  modalOut.classList.remove('open', 'no-photo');
  body.style.overflow = '';
}

modalCloseBtn?.addEventListener('click', closeModal);
modalOut?.addEventListener('click', (e) => {
  if (e.target === modalOut) closeModal(); // Close on backdrop click
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOut?.classList.contains('open')) closeModal();
});


// ─── SMOOTH SCROLL (enhanced) ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // account for fixed header
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ─── CONTACT FORM ────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate async send
  setTimeout(() => {
    contactForm?.reset();
    btn.textContent = 'SEND MESSAGE';
    btn.disabled = false;
    formSuccess?.classList.add('show');
    if (formSuccess) setTimeout(() => formSuccess.classList.remove('show'), 4000);
  }, 1200);
}

// Attach globally (called from HTML onsubmit)
window.handleFormSubmit = handleFormSubmit;


// ─── INITIAL REVEAL for above-fold elements ──────────
window.addEventListener('load', () => {
  // Immediately reveal elements that are already in viewport
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
});


function initCardCursors() {
  document.querySelectorAll('.project-card').forEach(el => {
    // Prevent duplicate listeners by checking a data attribute
    if (el.dataset.cursorInit) return;
    el.dataset.cursorInit = "true";

    el.addEventListener('mouseenter', () => {
      const dot = document.getElementById('cursor-dot');
      if (dot) {
        dot.style.transform = 'translate(-50%, -50%) scale(3)';
        dot.style.opacity = '0.4';
      }
    });
    el.addEventListener('mouseleave', () => {
      const dot = document.getElementById('cursor-dot');
      if (dot) {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.opacity = '0.8';
      }
    });
  });
}

// ─── CURSOR TRAIL (subtle accent dot) ────────────────
(function initCursor() {
  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.style.cssText = [
    'position: fixed',
    'width: 8px',
    'height: 8px',
    'border-radius: 50%',
    'background: var(--accent)',
    'pointer-events: none',
    'z-index: 9999',
    'opacity: 0',
    'left: 0',
    'top: 0',
    'transform: translate(-50%, -50%)',
    'transition: opacity 0.3s ease, transform 0.15s ease',
    'mix-blend-mode: difference'
  ].join('; ');
  document.body.appendChild(dot);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    dot.style.opacity = '0.8';
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });

  // Scale on clickable elements
  document.querySelectorAll('a, button, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(3)';
      dot.style.opacity = '0.4';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      dot.style.opacity = '0.8';
    });
  });
})();

// Call render projects on load
renderProjects();



