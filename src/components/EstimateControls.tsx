interface EstimateControlsProps {
  readonly minutes: number | '';
  readonly onMinutesChange: (minutes: number | '') => void;
}

function EstimateControls({ minutes, onMinutesChange }: EstimateControlsProps): React.ReactNode {
  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '') {
      onMinutesChange('');
      return;
    }
    const value = Number(e.target.value);
    if (value >= 0 && Number.isFinite(value * 60_000)) {
      onMinutesChange(value);
    }
  }

  return (
    <div className="mt-8">
      <label
        htmlFor="meeting-duration"
        className="mb-2 block text-sm tracking-wider"
        style={{ color: 'var(--muted)' }}
      >
        DURATION
      </label>
      <div className="flex items-center justify-center gap-2">
        <input
          id="meeting-duration"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={minutes}
          onChange={handleMinutesChange}
          className="min-h-[44px] w-24 border border-[var(--border)] bg-transparent px-2 text-center"
          style={{ color: 'var(--text)' }}
        />
        <span style={{ color: 'var(--muted)' }}>minutes</span>
      </div>
      <fieldset className="m-0 mt-2 flex justify-center gap-2 border-0 p-0">
        <legend className="sr-only">Duration presets</legend>
        {[15, 30, 45, 60].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onMinutesChange(preset)}
            aria-label={`${preset} minutes`}
            aria-pressed={minutes === preset}
            className={`min-h-[44px] min-w-[44px] border border-[var(--border)] px-2 text-sm ${
              minutes === preset
                ? 'bg-[var(--accent)] font-bold text-[var(--bg)]'
                : 'text-[var(--muted)] hover:bg-[var(--surface)]'
            }`}
          >
            {preset}
          </button>
        ))}
      </fieldset>
    </div>
  );
}

export { EstimateControls };
