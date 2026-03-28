import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AttendeeList } from './components/AttendeeList.tsx';
import { CostDisplay } from './components/CostDisplay.tsx';
import type { Mode } from './components/ModeToggle.tsx';
import { ModeToggle } from './components/ModeToggle.tsx';
import { OnCostsPanel } from './components/OnCostsPanel.tsx';
import { SimpleSettings } from './components/SimpleSettings.tsx';
import { TimerControls } from './components/TimerControls.tsx';
import type { Attendee } from './lib/attendee.ts';
import { createAttendee } from './lib/attendee.ts';
import { calculateAdvancedCost, calculateSimpleCost } from './lib/cost.ts';
import { calculateOnCosts } from './lib/on-costs.ts';
import type { TimerState } from './lib/timer.ts';
import { createTimer } from './lib/timer.ts';

const timer = createTimer();

export default function App(): ReactNode {
  const timerRef = useRef(timer);
  const rafRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const [mode, setMode] = useState<Mode>('simple');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);

  const [people, setPeople] = useState(4);
  const [averageSalary, setAverageSalary] = useState(35_000);

  const [attendees, setAttendees] = useState<readonly Attendee[]>(() => [
    createAttendee(),
    createAttendee(),
  ]);

  const [includeOnCosts, setIncludeOnCosts] = useState(false);
  const [includeLevy, setIncludeLevy] = useState(true);

  useEffect(() => {
    if (timerState !== 'running') return;

    function tick() {
      const now = performance.now();
      if (now - lastUpdateRef.current >= 100) {
        setElapsedMs(timerRef.current.elapsed());
        lastUpdateRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timerState]);

  const handleStart = useCallback(() => {
    timerRef.current.start();
    setTimerState('running');
    lastUpdateRef.current = performance.now();
  }, []);

  const handlePause = useCallback(() => {
    timerRef.current.pause();
    setTimerState('paused');
    setElapsedMs(timerRef.current.elapsed());
  }, []);

  const handleResume = useCallback(() => {
    timerRef.current.resume();
    setTimerState('running');
    lastUpdateRef.current = performance.now();
  }, []);

  const handleReset = useCallback(() => {
    timerRef.current.reset();
    setTimerState('idle');
    setElapsedMs(0);
  }, []);

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode === mode) return;
      if (newMode === 'advanced') {
        setAttendees(
          Array.from({ length: people }, () => createAttendee({ salary: averageSalary }))
        );
      } else {
        const avg =
          attendees.length > 0
            ? Math.round(attendees.reduce((sum, a) => sum + a.salary, 0) / attendees.length)
            : 35_000;
        setPeople(attendees.length);
        setAverageSalary(avg);
      }
      setMode(newMode);
    },
    [mode, people, averageSalary, attendees]
  );

  const salaries = mode === 'advanced' ? attendees.map((a) => a.salary) : [];
  const onCostsPerAttendee =
    mode === 'advanced' && includeOnCosts
      ? attendees.map((a) => calculateOnCosts(a.salary, includeLevy))
      : [];
  const simpleOnCosts = includeOnCosts ? calculateOnCosts(averageSalary, includeLevy) : null;

  const salaryCost =
    mode === 'simple'
      ? calculateSimpleCost(people, averageSalary, elapsedMs)
      : calculateAdvancedCost(salaries, elapsedMs);

  const effectiveSalary =
    includeOnCosts && simpleOnCosts ? simpleOnCosts.totalEmploymentCost : averageSalary;
  const trueCostSalaries = onCostsPerAttendee.map((oc) => oc.totalEmploymentCost);

  const cost =
    mode === 'simple'
      ? calculateSimpleCost(people, effectiveSalary, elapsedMs)
      : includeOnCosts
        ? calculateAdvancedCost(trueCostSalaries, elapsedMs)
        : salaryCost;

  const perMinuteRate =
    mode === 'simple'
      ? calculateSimpleCost(people, effectiveSalary, 60_000)
      : includeOnCosts
        ? calculateAdvancedCost(trueCostSalaries, 60_000)
        : calculateAdvancedCost(salaries, 60_000);

  const onCostPercentage =
    mode === 'simple' && simpleOnCosts
      ? simpleOnCosts.onCostPercentage
      : onCostsPerAttendee.length > 0
        ? onCostsPerAttendee.reduce((sum, oc) => sum + oc.onCostPercentage, 0) /
          onCostsPerAttendee.length
        : 0;

  return (
    <main className="mx-auto max-w-[720px] px-4 py-12 text-center">
      <h1 className="text-lg font-bold tracking-widest" style={{ color: 'var(--text)' }}>
        MEETING COST CALCULATOR
      </h1>
      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
        meetings.faffweasel.com
      </p>

      <ModeToggle mode={mode} onModeChange={handleModeChange} />
      <CostDisplay
        cost={cost}
        elapsedMs={elapsedMs}
        perMinuteRate={perMinuteRate}
        timerState={timerState}
        salaryCost={includeOnCosts ? salaryCost : null}
        onCostPercentage={onCostPercentage}
      />
      {mode === 'simple' ? (
        <SimpleSettings
          people={people}
          averageSalary={averageSalary}
          onPeopleChange={setPeople}
          onSalaryChange={setAverageSalary}
        />
      ) : (
        <AttendeeList attendees={attendees} onAttendeesChange={setAttendees} />
      )}
      <OnCostsPanel
        includeOnCosts={includeOnCosts}
        onIncludeOnCostsChange={setIncludeOnCosts}
        includeLevy={includeLevy}
        onIncludeLevyChange={setIncludeLevy}
        attendees={mode === 'advanced' ? attendees : null}
        onCostsPerAttendee={onCostsPerAttendee}
      />
      <TimerControls
        timerState={timerState}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
      />
    </main>
  );
}
