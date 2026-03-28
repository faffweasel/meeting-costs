type TimerState = 'idle' | 'running' | 'paused';

interface Timer {
  readonly start: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly reset: () => void;
  readonly elapsed: () => number;
  readonly state: () => TimerState;
}

function createTimer(now: () => number = performance.now.bind(performance)): Timer {
  let timerState: TimerState = 'idle';
  let startTime = 0;
  let accumulatedMs = 0;

  function elapsed(): number {
    if (timerState === 'running') {
      return accumulatedMs + (now() - startTime);
    }
    return accumulatedMs;
  }

  function start(): void {
    if (timerState !== 'idle') return;
    startTime = now();
    timerState = 'running';
  }

  function pause(): void {
    if (timerState !== 'running') return;
    accumulatedMs += now() - startTime;
    timerState = 'paused';
  }

  function resume(): void {
    if (timerState !== 'paused') return;
    startTime = now();
    timerState = 'running';
  }

  function reset(): void {
    timerState = 'idle';
    startTime = 0;
    accumulatedMs = 0;
  }

  function state(): TimerState {
    return timerState;
  }

  return { start, pause, resume, reset, elapsed, state };
}

export type { Timer, TimerState };
export { createTimer };
