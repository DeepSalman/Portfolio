const root = document.documentElement;
root.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initBoot() {
  const screen = document.querySelector('#boot-screen');
  if (!screen) return;
  const skip = screen.querySelector('#boot-skip');
  const started = performance.now();
  const listeners = new AbortController();
  let finished = false;
  let readyTimer;
  let fallbackTimer;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(readyTimer);
    clearTimeout(fallbackTimer);
    listeners.abort();
    screen.classList.add('is-done');
    const hadFocus = screen.contains(document.activeElement);
    if (hadFocus) {
      const heading = document.querySelector('#hero-title');
      heading?.focus({ preventScroll: true });
    }
    setTimeout(() => screen.remove(), reducedMotion.matches ? 0 : 450);
  }
  skip?.addEventListener('click', finish, { signal: listeners.signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') finish();
  }, { signal: listeners.signal });
  if (reducedMotion.matches) { finish(); return; }
  function onReady() {
    readyTimer = setTimeout(finish, Math.max(0, 1250 - (performance.now() - started)));
  }
  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady, { once: true, signal: listeners.signal });
  fallbackTimer = setTimeout(finish, 2400);
}
initBoot();

function syncThemeButtons() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    button.title = `Switch to ${next} theme`;
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#151513' : '#c04727');
}
syncThemeButtons();
document.querySelectorAll('[data-theme-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('salman-theme-v2', root.dataset.theme); } catch { /* Optional persistence. */ }
    syncThemeButtons();
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
function closeMenu() {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
  navLinks?.classList.remove('is-open');
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navLinks?.classList.toggle('is-open', open);
});
navLinks?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

// The content stays visible without JavaScript. Each reveal runs once and is then unobserved.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'none'
      });
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); document.getAnimations().forEach(animation => animation.finish()); }
  }, { once: true });
}

const clock = document.querySelector('[data-dhaka-time]');
let clockTimer;
function updateClock() {
  if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' LOCAL';
}
function manageClock() {
  clearInterval(clockTimer);
  if (clock && !document.hidden) { updateClock(); clockTimer = setInterval(updateClock, 60000); }
}
manageClock();
document.addEventListener('visibilitychange', manageClock);
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });

let toastTimer;
function notify(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
}
document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('salman2330508@bscse.uiu.ac.bd');
    notify('Email copied. Let’s make something useful.');
  } catch {
    notify('Copy unavailable here. Select the email address, or click it to write to me.');
  }
});

let osModule;
async function launchOS(trigger) {
  trigger?.setAttribute('aria-busy', 'true');
  try {
    osModule ||= import('./os.js?v=hero-cse').catch(error => { osModule = undefined; throw error; });
    const { openOS } = await osModule;
    await openOS(trigger);
  } catch {
    notify('SalmanOS couldn’t load. Please try again.');
  } finally {
    trigger?.removeAttribute('aria-busy');
  }
}
document.querySelectorAll('[data-open-os]').forEach(button => button.addEventListener('click', () => launchOS(button)));
document.addEventListener('keydown', event => {
  const editable = event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]');
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !editable && !document.querySelector('dialog[open]')) {
    event.preventDefault();
    launchOS(document.querySelector('[data-open-os]') || document.activeElement);
  }
});
