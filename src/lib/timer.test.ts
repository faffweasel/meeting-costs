import { describe, expect, it } from 'vitest';
import { createTimer } from './timer.ts';

function fakeClock(initial = 0) {
  let time = initial;
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe('createTimer', () => {
  it('starts in idle state with zero elapsed', () => {
    const timer = createTimer(() => 0);
    expect(timer.state()).toBe('idle');
    expect(timer.elapsed()).toBe(0);
  });

  it('tracks elapsed time while running', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    expect(timer.state()).toBe('running');

    clock.advance(1000);
    expect(timer.elapsed()).toBe(1000);

    clock.advance(500);
    expect(timer.elapsed()).toBe(1500);
  });

  it('freezes elapsed time on pause', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(2000);
    timer.pause();

    expect(timer.state()).toBe('paused');
    expect(timer.elapsed()).toBe(2000);

    clock.advance(5000);
    expect(timer.elapsed()).toBe(2000);
  });

  it('resumes from the paused point', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(1000);
    timer.pause();
    clock.advance(3000);
    timer.resume();

    expect(timer.state()).toBe('running');
    expect(timer.elapsed()).toBe(1000);

    clock.advance(500);
    expect(timer.elapsed()).toBe(1500);
  });

  it('resets to idle with zero elapsed', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(5000);
    timer.reset();

    expect(timer.state()).toBe('idle');
    expect(timer.elapsed()).toBe(0);
  });

  it('can start again after reset', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(1000);
    timer.reset();
    timer.start();
    clock.advance(200);

    expect(timer.elapsed()).toBe(200);
  });

  it('does not accumulate drift over multiple pause/resume cycles', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(100);
    timer.pause();
    clock.advance(9999);
    timer.resume();

    clock.advance(100);
    timer.pause();
    clock.advance(9999);
    timer.resume();

    clock.advance(100);
    timer.pause();
    clock.advance(9999);
    timer.resume();

    clock.advance(100);

    expect(timer.elapsed()).toBe(400);
  });

  it('ignores start when already running', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(1000);
    timer.start();
    clock.advance(500);

    expect(timer.elapsed()).toBe(1500);
  });

  it('ignores pause when not running', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.pause();
    expect(timer.state()).toBe('idle');
    expect(timer.elapsed()).toBe(0);
  });

  it('ignores resume when not paused', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.resume();
    expect(timer.state()).toBe('idle');

    timer.start();
    clock.advance(100);
    timer.resume();
    expect(timer.elapsed()).toBe(100);
  });

  it('can reset from paused state', () => {
    const clock = fakeClock();
    const timer = createTimer(clock.now);

    timer.start();
    clock.advance(1000);
    timer.pause();
    timer.reset();

    expect(timer.state()).toBe('idle');
    expect(timer.elapsed()).toBe(0);
  });
});
