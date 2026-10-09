import {
  type ChangeEvent,
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App.tsx';
import { calculateAdvancedCost, calculateSimpleCost } from '../lib/cost.ts';
import { calculateOnCosts } from '../lib/on-costs.ts';
import { createTimer } from '../lib/timer.ts';
import { CostDisplay } from './CostDisplay.tsx';
import { EstimateControls } from './EstimateControls.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

interface ControlProps {
  readonly children?: ReactNode;
  readonly 'aria-label'?: string;
  readonly 'aria-pressed'?: boolean;
  readonly value?: number | '';
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onClick?: () => void;
}

function findControl(
  node: ReactNode,
  type: 'input' | 'button',
  label?: string
): ReactElement<ControlProps> {
  const pending = Children.toArray(node);
  while (pending.length > 0) {
    const child = pending.shift();
    if (!isValidElement<ControlProps>(child)) continue;
    if (child.type === type && (label === undefined || child.props['aria-label'] === label)) {
      return child;
    }
    pending.push(...Children.toArray(child.props.children));
  }
  throw new Error(`Missing ${label ?? type} control`);
}

describe('estimate duration controls', () => {
  it('can clear the duration and enter a replacement', () => {
    let minutes: number | '' = 30;
    const onMinutesChange = (value: number | '') => {
      minutes = value;
    };
    for (const value of ['', '4', '45']) {
      const input = findControl(EstimateControls({ minutes, onMinutesChange }), 'input');
      input.props.onChange?.({ target: { value } } as ChangeEvent<HTMLInputElement>);
      expect(minutes).toBe(value === '' ? '' : Number(value));
      const updated = findControl(EstimateControls({ minutes, onMinutesChange }), 'input');
      expect(updated.props.value).toBe(minutes);
    }
  });

  it.each([0, 0.5, 90])('accepts a duration of %s minutes', (minutes) => {
    const onMinutesChange = vi.fn();
    const input = findControl(EstimateControls({ minutes: 30, onMinutesChange }), 'input');
    input.props.onChange?.({ target: { value: String(minutes) } } as ChangeEvent<HTMLInputElement>);
    expect(onMinutesChange).toHaveBeenCalledWith(minutes);
  });

  it.each(['-1', 'NaN', 'Infinity', '1e308'])('rejects invalid duration %s', (value) => {
    const onMinutesChange = vi.fn();
    const input = findControl(EstimateControls({ minutes: 30, onMinutesChange }), 'input');
    input.props.onChange?.({ target: { value } } as ChangeEvent<HTMLInputElement>);
    expect(onMinutesChange).not.toHaveBeenCalled();
  });

  it.each([15, 30, 45, 60])('selects the %s-minute shortcut', (minutes) => {
    const onMinutesChange = vi.fn();
    const button = findControl(
      EstimateControls({ minutes: 30, onMinutesChange }),
      'button',
      `${minutes} minutes`
    );
    button.props.onClick?.();
    expect(onMinutesChange).toHaveBeenCalledWith(minutes);
    const selected = findControl(
      EstimateControls({ minutes, onMinutesChange }),
      'button',
      `${minutes} minutes`
    );
    expect(selected.props['aria-pressed']).toBe(true);
  });
});

describe('meeting estimate display', () => {
  it('keeps the initial app in live timer mode', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'light' });
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain('START');
    expect(markup).toContain('Estimate a meeting');
    expect(markup).toContain('00:00:00');
    expect(markup).not.toContain('meeting-duration');
  });

  it.each([
    ['simple', (ms: number) => calculateSimpleCost(3, 37_800, ms), '£30.00'],
    ['advanced', (ms: number) => calculateAdvancedCost([37_800, 56_700], ms), '£25.00'],
  ] as const)('shows a 30-minute estimate in %s mode', (_mode, computeCost, expectedCost) => {
    const markup = renderToStaticMarkup(
      <CostDisplay
        timer={createTimer(() => 0)}
        timerState="paused"
        computeCost={computeCost}
        computeSalaryCost={null}
        perMinuteRate={computeCost(60_000)}
        onCostPercentage={0}
        estimatedDurationMs={30 * 60_000}
      />
    );
    expect(markup).toContain(expectedCost);
    expect(markup).toContain('ESTIMATED COST');
    expect(markup).not.toContain('00:00:00');
    expect(markup).not.toContain('PAUSED');
  });

  it.each([
    'simple',
    'advanced',
  ])('uses the estimated duration for salary and on-costs in %s mode', (mode) => {
    const onCosts = calculateOnCosts(35_000);
    const salaries = Array.from({ length: 6 }, () => 35_000);
    const trueCostSalaries = salaries.map((salary) => calculateOnCosts(salary).totalEmploymentCost);
    const computeCost = (ms: number) =>
      mode === 'simple'
        ? calculateSimpleCost(6, onCosts.totalEmploymentCost, ms)
        : calculateAdvancedCost(trueCostSalaries, ms);
    const computeSalaryCost = (ms: number) =>
      mode === 'simple' ? calculateSimpleCost(6, 35_000, ms) : calculateAdvancedCost(salaries, ms);
    const markup = renderToStaticMarkup(
      <CostDisplay
        timer={createTimer(() => 0)}
        timerState="idle"
        computeCost={computeCost}
        computeSalaryCost={computeSalaryCost}
        perMinuteRate={computeCost(60_000)}
        onCostPercentage={onCosts.onCostPercentage}
        estimatedDurationMs={30 * 60_000}
      />
    );
    expect(markup).toContain('£64.35');
    expect(markup).toContain('Salary cost: £55.56');
    expect(markup).toContain('On-costs add ~16%');
  });

  it('shows zero cost for an empty duration', () => {
    const markup = renderToStaticMarkup(
      <CostDisplay
        timer={createTimer(() => 0)}
        timerState="idle"
        computeCost={(ms) => calculateSimpleCost(6, 35_000, ms)}
        computeSalaryCost={null}
        perMinuteRate={calculateSimpleCost(6, 35_000, 60_000)}
        onCostPercentage={0}
        estimatedDurationMs={0}
      />
    );
    expect(markup).toContain('£0.00');
    expect(markup).toContain('ESTIMATED COST');
    expect(markup).not.toContain('NaN');
  });
});
