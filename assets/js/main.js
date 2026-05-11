/* ============================================================
   SALMAN PORTFOLIO — main.js
   ============================================================ */

// ---- CONFIG — update these ----
const GITHUB_USERNAME = 'your-github-username'; // e.g. 'salman-dev'

// ============================================================
// LOADER
// ============================================================
(function initLoader() {
  const loader   = document.getElementById('loader');
  const fill     = document.querySelector('.loader-bar-fill');
  const text     = document.querySelector('.loader-text');
  const lines    = ['Initializing...', 'Loading projects...', 'Ready.'];
  let   step     = 0;

  document.body.style.overflow = 'hidden';

  // Progress bar
  requestAnimationFrame(() => { fill.style.width = '100%'; });

  // Typewriter sequence
  function nextLine() {
    if (step >= lines.length) return;
    text.textContent = lines[step++];
    if (step < lines.length) setTimeout(nextLine, 400);
  }
  nextLine();

  // Exit after 1.4s
  setTimeout(() => {
    loader.classList.add('exit');
    document.body.style.overflow = '';
    loader.addEventListener('transitionend', () => {
      loader.classList.add('done');
      initReveal();
    }, { once: true });
  }, 1400);
})();

// ============================================================
// COMMAND PALETTE  ⌘K
// ============================================================
const PALETTE_ITEMS = [
  { icon: '👤', title: 'About',       desc: 'Jump to section',      action: () => scrollTo('#about') },
  { icon: '⌨️', title: 'Tech Stack',  desc: 'Jump to section',      action: () => scrollTo('#tech-stack') },
  { icon: '🗂️', title: 'Projects',    desc: 'Jump to section',      action: () => scrollTo('#projects') },
  { icon: '📅', title: 'Timeline',    desc: 'Jump to section',      action: () => scrollTo('#timeline') },
  { icon: '📝', title: 'Writing',     desc: 'Jump to section',      action: () => scrollTo('#writing') },
  { icon: '✉️', title: 'Contact',     desc: 'Jump to section',      action: () => scrollTo('#contact') },
  { icon: '📄', title: 'Resume',      desc: 'Download PDF',         action: () => window.open('assets/resume.pdf') },
  { icon: '🐙', title: 'GitHub',      desc: 'Open profile',         action: () => window.open(`https://github.com/${GITHUB_USERNAME}`, '_blank') },
  { icon: '💼', title: 'LinkedIn',    desc: 'Open profile',         action: () => window.open('https://linkedin.com/in/salman', '_blank') },
  { icon: '🐦', title: 'Twitter / X', desc: 'Open profile',         action: () => window.open('https://twitter.com/salman', '_blank') },
];

function scrollTo(hash) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

(function initPalette() {
  const overlay  = document.querySelector('.palette-overlay');
  const input    = document.querySelector('.palette-input');
  const results  = document.querySelector('.palette-results');
  let   selected = 0;
  let   filtered = [...PALETTE_ITEMS];

  function open() {
    overlay.classList.add('open');
    input.value = '';
    selected = 0;
    render(PALETTE_ITEMS);
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    overlay.classList.remove('open');
  }

  function render(items) {
    filtered = items;
    selected = 0;
    if (!items.length) {
      results.innerHTML = '<div class="palette-empty">No results found.</div>';
      return;
    }
    results.innerHTML = items.map((it, i) => `
      <div class="palette-result${i === 0 ? ' selected' : ''}" data-idx="${i}">
        <span class="palette-result-icon">${it.icon}</span>
        <div class="palette-result-text">
          <div class="palette-result-title">${it.title}</div>
          <div class="palette-result-desc">${it.desc}</div>
        </div>
        <span class="palette-result-arrow">↵</span>
      </div>
    `).join('');

    results.querySelectorAll('.palette-result').forEach(el => {
      el.addEventListener('click', () => {
        filtered[+el.dataset.idx].action();
        close();
      });
    });
  }

  function updateSelected(idx) {
    const els = results.querySelectorAll('.palette-result');
    els.forEach(e => e.classList.remove('selected'));
    if (els[idx]) {
      els[idx].classList.add('selected');
      els[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    render(q ? PALETTE_ITEMS.filter(it => it.title.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q)) : PALETTE_ITEMS);
  });

  input?.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { selected = Math.min(selected + 1, filtered.length - 1); updateSelected(selected); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { selected = Math.max(selected - 1, 0); updateSelected(selected); e.preventDefault(); }
    if (e.key === 'Enter')     { filtered[selected]?.action(); close(); }
    if (e.key === 'Escape')    { close(); }
  });

  overlay?.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.querySelectorAll('[data-palette]').forEach(btn => btn.addEventListener('click', open));

  // ⌘K / Ctrl+K
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); overlay.classList.contains('open') ? close() : open(); }
  });
})();

// ============================================================
// THEME TOGGLE
// ============================================================
(function initTheme() {
  const html   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const saved  = localStorage.getItem('portfolio-theme') || 'dark';

  html.setAttribute('data-theme', saved);

  btn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
})();

// ============================================================
// NAVBAR
// ============================================================
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    mobileOverlay.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const open = mobileOverlay.classList.contains('open');
    spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)'  : '';
    spans[1].style.opacity   = open ? '0' : '1';
    spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  mobileOverlay?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileOverlay.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const pos = window.scrollY + 120;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (!link) return;
      link.classList.toggle('active', sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos);
    });
  }

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    io.observe(el);
  });
}

// ============================================================
// FLOATING MATH FORMULAS (hero background)
// ============================================================
(function initMathBg() {
  const container = document.querySelector('.math-bg');
  if (!container) return;

  const formulas = [
    'θ = θ - α∇J(θ)',
    'P(A|B) = P(B|A)·P(A) / P(B)',
    'O(n log n)',
    'Σ wᵢxᵢ + b',
    '∑(xᵢ - x̄)² / n',
    'V₁ - V₂ = IR',
    'git commit -m "init"',
    'SELECT * FROM users',
    'f(x) = max(0, x)',
    '∂L/∂w = xᵀ(ŷ - y)',
    'C(n,k) = n! / k!(n-k)!',
    'E = -Σ y log(ŷ)',
  ];

  formulas.forEach((f, i) => {
    const el = document.createElement('span');
    el.className = 'math-formula';
    el.textContent = f;
    el.style.cssText = `
      left: ${5 + Math.random() * 85}%;
      top:  ${5 + Math.random() * 85}%;
      --duration: ${18 + Math.random() * 14}s;
      --delay:    ${-Math.random() * 20}s;
      --dx:       ${(Math.random() - 0.5) * 40}px;
      --dy:       ${(Math.random() - 0.5) * 30}px;
      --rot-start: ${(Math.random() - 0.5) * 4}deg;
      --rot-end:   ${(Math.random() - 0.5) * 4}deg;
    `;
    container.appendChild(el);
  });
})();


// ============================================================
// FLOATING DATA GLYPHS (hero — bars / line / scatter / brackets / nodes)
// ============================================================
(function initHeroGlyphs() {
  const container = document.querySelector('.hero-glyphs');
  if (!container) return;

  // Inline SVG glyph definitions (each ~28-36px viewBox 32)
  const glyphs = [
    // Bar chart
    `<svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4"  y="18" width="4" height="10"/><rect x="12" y="10" width="4" height="18"/><rect x="20" y="14" width="4" height="14"/><rect x="28" y="6"  width="0.1" height="22"/></svg>`,
    // Line graph
    `<svg width="40" height="28" viewBox="0 0 40 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,22 10,14 18,18 26,6 38,10"/></svg>`,
    // Scatter dots
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><circle cx="6"  cy="22" r="1.6"/><circle cx="12" cy="10" r="1.6"/><circle cx="18" cy="18" r="1.6"/><circle cx="22" cy="6"  r="1.6"/><circle cx="26" cy="14" r="1.6"/><circle cx="28" cy="24" r="1.6"/></svg>`,
    // Brackets [ ]
    `<svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 3 H3 V19 H7"/><path d="M33 3 H37 V19 H33"/></svg>`,
    // Neural net (3 nodes connected)
    `<svg width="36" height="32" viewBox="0 0 36 32" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6"  cy="16" r="2.5"/><circle cx="30" cy="6"  r="2.5"/><circle cx="30" cy="26" r="2.5"/><line x1="8" y1="15" x2="28" y2="7"/><line x1="8" y1="17" x2="28" y2="25"/></svg>`,
    // Sine wave
    `<svg width="44" height="20" viewBox="0 0 44 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 10 Q 8 2, 14 10 T 26 10 T 38 10"/></svg>`,
    // Hexagon outline
    `<svg width="26" height="28" viewBox="0 0 26 28" fill="none" stroke="currentColor" stroke-width="1.4"><polygon points="13,2 24,8 24,20 13,26 2,20 2,8"/></svg>`,
    // Crosshair
    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="14" cy="14" r="9"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="14" y1="22" x2="14" y2="26"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="22" y1="14" x2="26" y2="14"/></svg>`,
    // Pie wedge
    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="14" cy="14" r="10"/><path d="M14 14 L14 4 A10 10 0 0 1 24 14 Z" fill="currentColor" opacity="0.4" stroke="none"/></svg>`,
    // Code arrows < />
    `<svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,5 3,11 10,17"/><polyline points="30,5 37,11 30,17"/><line x1="22" y1="3" x2="18" y2="19"/></svg>`,
  ];

  // Predefined positions to avoid overlapping with the centered portrait
  // (avoid roughly the middle band: 35-65% x, 30-60% y)
  const positions = [
    {x:  5, y: 12}, {x: 18, y:  8}, {x: 30, y: 14}, {x: 70, y: 10}, {x: 86, y: 16},
    {x:  4, y: 38}, {x: 12, y: 62}, {x:  8, y: 82}, {x: 24, y: 88}, {x: 28, y: 70},
    {x: 78, y: 38}, {x: 88, y: 60}, {x: 72, y: 80}, {x: 84, y: 88}, {x: 92, y: 32},
  ];

  positions.forEach((pos, i) => {
    const el = document.createElement('span');
    el.className = 'hero-glyph';
    el.innerHTML = glyphs[i % glyphs.length];
    el.style.cssText = `
      left: ${pos.x}%;
      top:  ${pos.y}%;
      --g-dur:   ${10 + Math.random() * 10}s;
      --g-delay: ${-Math.random() * 8}s;
      --g-dx:    ${(Math.random() - 0.5) * 30}px;
      --g-dy:    ${(Math.random() - 0.5) * 24}px;
      --g-rot:   ${(Math.random() - 0.5) * 14}deg;
    `;
    container.appendChild(el);
  });
})();

// ============================================================
// GITHUB STATS (live from API)
// ============================================================
async function loadGithubStats() {
  const containers = document.querySelectorAll('[data-gh-stat]');
  if (!containers.length || GITHUB_USERNAME === 'your-github-username') return;

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!res.ok) return;
    const data = await res.json();

    containers.forEach(el => {
      const key = el.dataset.ghStat;
      if (key === 'repos')      el.textContent = data.public_repos || '--';
      if (key === 'followers')  el.textContent = data.followers    || '--';
    });
  } catch { /* silently fail — static fallbacks remain */ }
}

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadGithubStats();
});
