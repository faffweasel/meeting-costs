import type { TimerState } from '../lib/timer.ts';

interface TimerControlsProps {
  readonly timerState: TimerState;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onReset: () => void;
}

const primaryClass =
  'min-h-[44px] px-6 py-3 font-bold tracking-wider bg-[var(--accent)] text-[var(--bg)] hover:opacity-80';

const secondaryClass =
  'min-h-[44px] px-6 py-3 tracking-wider border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]';

function TimerControls({
  timerState,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerControlsProps): React.ReactNode {
  return (
    <div className="sticky top-0 z-10 mt-8 flex justify-center gap-3 py-3" style={{ backgroundColor: 'var(--bg)' }}>
      {timerState === 'idle' && (
        <button type="button" onClick={onStart} className={primaryClass}>
          START
        </button>
      )}
      {timerState === 'running' && (
        <>
          <button type="button" onClick={onPause} className={primaryClass}>
            PAUSE
          </button>
          <button type="button" onClick={onReset} className={secondaryClass}>
            RESET
          </button>
        </>
      )}
      {timerState === 'paused' && (
        <>
          <button type="button" onClick={onResume} className={primaryClass}>
            RESUME
          </button>
          <button type="button" onClick={onReset} className={secondaryClass}>
            RESET
          </button>
        </>
      )}
    </div>
  );
}

export { TimerControls };
