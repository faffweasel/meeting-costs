import type { ChangeEvent, ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.tsx';
import { createAttendee } from '../lib/attendee.ts';
import { AttendeeList } from './AttendeeList.tsx';
import { AttendeeRow } from './AttendeeRow.tsx';
import { CostDisplay } from './CostDisplay.tsx';
import { ModeToggle } from './ModeToggle.tsx';
import { OnCostsPanel } from './OnCostsPanel.tsx';
import { SimpleSettings } from './SimpleSettings.tsx';
import { findControl } from './test-controls.ts';

// Keep hook state between component calls so event handlers can be tested without a DOM.
const state = vi.hoisted(() => ({ values: [] as unknown[], index: 0 }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => {
    const index = state.index++;
    if (!(index in state.values)) {
      state.values[index] = typeof initial === 'function' ? initial() : initial;
    }
    return [
      state.values[index],
      (next: unknown) => {
        state.values[index] = typeof next === 'function' ? next(state.values[index]) : next;
      },
    ];
  },
  useCallback: (callback: unknown) => callback,
}));

beforeEach(() => {
  state.values = [];
  state.index = 0;
});

function render(component: () => ReactNode): ReactNode {
  state.index = 0;
  return component();
}

function change(node: ReactNode, label: string, value: string) {
  findControl(node, 'input', label).props.onChange?.({
    target: { value },
  } as ChangeEvent<HTMLInputElement>);
}

describe('advanced salary inputs', () => {
  it('can clear a salary and type a replacement', () => {
    let attendee = createAttendee({ salary: 35_000 });
    const row = () =>
      AttendeeRow({
        attendee,
        onUpdate: (_id, updated) => {
          attendee = updated;
        },
        onRemove: vi.fn(),
        canRemove: false,
      });
    for (const value of ['', '4', '42000']) {
      change(row(), 'Annual salary', value);
      const input = findControl(row(), 'input', 'Annual salary');
      expect(input.props.value).toBe(value === '' ? '' : Number(value));
      expect(input.props.placeholder).toBe('35000');
    }
  });

  it.each(['NaN', 'Infinity'])('does not accept %s as a salary', (value) => {
    const onUpdate = vi.fn();
    change(
      AttendeeRow({ attendee: createAttendee(), onUpdate, onRemove: vi.fn(), canRemove: false }),
      'Annual salary',
      value
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('can clear the quick-add count and enter a replacement', () => {
    const onAttendeesChange = vi.fn();
    const list = () => render(() => AttendeeList({ attendees: [], onAttendeesChange }));
    change(list(), 'Number of people to add', '');
    expect(findControl(list(), 'input', 'Number of people to add').props.value).toBe('');
    const add = findControl(list(), 'button', 'ADD');
    expect(add.props.disabled).toBe(true);
    add.props.onClick?.();
    expect(onAttendeesChange).not.toHaveBeenCalled();
    change(list(), 'Number of people to add', '12');
    expect(findControl(list(), 'input', 'Number of people to add').props.value).toBe(12);
    findControl(list(), 'button', 'ADD').props.onClick?.();
    expect(onAttendeesChange.mock.calls[0]?.[0]).toHaveLength(12);
  });

  it('keeps the quick-add salary blank until a salary is entered', () => {
    const onAttendeesChange = vi.fn();
    const list = () => render(() => AttendeeList({ attendees: [], onAttendeesChange }));
    expect(findControl(list(), 'input', 'Salary for new attendees').props.value).toBe('');
    expect(findControl(list(), 'input', 'Salary for new attendees').props.placeholder).toBe(
      '35000'
    );
    for (const value of ['45000', '', '4', '42000']) {
      change(list(), 'Salary for new attendees', value);
      expect(findControl(list(), 'input', 'Salary for new attendees').props.value).toBe(
        value === '' ? '' : Number(value)
      );
    }
    findControl(list(), 'button', 'ADD').props.onClick?.();
    expect(onAttendeesChange.mock.calls[0]?.[0][0].salary).toBe(42_000);
    change(list(), 'Salary for new attendees', '');
    findControl(list(), 'button', 'ADD').props.onClick?.();
    expect(onAttendeesChange.mock.calls[1]?.[0][0].salary).toBe('');
  });

  it('adds individual attendees with an empty salary', () => {
    const onAttendeesChange = vi.fn();
    const list = render(() => AttendeeList({ attendees: [], onAttendeesChange }));
    findControl(list, 'button', '+ ADD ATTENDEE').props.onClick?.();
    expect(onAttendeesChange.mock.calls[0]?.[0][0].salary).toBe('');
  });
});

describe('salary values when switching modes', () => {
  it.each(['', 42_000] as const)('preserves salary %s on a round trip', (salary) => {
    let app = render(App);
    findControl<ComponentProps<typeof SimpleSettings>>(app, SimpleSettings).props.onSalaryChange(
      salary
    );
    app = render(App);
    findControl<ComponentProps<typeof ModeToggle>>(app, ModeToggle).props.onModeChange('advanced');
    app = render(App);
    const list = findControl<ComponentProps<typeof AttendeeList>>(app, AttendeeList);
    expect(list.props.attendees).toHaveLength(4);
    expect(list.props.attendees.every((attendee) => attendee.salary === salary)).toBe(true);
    findControl<ComponentProps<typeof ModeToggle>>(app, ModeToggle).props.onModeChange('simple');
    app = render(App);
    expect(
      findControl<ComponentProps<typeof SimpleSettings>>(app, SimpleSettings).props.averageSalary
    ).toBe(salary);
  });

  it('treats cleared salaries as zero for cost and on-costs without inserting zero in the inputs', () => {
    let app = render(App);
    findControl<ComponentProps<typeof ModeToggle>>(app, ModeToggle).props.onModeChange('advanced');
    app = render(App);
    const list = findControl<ComponentProps<typeof AttendeeList>>(app, AttendeeList);
    list.props.onAttendeesChange(
      list.props.attendees.map((attendee) => ({ ...attendee, salary: '' }))
    );
    findControl<ComponentProps<typeof OnCostsPanel>>(
      app,
      OnCostsPanel
    ).props.onIncludeOnCostsChange(true);
    app = render(App);
    const display = findControl<ComponentProps<typeof CostDisplay>>(app, CostDisplay);
    expect(display.props.computeCost(3_600_000)).toBe(0);
    expect(display.props.computeSalaryCost?.(3_600_000)).toBe(0);
    expect(
      findControl<ComponentProps<typeof OnCostsPanel>>(
        app,
        OnCostsPanel
      ).props.onCostsPerAttendee.every((cost) => cost.totalEmploymentCost === 0)
    ).toBe(true);
    findControl<ComponentProps<typeof ModeToggle>>(app, ModeToggle).props.onModeChange('simple');
    app = render(App);
    expect(
      findControl<ComponentProps<typeof SimpleSettings>>(app, SimpleSettings).props.averageSalary
    ).toBe('');
  });
});
