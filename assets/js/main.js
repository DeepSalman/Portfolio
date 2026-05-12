/* ════════════════════════════════════════════════════════════════
   SalmanOS — main.js
   ════════════════════════════════════════════════════════════════ */

const STATE = {
  bootStart: Date.now(),
  windows: new Map(),
  zCounter: 50,
  logoClicks: 0,
  konami: [],
  konamiSeq: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
  cmdHistory: [],
  cmdIdx: -1,
};

// ════════════════════════════════════════════════════════════════
// BOOT SEQUENCE
// ════════════════════════════════════════════════════════════════
(function boot() {
  const screen = document.getElementById('boot-screen');
  const linesEl = document.getElementById('boot-lines');
  const lines = [
    { t: 100,  text: '[ <span class="ok">OK</span> ] mount /dev/sda1 → /' },
    { t: 220,  text: '[ <span class="ok">OK</span> ] load kernel · salman-kernel v6.4' },
    { t: 380,  text: '[ <span class="ok">OK</span> ] starting service · WindowManager' },
    { t: 520,  text: '[ <span class="ok">OK</span> ] starting service · CommandPalette' },
    { t: 680,  text: '[ <span class="info">i</span>  ] loading user profile · salman' },
    { t: 880,  text: '[ <span class="warn">!!</span> ] coffee.service degraded (low caffeine)' },
    { t: 1080, text: '[ <span class="ok">OK</span> ] starting service · NotificationCenter' },
    { t: 1280, text: '[ <span class="ok">OK</span> ] starting service · Terminal' },
    { t: 1500, text: '[ <span class="ok">OK</span> ] welcome, salman.' },
    { t: 1700, text: '<span class="info">→ booting desktop...</span>' },
  ];
  lines.forEach(l => setTimeout(() => {
    linesEl.innerHTML += l.text + '\n';
    linesEl.scrollTop = linesEl.scrollHeight;
  }, l.t));
  function exit() {
    if (screen.classList.contains('fade')) return;
    screen.classList.add('fade');
    setTimeout(() => { screen.remove(); afterBoot(); }, 800);
  }
  const finishT = setTimeout(exit, 2700);
  document.addEventListener('keydown', () => { clearTimeout(finishT); exit(); }, { once: true });
  screen.addEventListener('click', () => { clearTimeout(finishT); exit(); }, { once: true });
})();

function afterBoot() {
  initTheme();
  initWallpaper();
  initFloatingElements();
  initParallax();
  initClock();
  initDesktop();
  initDock();
  initContextMenu();
  initLogoEgg();
  initKonami();
  initKeyboard();
  setTimeout(() => notify('Welcome to SalmanOS', "Try double-clicking icons or typing <strong>help</strong> in the terminal.", 6000), 400);
  setTimeout(() => notify('💡 Pro tip', "Right-click anywhere on the desktop for shortcuts.", 5500), 7000);
}

// ════════════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════════════
function initTheme() {
  const saved = localStorage.getItem('salmanos-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('salmanos-theme', next);
}

// ════════════════════════════════════════════════════════════════
// WALLPAPER · particle constellation
// ════════════════════════════════════════════════════════════════
function initWallpaper() {
  const canvas = document.getElementById('wallpaper');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 30 : 70;
  const MAX_DIST = isMobile ? 110 : 160;
  let particles, mx = -9999, my = -9999;
  function particleColor() {
    // Pure monochrome — read --text variable
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? '0,0,0' : '255,255,255';
  }
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 0.8 + Math.random() * 1.6,
    }));
  }
  function step() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);
    const c = particleColor();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > cw) p.vx *= -1;
      if (p.y < 0 || p.y > ch) p.vy *= -1;
      const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy);
      if (d < 160) { p.x -= dx * 0.002; p.y -= dy * 0.002; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${c},0.5)`;
      ctx.fill();
    });
    for (let i=0;i<particles.length;i++) {
      for (let j=i+1;j<particles.length;j++) {
        const a = particles[i], b2 = particles[j];
        const dx = a.x - b2.x, dy = a.y - b2.y, d = Math.hypot(dx, dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d/MAX_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y);
          ctx.strokeStyle = `rgba(${c},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left; my = e.clientY - rect.top;
  }, { passive: true });
  window.addEventListener('resize', () => { resize(); spawn(); });
  resize(); spawn(); step();
}

// ════════════════════════════════════════════════════════════════
// FLOATING ELEMENTS — geometry, code symbols, languages, math
// ════════════════════════════════════════════════════════════════
function initFloatingElements() {
  const container = document.getElementById('floating-elements');
  if (!container) return;
  const isMobile = window.innerWidth < 768;

  // Each element: { kind, content, size, tier }
  // tier 1=very faint, 2=medium, 3=most visible
  const ELEMENTS = [
    // ── Geometric SVG shapes (outline only) ──
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="16" cy="16" r="14"/></svg>', size: 72 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><polygon points="16,3 28,27 4,27"/></svg>', size: 54 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><polygon points="16,2 30,12 24,28 8,28 2,12"/></svg>', size: 58 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><polygon points="16,2 28,8 28,24 16,30 4,24 4,8"/></svg>', size: 60 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="24" height="24"/></svg>', size: 48 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="14"/></svg>', size: 64 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><polygon points="16,4 20,14 30,14 22,20 25,29 16,24 7,29 10,20 2,14 12,14"/></svg>', size: 52 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><line x1="2" y1="16" x2="30" y2="16"/><line x1="16" y1="2" x2="16" y2="30"/><circle cx="16" cy="16" r="6"/></svg>', size: 56 },
    { svg: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="8"  cy="20" r="2.5" fill="currentColor"/><circle cx="20" cy="8"  r="2.5" fill="currentColor"/><circle cx="20" cy="32" r="2.5" fill="currentColor"/><circle cx="32" cy="20" r="2.5" fill="currentColor"/><line x1="10" y1="20" x2="18" y2="10"/><line x1="10" y1="20" x2="18" y2="30"/><line x1="22" y1="10" x2="30" y2="20"/><line x1="22" y1="30" x2="30" y2="20"/></svg>', size: 68 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 16 Q 8 4, 16 16 T 30 16"/></svg>', size: 60 },
    { svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.0" stroke-linecap="round"><path d="M2 16 H 30 M 8 8 H 30 M 8 24 H 30 M 14 4 H 30 M 14 28 H 30"/></svg>', size: 64 },

    // ── Code symbols ──
    { text: '{ }',   size: 38, fam: 'mono', bold: true },
    { text: '</>',   size: 32, fam: 'mono' },
    { text: '[ ]',   size: 34, fam: 'mono' },
    { text: '=>',    size: 32, fam: 'mono', bold: true },
    { text: '()',    size: 36, fam: 'mono' },
    { text: '&&',    size: 30, fam: 'mono' },
    { text: '||',    size: 30, fam: 'mono' },
    { text: '//',    size: 28, fam: 'mono' },
    { text: '!=',    size: 30, fam: 'mono' },
    { text: '===',   size: 26, fam: 'mono' },
    { text: '++',    size: 32, fam: 'mono' },
    { text: '/* */', size: 22, fam: 'mono' },

    // ── Math / CS ──
    { text: 'Σ',         size: 50, fam: 'sans' },
    { text: 'π',         size: 46, fam: 'sans' },
    { text: '∫',         size: 50, fam: 'sans' },
    { text: '∂',         size: 44, fam: 'sans' },
    { text: '∞',         size: 46, fam: 'sans' },
    { text: 'λ',         size: 44, fam: 'sans' },
    { text: 'θ',         size: 44, fam: 'sans' },
    { text: '∇',         size: 42, fam: 'sans' },
    { text: 'O(n)',      size: 22, fam: 'mono' },
    { text: 'O(log n)',  size: 18, fam: 'mono' },
    { text: 'O(n²)',     size: 20, fam: 'mono' },

    // ── Terminal / shell ──
    { text: '▸_',  size: 30, fam: 'mono', bold: true },
    { text: '$',   size: 36, fam: 'mono', bold: true },
    { text: '~/',  size: 24, fam: 'mono' },
    { text: '↵',   size: 28, fam: 'mono' },

    // ── Language pills (interactive look) ──
    { pill: 'Py',   noRot: true },
    { pill: 'JS',   noRot: true },
    { pill: 'TS',   noRot: true },
    { pill: 'C++',  noRot: true },
    { pill: 'SQL',  noRot: true },
    { pill: 'Java', noRot: true },
    { pill: 'Node', noRot: true },
    { pill: 'React',noRot: true },
    { pill: 'HTML', noRot: true },
    { pill: 'CSS',  noRot: true },

    // ── ML / data ──
    { text: 'ŷ = wx + b', size: 16, fam: 'mono' },
    { text: 'P(A|B)',     size: 18, fam: 'mono' },
    { text: 'ReLU(x)',    size: 18, fam: 'mono' },
    { text: 'softmax',    size: 16, fam: 'mono' },
  ];

  // Generate non-overlapping positions across screen
  // Avoid the center band where windows usually open
  const positions = [];
  const cols = isMobile ? 5 : 7;
  const rows = isMobile ? 6 : 6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) / cols * 100 + (Math.random() - 0.5) * 6;
      const y = (r + 0.5) / rows * 100 + (Math.random() - 0.5) * 8;
      positions.push({ x, y });
    }
  }
  // Shuffle for variety
  positions.sort(() => Math.random() - 0.5);

  // Cap elements on mobile for perf
  const count = isMobile ? 24 : Math.min(positions.length, 48);

  const shuffled = [...ELEMENTS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const def = shuffled[i % shuffled.length];
    const pos = positions[i];
    const el  = document.createElement('span');
    el.className = 'float-wrap';
    if (def.noRot) el.classList.add('no-rot');
    // Tier (opacity) — more visible mix, weighted toward t2/t3
    const t = Math.random();
    el.classList.add(t < 0.30 ? 't1' : t < 0.70 ? 't2' : 't3');
    // Hide some on mobile
    if (isMobile && i > 18) el.classList.add('mobile-hide');

    const driftDur = 18 + Math.random() * 22;
    const rotDur   = 20 + Math.random() * 30;
    const dx = (Math.random() - 0.5) * 60;
    const dy = (Math.random() - 0.5) * 50;

    el.style.cssText = `
      left: ${pos.x}%;
      top:  ${pos.y}%;
      --drift-dur:   ${driftDur}s;
      --drift-delay: ${-Math.random() * 20}s;
      --rot-dur:     ${rotDur}s;
      --rot-dir:     ${Math.random() > 0.5 ? 'normal' : 'reverse'};
      --dx:          ${dx}px;
      --dy:          ${dy}px;
    `;

    const inner = document.createElement('span');
    inner.className = 'float-inner';

    if (def.svg) {
      inner.style.width  = def.size + 'px';
      inner.style.height = def.size + 'px';
      inner.innerHTML = def.svg;
    } else if (def.text) {
      inner.innerHTML = `<span class="ft ${def.fam === 'sans' ? 'sans' : ''} ${def.bold ? 'bold' : ''}" style="font-size:${def.size}px">${def.text}</span>`;
    } else if (def.pill) {
      inner.innerHTML = `<span class="pill-lang" style="font-size:${isMobile ? 11 : 13}px">${def.pill}</span>`;
    }

    el.appendChild(inner);
    container.appendChild(el);
  }
}

// ════════════════════════════════════════════════════════════════
// CURSOR PARALLAX — floating elements shift opposite to cursor
// ════════════════════════════════════════════════════════════════
function initParallax() {
  const container = document.getElementById('floating-elements');
  if (!container || window.innerWidth < 768) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;
    targetY = (e.clientY - cy) / cy;
  }, { passive: true });

  function tick() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    container.style.transform = `translate(${-currentX * 18}px, ${-currentY * 14}px)`;
    requestAnimationFrame(tick);
  }
  tick();
}

// ════════════════════════════════════════════════════════════════
// CLOCK / UPTIME
// ════════════════════════════════════════════════════════════════
function initClock() {
  const clockEl  = document.getElementById('topbar-clock');
  const dateEl   = document.getElementById('topbar-date');
  const uptimeEl = document.getElementById('topbar-uptime');
  function tick() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    if (clockEl) clockEl.textContent = `${hh}:${mm}`;
    if (dateEl)  dateEl.textContent  = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const secs = Math.floor((Date.now() - STATE.bootStart) / 1000);
    const um = String(Math.floor(secs/60)).padStart(2,'0');
    const us = String(secs % 60).padStart(2,'0');
    if (uptimeEl) uptimeEl.textContent = `UP ${um}:${us}`;
  }
  tick(); setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════════
// DESKTOP ICONS — single click opens
// ════════════════════════════════════════════════════════════════
function initDesktop() {
  document.querySelectorAll('.d-icon').forEach(icon => {
    if (icon.tagName === 'A') return;
    icon.addEventListener('click', () => openWindow(icon.dataset.window));
    icon.addEventListener('keydown', e => { if (e.key === 'Enter') openWindow(icon.dataset.window); });
  });
}

// ════════════════════════════════════════════════════════════════
// DOCK
// ════════════════════════════════════════════════════════════════
function initDock() {
  document.querySelectorAll('.dock-item').forEach(btn => {
    btn.addEventListener('click', () => openWindow(btn.dataset.window));
  });
}
function updateDockActive() {
  document.querySelectorAll('.dock-item').forEach(btn => {
    btn.classList.toggle('active', STATE.windows.has(btn.dataset.window));
  });
}

// ════════════════════════════════════════════════════════════════
// WINDOWS · open, drag, close, z-index
// ════════════════════════════════════════════════════════════════
function openWindow(id) {
  if (!id) return;
  if (STATE.windows.has(id)) { bringToFront(STATE.windows.get(id).el); return; }
  const tplWindow  = document.getElementById('tpl-window');
  const tplContent = document.getElementById('content-' + id);
  if (!tplWindow || !tplContent) return;
  const node = tplWindow.content.firstElementChild.cloneNode(true);
  node.dataset.id = id;
  node.querySelector('.window-title').textContent = titleFor(id);
  node.querySelector('.window-meta').textContent  = metaFor(id);
  const body = node.querySelector('.window-body');
  body.classList.add('win-body-' + id);
  body.appendChild(tplContent.content.cloneNode(true));
  const offset = STATE.windows.size * 28;
  const baseX = window.innerWidth  / 2 - 280 + offset;
  const baseY = 80 + offset;
  node.style.left = Math.max(40, baseX) + 'px';
  node.style.top  = Math.max(48, baseY) + 'px';
  const sizes = {
    terminal:   { w: 780, h: 500 },
    about:      { w: 640, h: 620 },
    projects:   { w: 720, h: 540 },
    skills:     { w: 620, h: 560 },
    education:  { w: 720, h: 540 },
    contact:    { w: 620, h: 620 },
    nowplaying: { w: 580, h: 280 },
    secret:     { w: 520, h: 420 },
  };
  const sz = sizes[id] || { w: 640, h: 560 };
  node.style.width  = sz.w + 'px';
  node.style.height = sz.h + 'px';
  document.getElementById('desktop').appendChild(node);
  STATE.windows.set(id, { el: node });
  bringToFront(node);
  attachWindowControls(node, id);
  attachWindowDrag(node);
  updateDockActive();
  hookContent(id, node);
}
function titleFor(id) {
  return ({
    about: 'About.txt', projects: 'Projects', skills: 'Skills.exe',
    education: 'Education.log', terminal: 'Terminal — salman@SalmanOS',
    contact: 'Contact.app', nowplaying: 'Now Playing', secret: '🎉 secret.txt',
  }[id]) || id;
}
function metaFor(id) {
  return ({
    about: '2 KB · TXT', projects: '1 ITEM', skills: 'BIN', education: 'LOG',
    terminal: 'BASH', contact: 'APP', nowplaying: 'WIDGET', secret: '???',
  }[id]) || '';
}
function bringToFront(el) { STATE.zCounter++; el.style.zIndex = STATE.zCounter; }

function attachWindowControls(node, id) {
  node.addEventListener('mousedown', () => bringToFront(node));
  node.querySelector('.traffic.close').addEventListener('click', e => {
    e.stopPropagation();
    node.classList.add('closing');
    setTimeout(() => { node.remove(); STATE.windows.delete(id); updateDockActive(); }, 180);
  });
  node.querySelector('.traffic.min').addEventListener('click', e => {
    e.stopPropagation();
    node.classList.add('minimized');
    setTimeout(() => {
      node.remove(); STATE.windows.delete(id); updateDockActive();
      notify('Minimized', `<strong>${titleFor(id)}</strong> moved to dock.`);
    }, 280);
  });
  node.querySelector('.traffic.max').addEventListener('click', e => {
    e.stopPropagation();
    node.classList.toggle('maximized');
  });
}

function attachWindowDrag(node) {
  const tb = node.querySelector('.window-titlebar');
  let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;

  function start(clientX, clientY, target) {
    if (target && target.closest('.traffic')) return false;
    if (node.classList.contains('maximized')) return false;
    if (window.innerWidth < 768) return false; // disable drag on phones (fullscreen anyway)
    dragging = true;
    sx = clientX; sy = clientY;
    const r = node.getBoundingClientRect();
    ox = r.left; oy = r.top;
    document.body.style.userSelect = 'none';
    return true;
  }
  function move(clientX, clientY) {
    if (!dragging) return;
    const x = Math.max(0, Math.min(window.innerWidth  - 100, ox + clientX - sx));
    const y = Math.max(40, Math.min(window.innerHeight - 100, oy + clientY - sy));
    node.style.left = x + 'px'; node.style.top = y + 'px';
  }
  function end() {
    dragging = false;
    document.body.style.userSelect = '';
  }

  // Mouse
  tb.addEventListener('mousedown', e => start(e.clientX, e.clientY, e.target));
  document.addEventListener('mousemove', e => move(e.clientX, e.clientY));
  document.addEventListener('mouseup', end);

  // Touch
  tb.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (start(t.clientX, t.clientY, e.target)) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    move(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', end);
}

// ════════════════════════════════════════════════════════════════
// CONTENT HOOKS
// ════════════════════════════════════════════════════════════════
function hookContent(id, node) {
  if (id === 'terminal') hookTerminal(node);
  if (id === 'contact')  hookContact(node);
  if (id === 'projects') hookProjects(node);
}
function hookContact(node) {
  node.querySelector('[data-action="copy-email"]')?.addEventListener('click', e => {
    const email = e.currentTarget.dataset.email;
    navigator.clipboard?.writeText(email);
    notify('Copied to clipboard', `<strong>${email}</strong> is ready to paste.`);
  });
}
function hookProjects(node) {
  node.querySelector('[data-action="proj-soon"]')?.addEventListener('click', () => {
    notify('In progress', "Salman's first real project ships soon. <em>Patience...</em>");
  });
}

// ════════════════════════════════════════════════════════════════
// TERMINAL
// ════════════════════════════════════════════════════════════════
function hookTerminal(node) {
  const out = node.querySelector('#terminal-output');
  const inp = node.querySelector('#terminal-input');
  termPrint(out, [
    '<span class="accent">Welcome to SalmanOS Terminal · v1.0</span>',
    'Type <strong>help</strong> to see what you can do here.',
    '',
  ]);
  inp.focus();
  node.addEventListener('click', () => inp.focus());
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = inp.value.trim();
      if (cmd) {
        STATE.cmdHistory.push(cmd); STATE.cmdIdx = STATE.cmdHistory.length;
        termPrint(out, [{ cmd: true, text: cmd }]);
        runCommand(cmd, out);
      }
      inp.value = '';
    }
    if (e.key === 'ArrowUp') {
      if (STATE.cmdIdx > 0) { STATE.cmdIdx--; inp.value = STATE.cmdHistory[STATE.cmdIdx] || ''; }
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      if (STATE.cmdIdx < STATE.cmdHistory.length - 1) {
        STATE.cmdIdx++; inp.value = STATE.cmdHistory[STATE.cmdIdx];
      } else { STATE.cmdIdx = STATE.cmdHistory.length; inp.value = ''; }
      e.preventDefault();
    }
  });
}
function termPrint(out, lines) {
  lines.forEach(l => {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    if (typeof l === 'object' && l.cmd) {
      div.classList.add('cmd');
      div.innerHTML = `<span class="prompt">salman@SalmanOS:~$</span>${escapeHtml(l.text)}`;
    } else if (typeof l === 'object') {
      if (l.cls) div.classList.add(l.cls);
      div.innerHTML = l.html || l.text;
    } else {
      div.innerHTML = l;
    }
    out.appendChild(div);
  });
  out.scrollTop = out.scrollHeight;
}
function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function runCommand(raw, out) {
  const [cmd, ...args] = raw.split(/\s+/);
  const arg = args.join(' ');
  switch (cmd) {
    case 'help':
      return termPrint(out, [
        { html: '<span class="accent">Available commands:</span>' },
        '  <strong>help</strong>             show this menu',
        '  <strong>whoami</strong>           identity check',
        '  <strong>ls</strong>               list files',
        '  <strong>cat &lt;file&gt;</strong>       read a file (about, skills, education)',
        '  <strong>open &lt;app&gt;</strong>       open a window',
        '  <strong>theme dark|light</strong> change theme',
        '  <strong>date</strong>             current date/time',
        '  <strong>neofetch</strong>         system info with ASCII',
        '  <strong>clear</strong>            clear terminal',
        '  <strong>hire</strong>             open Contact.app',
        '  <strong>easter</strong>           ...try it',
        '',
      ]);
    case 'whoami':
      return termPrint(out, [
        { html: '<span class="accent">salman</span> — CS Student · Developer · Founder', cls: 'info' },
        '  Dhaka, BD · open to remote',
        '  ML researcher in progress · Erasmus Mundus 2026–27 applicant',
        '',
      ]);
    case 'ls':
      return termPrint(out, [
        '<span class="accent">.</span>  <span class="accent">..</span>  about.txt  projects/  skills.exe  education.log  contact.app  resume.pdf',
        '',
      ]);
    case 'cat': {
      const map = {
        'about.txt': 'about', 'about': 'about',
        'skills.exe': 'skills','skills': 'skills',
        'education.log': 'education','education': 'education',
      };
      if (map[arg]) { openWindow(map[arg]); return termPrint(out, [{ html: `→ opened <strong>${arg}</strong> in a new window`, cls: 'ok' }, '']); }
      return termPrint(out, [{ html: `cat: ${arg || '(empty)'}: No such file. Try <strong>ls</strong>.`, cls: 'err' }, '']);
    }
    case 'open': {
      const valid = ['about','projects','skills','education','contact','terminal','nowplaying'];
      if (valid.includes(arg)) { openWindow(arg); return termPrint(out, [{ html: `→ opening <strong>${arg}</strong>`, cls: 'ok' }, '']); }
      return termPrint(out, [{ html: `open: '${arg}' not a valid app. Try: ${valid.join(', ')}`, cls: 'err' }, '']);
    }
    case 'theme':
      if (arg === 'dark' || arg === 'light') {
        document.documentElement.setAttribute('data-theme', arg);
        localStorage.setItem('salmanos-theme', arg);
        return termPrint(out, [{ html: `theme → <strong>${arg}</strong>`, cls: 'ok' }, '']);
      }
      return termPrint(out, [{ html: 'usage: theme dark|light', cls: 'err' }, '']);
    case 'date': return termPrint(out, [new Date().toString(), '']);
    case 'clear': out.innerHTML = ''; return;
    case 'hire': case 'hire-me':
      openWindow('contact');
      return termPrint(out, [{ html: "→ opening <strong>Contact.app</strong> · let's talk.", cls: 'ok' }, '']);
    case 'sudo':
      if (arg === 'hire-me' || arg === 'hire me') {
        openWindow('contact'); confetti(120);
        return termPrint(out, [{ html: '<strong>[sudo]</strong> bypassing application form...  🎉', cls: 'accent' }, '']);
      }
      return termPrint(out, [{ html: 'sudo: nice try.', cls: 'err' }, '']);
    case 'neofetch':
      return termPrint(out, [
        '<span class="accent">      ⌬⌬⌬⌬⌬</span>     <strong>salman</strong>@<strong>SalmanOS</strong>',
        '<span class="accent">    ⌬⌬     ⌬⌬</span>   -------------------',
        '<span class="accent">   ⌬⌬       ⌬⌬</span>  OS:       SalmanOS v1.0',
        '<span class="accent">  ⌬⌬    S    ⌬⌬</span>  Kernel:   salman-kernel 6.4',
        '<span class="accent">   ⌬⌬       ⌬⌬</span>  Shell:    bash (vanilla)',
        '<span class="accent">    ⌬⌬     ⌬⌬</span>   Editor:   VS Code',
        '<span class="accent">      ⌬⌬⌬⌬⌬</span>     Caffeine: critical',
        '                  Status:   shipping soon',
        '',
      ]);
    case 'easter':
      confetti(80);
      return termPrint(out, [{ html: '🥚 you found me · enjoy the confetti', cls: 'accent' }, '']);
    case 'matrix':
      confetti(160); openWindow('secret');
      return termPrint(out, [{ html: '↯ entering matrix mode...', cls: 'accent' }, '']);
    case '': return;
    default:
      return termPrint(out, [{ html: `command not found: <strong>${cmd}</strong>. Type <strong>help</strong>.`, cls: 'err' }, '']);
  }
}

// ════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════════
function notify(title, msg, dur = 5000) {
  const root = document.getElementById('notifs');
  if (!root) return;
  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `<div class="notif-title">${title}</div><div class="notif-msg">${msg}</div>`;
  root.appendChild(n);
  const t = setTimeout(() => { n.classList.add('removing'); setTimeout(() => n.remove(), 250); }, dur);
  n.addEventListener('click', () => { clearTimeout(t); n.classList.add('removing'); setTimeout(() => n.remove(), 250); });
}

// ════════════════════════════════════════════════════════════════
// CONTEXT MENU
// ════════════════════════════════════════════════════════════════
function initContextMenu() {
  const menu = document.getElementById('context-menu');
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('.window') || e.target.closest('input')) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    menu.style.left = x + 'px'; menu.style.top = y + 'px';
    menu.classList.add('open');
  });
  document.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      const a = b.dataset.action;
      if (a === 'open-terminal') openWindow('terminal');
      if (a === 'theme')         toggleTheme();
      if (a === 'about')         openWindow('about');
      if (a === 'surprise')      { confetti(140); notify('Surprise!', 'You triggered <strong>chaos.exe</strong> 🎉'); }
    });
  });
}

// ════════════════════════════════════════════════════════════════
// LOGO EASTER EGG
// ════════════════════════════════════════════════════════════════
function initLogoEgg() {
  document.getElementById('os-logo')?.addEventListener('click', () => {
    STATE.logoClicks++;
    if (STATE.logoClicks === 5) {
      confetti(100); openWindow('secret'); STATE.logoClicks = 0;
    }
  });
}

// ════════════════════════════════════════════════════════════════
// KONAMI CODE
// ════════════════════════════════════════════════════════════════
function initKonami() {
  window.addEventListener('keydown', e => {
    STATE.konami.push(e.key);
    STATE.konami = STATE.konami.slice(-STATE.konamiSeq.length);
    if (STATE.konami.join(',').toLowerCase() === STATE.konamiSeq.join(',').toLowerCase()) {
      confetti(200);
      notify('🎮 KONAMI', "You unlocked the secret level. <em>Respect.</em>", 7000);
      openWindow('secret');
      STATE.konami = [];
    }
  });
}

// ════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════════════════════════
function initKeyboard() {
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); openWindow('terminal'); return;
    }
    if (e.key === 'Escape') {
      let top = null, topZ = -1;
      STATE.windows.forEach(w => {
        const z = parseInt(w.el.style.zIndex || 0, 10);
        if (z > topZ) { topZ = z; top = w.el; }
      });
      if (top) top.querySelector('.traffic.close').click();
    }
  });
}

// ════════════════════════════════════════════════════════════════
// CONFETTI
// ════════════════════════════════════════════════════════════════
function confetti(count = 80) {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const colors = isLight
    ? ['#000000', '#1A1A1A', '#404040', '#666666', '#888888']
    : ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080'];
  const parts = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 6,
    vy: 3 + Math.random() * 6,
    r: 4 + Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  let life = 0;
  function tick() {
    life++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (life < 200) requestAnimationFrame(tick);
    else canvas.remove();
  }
  tick();
}
