import { describe, expect, it } from 'vitest';
import { calculateOnCosts } from './on-costs.ts';

describe('calculateOnCosts', () => {
  it('£35,000 with levy', () => {
    // NI: 0.15 × (35000 - 5000) = 4500
    // Pension: 0.03 × (35000 - 6240) = 862.80
    // Levy: 0.005 × 35000 = 175
    // Total: 40537.80
    const result = calculateOnCosts(35_000);
    expect(result.employerNi).toBe(4500);
    expect(result.employerPension).toBeCloseTo(862.8, 2);
    expect(result.apprenticeshipLevy).toBe(175);
    expect(result.totalEmploymentCost).toBeCloseTo(40_537.8, 2);
    expect(result.onCostPercentage).toBeCloseTo(0.1582, 4);
  });

  it('caps qualifying earnings at upper limit', () => {
    // Salary above £50,270: pension only on £6,240–£50,270 band
    // Pension: 0.03 × (50270 - 6240) = 0.03 × 44030 = 1320.90
    const result = calculateOnCosts(80_000);
    expect(result.employerPension).toBeCloseTo(1320.9, 2);
  });

  it('zero pension when salary below lower qualifying limit', () => {
    const result = calculateOnCosts(5000);
    expect(result.employerPension).toBe(0);
  });

  it('returns all zeros for zero salary', () => {
    const result = calculateOnCosts(0);
    expect(result.employerNi).toBe(0);
    expect(result.employerPension).toBe(0);
    expect(result.apprenticeshipLevy).toBe(0);
    expect(result.totalEmploymentCost).toBe(0);
    expect(result.onCostPercentage).toBe(0);
  });

  it('without levy: apprenticeshipLevy is zero and total adjusts', () => {
    const withLevy = calculateOnCosts(35_000, true);
    const withoutLevy = calculateOnCosts(35_000, false);

    expect(withoutLevy.apprenticeshipLevy).toBe(0);
    expect(withoutLevy.totalEmploymentCost).toBeCloseTo(
      withLevy.totalEmploymentCost - withLevy.apprenticeshipLevy,
      2
    );
    expect(withoutLevy.onCostPercentage).toBeLessThan(withLevy.onCostPercentage);
  });
});
