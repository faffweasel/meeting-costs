import { useCallback, useState } from 'react';

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}

function DarkModeToggle(): React.ReactNode {
  const [isDark, setIsDark] = useState(getInitialDark);

  const handleToggle = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="min-h-[44px] px-2"
      style={{
        color: 'var(--muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {isDark ? 'light' : 'dark'}
    </button>
  );
}

export { DarkModeToggle };
