(function () {
  const key = 'feather-demo-theme';
  const themes = ['dark', 'light', 'ocean', 'forest', 'dark-b', 'aurora', 'dawn', 'rose', 'graphite', 'canyon'];
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(key);
  const initial = themes.includes(saved) ? saved : (prefersDark ? 'dark' : 'light');
  const icon = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const icons = {
    home: icon('<path d="M3 11.5 12 4l9 7.5"></path><path d="M5 10.5V20h14v-9.5"></path>'),
    simple: icon('<path d="M7 4h10"></path><path d="M7 9h10"></path><path d="M7 14h10"></path><path d="M7 19h6"></path><path d="M4 4h.01"></path><path d="M4 9h.01"></path><path d="M4 14h.01"></path><path d="M4 19h.01"></path>'),
    basic: icon('<path d="M6 5h12"></path><path d="M9 5v14"></path><path d="M15 5v14"></path><path d="M5 19h14"></path>'),
    api: icon('<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line>'),
    ocean: icon('<path d="M2 12c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2"></path><path d="M2 17c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2"></path><path d="M2 7c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2"></path>'),
    config: icon('<path d="M12 3 6 9l3 3-6 6 3 3 6-6 3 3 6-6-9-9z"></path><path d="m15 6 3 3"></path>'),
    theme: icon('<path d="M12 3a9 9 0 1 0 9 9c0-.58-.46-1.04-1.04-1.04H17.5a2.5 2.5 0 1 1 0-5H18A3 3 0 0 0 21 3.5 9 9 0 0 0 12 3z"></path><circle cx="7.5" cy="11.5" r=".8"></circle><circle cx="9.5" cy="7.5" r=".8"></circle><circle cx="14.5" cy="7.5" r=".8"></circle>')
  };

  function formatTheme(name) {
    return name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  function decorateButton(el, iconName, labelText) {
    if (!el) return;
    const label = el.querySelector('.btn-label') || document.createElement('span');
    const iconWrap = el.querySelector('.btn-icon') || document.createElement('span');
    if (!iconWrap.className) {
      iconWrap.className = 'btn-icon';
      iconWrap.innerHTML = icons[iconName] || '';
    }
    if (!label.className) label.className = 'btn-label';
    label.textContent = labelText;
    if (!el.querySelector('.btn-icon') || !el.querySelector('.btn-label')) {
      el.textContent = '';
      el.appendChild(iconWrap);
      el.appendChild(label);
    }
  }

  function syncThemeControls(next) {
    if (!document.body) return;
    document.querySelectorAll('[data-nav]').forEach(el => decorateButton(el, el.dataset.nav, el.dataset.label || el.textContent.trim()));
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      decorateButton(el, 'theme', `Theme: ${formatTheme(next)}`);
      el.dataset.themeName = next;
    });
  }

  function applyTheme(next, emit) {
    const theme = themes.includes(next) ? next : themes[0];
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(key, theme);
    syncThemeControls(theme);
    if (!emit) return;
    try { window.dispatchEvent(new CustomEvent('themechange', { detail: theme })); } catch { }
    document.querySelectorAll('[data-theme-sync]').forEach(el => {
      try { el.dispatchEvent(new CustomEvent('themechange', { detail: theme })); } catch { }
    });
  }

  window.FeatherDemoThemes = themes.slice();
  window.setDemoTheme = function (next) { applyTheme(next, true); };
  window.toggleTheme = function () {
    const cur = document.documentElement.getAttribute('data-theme') || initial;
    const index = themes.indexOf(cur);
    applyTheme(themes[(index + 1 + themes.length) % themes.length], true);
  };

  applyTheme(initial, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncThemeControls(document.documentElement.getAttribute('data-theme') || initial), { once: true });
  } else {
    syncThemeControls(document.documentElement.getAttribute('data-theme') || initial);
  }
})();
