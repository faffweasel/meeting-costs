import { useEffect, useRef, useState } from 'react';
import type { Timer, TimerState } from '../lib/timer.ts';

interface CostDisplayProps {
  readonly timer: Timer;
  readonly timerState: TimerState;
  readonly computeCost: (elapsedMs: number) => number;
  readonly computeSalaryCost: ((elapsedMs: number) => number) | null;
  readonly perMinuteRate: number;
  readonly onCostPercentage: number;
  readonly estimatedDurationMs: number | null;
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

function describeElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  if (parts.length === 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

const ANNOUNCE_INTERVAL_MS = 5_000;

function CostDisplay({
  timer,
  timerState,
  computeCost,
  computeSalaryCost,
  perMinuteRate,
  onCostPercentage,
  estimatedDurationMs,
}: CostDisplayProps): React.ReactNode {
  const [elapsedMs, setElapsedMs] = useState(0);
  const lastAnnounceRef = useRef(0);
  const [announcement, setAnnouncement] = useState('');
  const isEstimating = estimatedDurationMs !== null;

  useEffect(() => {
    if (isEstimating || timerState !== 'running') {
      setElapsedMs(timer.elapsed());
      return;
    }

    let rafId = 0;
    let lastUpdate = performance.now();

    function tick() {
      const now = performance.now();
      if (now - lastUpdate >= 100) {
        setElapsedMs(timer.elapsed());
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [timerState, timer, isEstimating]);

  const durationMs = estimatedDurationMs ?? elapsedMs;
  const cost = computeCost(durationMs);
  const salaryCost = computeSalaryCost?.(durationMs) ?? null;
  const showTrueCost = salaryCost !== null;

  useEffect(() => {
    if (isEstimating) {
      setAnnouncement(
        `Estimated meeting cost: ${formatCost(cost)}. Duration: ${describeElapsed(durationMs)}.`
      );
      lastAnnounceRef.current = 0;
      return;
    }
    if (timerState !== 'running') {
      if (timerState === 'paused') {
        setAnnouncement(
          `Paused. Meeting cost: ${formatCost(cost)}. Elapsed: ${describeElapsed(elapsedMs)}.`
        );
      } else {
        setAnnouncement('Timer reset. Enter meeting details to see cost.');
      }
      lastAnnounceRef.current = 0;
      return;
    }
    const now = Date.now();
    if (now - lastAnnounceRef.current >= ANNOUNCE_INTERVAL_MS) {
      setAnnouncement(`Meeting cost: ${formatCost(cost)}. Elapsed: ${describeElapsed(elapsedMs)}.`);
      lastAnnounceRef.current = now;
    }
  }, [cost, durationMs, elapsedMs, timerState, isEstimating]);

  return (
    <div className="mt-10">
      <p className={showTrueCost ? '' : 'invisible'} style={{ color: 'var(--muted)' }}>
        Salary cost: {formatCost(salaryCost ?? cost)}
      </p>
      <p className="text-5xl font-bold" style={{ color: 'var(--text)' }}>
        {formatCost(cost)}
      </p>
      <p className={showTrueCost ? '' : 'invisible'} style={{ color: 'var(--muted)' }}>
        On-costs add ~{Math.round(onCostPercentage * 100)}% to salary cost
      </p>
      {isEstimating ? (
        <p className="mt-3 text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
          ESTIMATED COST
        </p>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-2">
          <p className="text-2xl tracking-wider" style={{ color: 'var(--text)' }}>
            {formatElapsed(elapsedMs)}
          </p>
          {timerState === 'running' && (
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          {timerState === 'paused' && (
            <span className="text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
              PAUSED
            </span>
          )}
        </div>
      )}
      <p
        className={`mt-1 text-sm${isEstimating || timerState !== 'idle' ? '' : ' invisible'}`}
        style={{ color: 'var(--muted)' }}
      >
        {formatCost(perMinuteRate)}/min
      </p>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

export { CostDisplay };
