// Run before paint to avoid a flash when returning to a saved theme.
document.documentElement.classList.add('js');
try {
  const saved = localStorage.getItem('salman-theme-v2');
  document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
} catch { /* Private browsing can disable storage; the default theme still works. */ }
