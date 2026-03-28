const UK_WORKING_DAYS_PER_YEAR = 252;
const UK_HOURS_PER_DAY = 7.5;
const MS_PER_HOUR = 3_600_000;

function annualSalaryToHourlyRate(annualSalary: number): number {
  return annualSalary / (UK_WORKING_DAYS_PER_YEAR * UK_HOURS_PER_DAY);
}

function calculateSimpleCost(people: number, averageSalary: number, elapsedMs: number): number {
  const hourlyRate = annualSalaryToHourlyRate(averageSalary);
  return people * hourlyRate * (elapsedMs / MS_PER_HOUR);
}

function calculateAdvancedCost(salaries: readonly number[], elapsedMs: number): number {
  const combinedHourlyRate = salaries.reduce(
    (sum, salary) => sum + annualSalaryToHourlyRate(salary),
    0
  );
  return combinedHourlyRate * (elapsedMs / MS_PER_HOUR);
}

export {
  annualSalaryToHourlyRate,
  calculateAdvancedCost,
  calculateSimpleCost,
  UK_HOURS_PER_DAY,
  UK_WORKING_DAYS_PER_YEAR,
};
