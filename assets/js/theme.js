// Run before paint to avoid a flash when returning to a saved theme.
document.documentElement.classList.add('js');
try {
  const saved = localStorage.getItem('salman-theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
} catch { /* Private browsing can disable storage; the default theme still works. */ }
