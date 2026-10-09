import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { AttendeeList } from './components/AttendeeList.tsx';
import { CostDisplay } from './components/CostDisplay.tsx';
import { DarkModeToggle } from './components/DarkModeToggle.tsx';
import { EstimateControls } from './components/EstimateControls.tsx';
import { Faq } from './components/Faq.tsx';
import { Footer } from './components/Footer.tsx';
import type { Mode } from './components/ModeToggle.tsx';
import { ModeToggle } from './components/ModeToggle.tsx';
import { OnCostsPanel } from './components/OnCostsPanel.tsx';
import { PrivacyNotice } from './components/PrivacyNotice.tsx';
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
  const [mode, setMode] = useState<Mode>('simple');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isEstimating, setIsEstimating] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(30);

  const [people, setPeople] = useState(4);
  const [salaryInput, setSalaryInput] = useState<number | ''>('');
  const averageSalary = Number(salaryInput);

  const [attendees, setAttendees] = useState<readonly Attendee[]>(() => [
    createAttendee(),
    createAttendee(),
  ]);

  const [includeOnCosts, setIncludeOnCosts] = useState(false);
  const [includeLevy, setIncludeLevy] = useState(true);

  const handleStart = useCallback(() => {
    timer.start();
    setTimerState('running');
  }, []);

  const handlePause = useCallback(() => {
    timer.pause();
    setTimerState('paused');
  }, []);

  const handleResume = useCallback(() => {
    timer.resume();
    setTimerState('running');
  }, []);

  const handleReset = useCallback(() => {
    timer.reset();
    setTimerState('idle');
  }, []);

  const handleEstimate = useCallback(() => {
    timer.pause();
    setTimerState(timer.state());
    setIsEstimating(true);
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
        setSalaryInput(avg);
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

  const effectiveSalary =
    includeOnCosts && simpleOnCosts ? simpleOnCosts.totalEmploymentCost : averageSalary;
  const trueCostSalaries = onCostsPerAttendee.map((oc) => oc.totalEmploymentCost);

  const computeCost = (ms: number) =>
    mode === 'simple'
      ? calculateSimpleCost(people, effectiveSalary, ms)
      : includeOnCosts
        ? calculateAdvancedCost(trueCostSalaries, ms)
        : calculateAdvancedCost(salaries, ms);

  const computeSalaryCost = includeOnCosts
    ? (ms: number) =>
        mode === 'simple'
          ? calculateSimpleCost(people, averageSalary, ms)
          : calculateAdvancedCost(salaries, ms)
    : null;

  const perMinuteRate = computeCost(60_000);

  const onCostPercentage =
    mode === 'simple' && simpleOnCosts
      ? simpleOnCosts.onCostPercentage
      : onCostsPerAttendee.length > 0
        ? onCostsPerAttendee.reduce((sum, oc) => sum + oc.onCostPercentage, 0) /
          onCostsPerAttendee.length
        : 0;

  return (
    <>
      <header
        className="border-b px-4 py-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text)' }}>
              MEETING COST CALCULATOR
            </div>
            <div className="mt-0.5" style={{ color: 'var(--muted)' }}>
              by{' '}
              <a
                href="https://faffweasel.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                faffweasel
              </a>
            </div>
          </div>
          <DarkModeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <CostDisplay
          timer={timer}
          timerState={timerState}
          computeCost={computeCost}
          computeSalaryCost={computeSalaryCost}
          perMinuteRate={perMinuteRate}
          onCostPercentage={onCostPercentage}
          estimatedDurationMs={isEstimating ? Number(durationMinutes) * 60_000 : null}
        />
        {isEstimating ? (
          <EstimateControls minutes={durationMinutes} onMinutesChange={setDurationMinutes} />
        ) : (
          <TimerControls
            timerState={timerState}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
          />
        )}
        <button
          type="button"
          onClick={isEstimating ? () => setIsEstimating(false) : handleEstimate}
          className="min-h-[44px] px-3 py-2 text-sm underline underline-offset-4 hover:no-underline"
          style={{ color: 'var(--accent)' }}
        >
          {isEstimating ? 'Use live timer' : 'Estimate a meeting'}
        </button>
        {mode === 'simple' ? (
          <SimpleSettings
            people={people}
            averageSalary={salaryInput}
            onPeopleChange={setPeople}
            onSalaryChange={setSalaryInput}
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
        <Faq />
        <PrivacyNotice />
        <Footer />
      </main>
    </>
  );
}
