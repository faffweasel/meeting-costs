import type { TimerState } from '../lib/timer.ts';

interface CostDisplayProps {
  readonly cost: number;
  readonly elapsedMs: number;
  readonly perMinuteRate: number;
  readonly timerState: TimerState;
  readonly salaryCost: number | null;
  readonly onCostPercentage: number;
}

function formatCost(pounds: number): string {
  return `£${pounds.toFixed(2)}`;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

function CostDisplay({
  cost,
  elapsedMs,
  perMinuteRate,
  timerState,
  salaryCost,
  onCostPercentage,
}: CostDisplayProps): React.ReactNode {
  const showTrueCost = salaryCost !== null;

  return (
    <div className="mt-10">
      {showTrueCost && (
        <p className="text-lg" style={{ color: 'var(--muted)' }}>
          Salary cost: {formatCost(salaryCost)}
        </p>
      )}
      <p className="text-5xl font-bold sm:text-6xl" style={{ color: 'var(--text)' }}>
        {formatCost(cost)}
      </p>
      {showTrueCost && (
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          On-costs add ~{Math.round(onCostPercentage * 100)}% to salary cost
        </p>
      )}
      <div className="mt-3 flex items-center justify-center gap-2">
        <p className="text-xl tracking-wider" style={{ color: 'var(--text)' }}>
          {formatElapsed(elapsedMs)}
        </p>
        {timerState === 'running' && (
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
        {timerState === 'paused' && (
          <span className="text-xs tracking-wider" style={{ color: 'var(--muted)' }}>
            PAUSED
          </span>
        )}
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        {formatCost(perMinuteRate)}/min
      </p>
    </div>
  );
}

export { CostDisplay };
