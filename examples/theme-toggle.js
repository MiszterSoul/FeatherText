(function(){
  const key = 'feather-demo-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(key);
  const initial = saved || (prefersDark ? 'dark' : 'light');
  setTheme(initial);

  function setTheme(next){
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(key, next);
    try { window.dispatchEvent(new CustomEvent('themechange', { detail: next })); } catch {}
    document.querySelectorAll('[data-theme-sync]').forEach(el => {
      try { el.dispatchEvent(new CustomEvent('themechange', { detail: next })); } catch {}
    });
  }

  window.toggleTheme = function(){
    const cur = document.documentElement.getAttribute('data-theme') || initial;
    setTheme(cur === 'light' ? 'dark' : 'light');
  };
})();
