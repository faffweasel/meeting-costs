type Mode = 'simple' | 'advanced';

interface ModeToggleProps {
  readonly mode: Mode;
  readonly onModeChange: (mode: Mode) => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps): React.ReactNode {
  return (
    <div className="mt-6 inline-flex border border-[var(--border)]" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'simple'}
        onClick={() => onModeChange('simple')}
        className={`min-h-[44px] px-5 py-2 tracking-wider ${
          mode === 'simple'
            ? 'bg-[var(--accent)] font-bold text-[var(--bg)]'
            : 'text-[var(--muted)] hover:bg-[var(--surface)]'
        }`}
      >
        SIMPLE
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'advanced'}
        onClick={() => onModeChange('advanced')}
        className={`min-h-[44px] px-5 py-2 tracking-wider ${
          mode === 'advanced'
            ? 'bg-[var(--accent)] font-bold text-[var(--bg)]'
            : 'text-[var(--muted)] hover:bg-[var(--surface)]'
        }`}
      >
        ADVANCED
      </button>
    </div>
  );
}

export type { Mode };
export { ModeToggle };
