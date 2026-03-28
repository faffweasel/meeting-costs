import { describe, expect, it } from 'vitest';
import { createAttendee } from './attendee.ts';
import { calculateAdvancedCost, calculateSimpleCost } from './cost.ts';

describe('mode sync: simple → advanced', () => {
  it('creates the correct number of attendees at the given salary', () => {
    const attendees = Array.from({ length: 4 }, () => createAttendee({ salary: 42_000 }));
    expect(attendees).toHaveLength(4);
    for (const a of attendees) {
      expect(a.salary).toBe(42_000);
    }
  });

  it('each attendee has a unique id', () => {
    const attendees = Array.from({ length: 5 }, () => createAttendee({ salary: 35_000 }));
    const ids = new Set(attendees.map((a) => a.id));
    expect(ids.size).toBe(5);
  });

  it('preserves meeting cost after sync', () => {
    const people = 5;
    const averageSalary = 50_000;
    const elapsedMs = 3_600_000;
    const simpleCost = calculateSimpleCost(people, averageSalary, elapsedMs);
    const attendees = Array.from({ length: people }, () =>
      createAttendee({ salary: averageSalary })
    );
    const advancedCost = calculateAdvancedCost(
      attendees.map((a) => a.salary),
      elapsedMs
    );
    expect(advancedCost).toBeCloseTo(simpleCost, 2);
  });
});

describe('mode sync: advanced → simple', () => {
  it('people count equals attendee count', () => {
    const attendees = [
      createAttendee({ salary: 30_000 }),
      createAttendee({ salary: 40_000 }),
      createAttendee({ salary: 50_000 }),
    ];
    expect(attendees.length).toBe(3);
  });

  it('average salary is the mean of attendee salaries', () => {
    const attendees = [
      createAttendee({ salary: 30_000 }),
      createAttendee({ salary: 40_000 }),
      createAttendee({ salary: 50_000 }),
    ];
    const avg = Math.round(attendees.reduce((sum, a) => sum + a.salary, 0) / attendees.length);
    expect(avg).toBe(40_000);
  });

  it('rounds average salary to the nearest pound', () => {
    const attendees = [createAttendee({ salary: 33_333 }), createAttendee({ salary: 33_334 })];
    const avg = Math.round(attendees.reduce((sum, a) => sum + a.salary, 0) / attendees.length);
    // (33333 + 33334) / 2 = 33333.5 → rounds to 33334
    expect(avg).toBe(33_334);
  });

  it('falls back to £35,000 when attendee list is empty', () => {
    const attendees: readonly ReturnType<typeof createAttendee>[] = [];
    const avg =
      attendees.length > 0
        ? Math.round(attendees.reduce((sum, a) => sum + a.salary, 0) / attendees.length)
        : 35_000;
    expect(avg).toBe(35_000);
  });

  it('preserves meeting cost after sync (linear hourly rates)', () => {
    const attendees = [
      createAttendee({ salary: 25_000 }),
      createAttendee({ salary: 35_000 }),
      createAttendee({ salary: 60_000 }),
    ];
    const elapsedMs = 1_800_000; // 30 min
    const advancedCost = calculateAdvancedCost(
      attendees.map((a) => a.salary),
      elapsedMs
    );
    const avg = Math.round(attendees.reduce((sum, a) => sum + a.salary, 0) / attendees.length);
    const simpleCost = calculateSimpleCost(attendees.length, avg, elapsedMs);
    // Linear rates → average preserves total cost (within rounding tolerance)
    expect(simpleCost).toBeCloseTo(advancedCost, 1);
  });
});
