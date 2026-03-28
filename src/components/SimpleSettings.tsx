interface SimpleSettingsProps {
  readonly people: number;
  readonly averageSalary: number;
  readonly onPeopleChange: (n: number) => void;
  readonly onSalaryChange: (n: number) => void;
}

const stepperBtnClass =
  'flex min-h-[44px] w-11 items-center justify-center border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)]';

function SimpleSettings({
  people,
  averageSalary,
  onPeopleChange,
  onSalaryChange,
}: SimpleSettingsProps): React.ReactNode {
  function handlePeopleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) {
      onPeopleChange(Math.max(1, Math.min(100, Math.round(value))));
    }
  }

  function handlePeopleDecrement() {
    onPeopleChange(Math.max(1, people - 1));
  }

  function handlePeopleIncrement() {
    onPeopleChange(Math.min(100, people + 1));
  }

  function handleSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) {
      onSalaryChange(Math.max(1, value));
    }
  }

  return (
    <div className="mx-auto mt-10 flex max-w-sm justify-center gap-8">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm tracking-wider" style={{ color: 'var(--muted)' }}>
          PEOPLE
        </legend>
        <div className="flex items-center">
          <button
            type="button"
            onClick={handlePeopleDecrement}
            aria-label="Decrease number of people"
            className={stepperBtnClass}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={people}
            onChange={handlePeopleChange}
            min={1}
            max={100}
            aria-label="Number of people"
            className="min-h-[44px] w-12 border-y border-[var(--border)] bg-transparent text-center"
            style={{ color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={handlePeopleIncrement}
            aria-label="Increase number of people"
            className={stepperBtnClass}
          >
            +
          </button>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="average-salary"
          className="mb-2 block text-sm tracking-wider"
          style={{ color: 'var(--muted)' }}
        >
          AVG SALARY
        </label>
        <div className="flex items-center">
          <span
            className="flex min-h-[44px] items-center border border-r-0 border-[var(--border)] px-2"
            style={{ color: 'var(--muted)' }}
            aria-hidden="true"
          >
            £
          </span>
          <input
            id="average-salary"
            type="number"
            inputMode="decimal"
            value={averageSalary}
            onChange={handleSalaryChange}
            min={1}
            step={1000}
            className="min-h-[44px] w-28 border border-[var(--border)] bg-transparent px-2"
            style={{ color: 'var(--text)' }}
          />
        </div>
      </div>
    </div>
  );
}

export { SimpleSettings };
