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
