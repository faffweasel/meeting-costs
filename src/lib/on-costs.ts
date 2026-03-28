// UK 2025/26 (from April 2025)
const EMPLOYER_NI_RATE = 0.15;
const EMPLOYER_NI_THRESHOLD = 5000; // annual, secondary threshold
const AUTO_ENROLMENT_LOWER = 6240; // qualifying earnings lower
const AUTO_ENROLMENT_UPPER = 50270; // qualifying earnings upper
const AUTO_ENROLMENT_RATE = 0.03;
const APPRENTICESHIP_LEVY_RATE = 0.005;

interface OnCosts {
  readonly employerNi: number;
  readonly employerPension: number;
  readonly apprenticeshipLevy: number;
  readonly totalEmploymentCost: number;
  readonly onCostPercentage: number;
}

function calculateOnCosts(annualSalary: number, includeLevy = true): OnCosts {
  const employerNi = EMPLOYER_NI_RATE * Math.max(0, annualSalary - EMPLOYER_NI_THRESHOLD);

  const qualifyingEarnings = Math.max(
    0,
    Math.min(annualSalary, AUTO_ENROLMENT_UPPER) - AUTO_ENROLMENT_LOWER
  );
  const employerPension = AUTO_ENROLMENT_RATE * qualifyingEarnings;

  const apprenticeshipLevy = includeLevy ? APPRENTICESHIP_LEVY_RATE * annualSalary : 0;
  const totalEmploymentCost = annualSalary + employerNi + employerPension + apprenticeshipLevy;
  const onCostPercentage =
    annualSalary > 0 ? (totalEmploymentCost - annualSalary) / annualSalary : 0;

  return {
    employerNi,
    employerPension,
    apprenticeshipLevy,
    totalEmploymentCost,
    onCostPercentage,
  };
}

export type { OnCosts };
export { calculateOnCosts };
