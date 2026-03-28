import { describe, expect, it } from 'vitest';
import { annualSalaryToHourlyRate, calculateAdvancedCost, calculateSimpleCost } from './cost.ts';

describe('annualSalaryToHourlyRate', () => {
  it('converts £37,800 to exactly £20/hr', () => {
    expect(annualSalaryToHourlyRate(37_800)).toBe(20);
  });

  it('converts zero salary to zero', () => {
    expect(annualSalaryToHourlyRate(0)).toBe(0);
  });
});

describe('calculateSimpleCost', () => {
  it('calculates cost for known values', () => {
    // 3 people × £20/hr × 1 hour = £60
    const oneHourMs = 3_600_000;
    expect(calculateSimpleCost(3, 37_800, oneHourMs)).toBe(60);
  });

  it('scales linearly with elapsed time', () => {
    // 1 person × £20/hr × 30 minutes = £10
    const thirtyMinMs = 1_800_000;
    expect(calculateSimpleCost(1, 37_800, thirtyMinMs)).toBe(10);
  });

  it('returns zero when elapsed time is zero', () => {
    expect(calculateSimpleCost(5, 50_000, 0)).toBe(0);
  });

  it('returns zero when people is zero', () => {
    expect(calculateSimpleCost(0, 50_000, 3_600_000)).toBe(0);
  });
});

describe('calculateAdvancedCost', () => {
  it('sums individual hourly rates over elapsed time', () => {
    // Two people at £37,800 (£20/hr each) for 1 hour = £40
    const oneHourMs = 3_600_000;
    expect(calculateAdvancedCost([37_800, 37_800], oneHourMs)).toBe(40);
  });

  it('handles different salaries', () => {
    // £37,800 (£20/hr) + £56,700 (£30/hr) for 1 hour = £50
    const oneHourMs = 3_600_000;
    expect(calculateAdvancedCost([37_800, 56_700], oneHourMs)).toBe(50);
  });

  it('returns zero when elapsed time is zero', () => {
    expect(calculateAdvancedCost([37_800, 56_700], 0)).toBe(0);
  });

  it('returns zero for empty salaries array', () => {
    expect(calculateAdvancedCost([], 3_600_000)).toBe(0);
  });
});
