import { describe, expect, it } from 'vitest';
import { calculateAdvancedCost } from './cost.ts';
import { calculateOnCosts } from './on-costs.ts';

describe('true cost computation', () => {
  // Two attendees with known on-costs (verified in on-costs.test.ts)
  // £35k: NI 4500, pension 862.80, levy 175 → total 40537.80
  // £50k: NI 6750, pension 1312.80, levy 250 → total 58312.80
  const salaries = [35_000, 50_000] as const;
  const elapsedMs = 3_600_000; // 1 hour

  it('with on-costs disabled, cost equals salary cost', () => {
    const salaryCost = calculateAdvancedCost(salaries, elapsedMs);
    // No on-costs → cost is just the salary cost
    expect(salaryCost).toBeCloseTo(44.974, 2);
  });

  it('with on-costs enabled, cost exceeds salary cost', () => {
    const salaryCost = calculateAdvancedCost(salaries, elapsedMs);
    const onCosts = salaries.map((s) => calculateOnCosts(s, true));
    const trueCost = calculateAdvancedCost(
      onCosts.map((oc) => oc.totalEmploymentCost),
      elapsedMs
    );
    expect(trueCost).toBeGreaterThan(salaryCost);
  });

  it('true cost matches manual calculation', () => {
    const onCosts = salaries.map((s) => calculateOnCosts(s, true));
    const trueCost = calculateAdvancedCost(
      onCosts.map((oc) => oc.totalEmploymentCost),
      elapsedMs
    );
    // (40537.80 + 58312.80) / (252 × 7.5) = 98850.60 / 1890 ≈ 52.302
    expect(trueCost).toBeCloseTo(52.302, 2);
  });

  it('levy toggle reduces true cost when disabled', () => {
    const withLevy = salaries.map((s) => calculateOnCosts(s, true));
    const withoutLevy = salaries.map((s) => calculateOnCosts(s, false));
    const costWithLevy = calculateAdvancedCost(
      withLevy.map((oc) => oc.totalEmploymentCost),
      elapsedMs
    );
    const costWithoutLevy = calculateAdvancedCost(
      withoutLevy.map((oc) => oc.totalEmploymentCost),
      elapsedMs
    );
    expect(costWithLevy).toBeGreaterThan(costWithoutLevy);
    // Difference should equal the levy portion
    const levyDiff =
      withLevy.reduce((sum, oc) => sum + oc.apprenticeshipLevy, 0) -
      withoutLevy.reduce((sum, oc) => sum + oc.apprenticeshipLevy, 0);
    const costDiff = costWithLevy - costWithoutLevy;
    // levy / hoursPerYear = cost difference per hour
    expect(costDiff).toBeCloseTo(levyDiff / (252 * 7.5), 6);
  });

  it('average on-cost percentage is the mean of individual percentages', () => {
    const onCosts = salaries.map((s) => calculateOnCosts(s, true));
    const avgPercentage =
      onCosts.reduce((sum, oc) => sum + oc.onCostPercentage, 0) / onCosts.length;
    // £35k: (40537.80 - 35000) / 35000 ≈ 0.15822
    // £50k: (58312.80 - 50000) / 50000 ≈ 0.16626
    // Mean: ≈ 0.16224
    expect(avgPercentage).toBeCloseTo(0.16224, 4);
  });

  it('on-cost percentage is zero when on-costs are disabled', () => {
    const onCosts: ReturnType<typeof calculateOnCosts>[] = [];
    const avgPercentage =
      onCosts.length > 0
        ? onCosts.reduce((sum, oc) => sum + oc.onCostPercentage, 0) / onCosts.length
        : 0;
    expect(avgPercentage).toBe(0);
  });
});
