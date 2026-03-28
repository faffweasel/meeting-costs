import type { Attendee } from '../lib/attendee.ts';

interface AttendeeRowProps {
  readonly attendee: Attendee;
  readonly onUpdate: (id: string, updated: Attendee) => void;
  readonly onRemove: (id: string) => void;
  readonly canRemove: boolean;
}

const INPUT_CLASS = 'min-h-[44px] border border-[var(--border)] bg-[var(--bg)] px-2';

function AttendeeRow({
  attendee,
  onUpdate,
  onRemove,
  canRemove,
}: AttendeeRowProps): React.ReactNode {
  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    onUpdate(attendee.id, { ...attendee, label: e.target.value });
  }

  function handleSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) {
      onUpdate(attendee.id, { ...attendee, salary: Math.max(1, value) });
    }
  }

  return (
    <div className="mx-auto flex max-w-[520px] items-center text-left">
      <input
        type="text"
        value={attendee.label}
        onChange={handleLabelChange}
        placeholder="Role (optional)"
        aria-label="Attendee name"
        className={`${INPUT_CLASS} min-w-0 flex-1`}
        style={{ color: 'var(--text)' }}
      />
      <span
        className="flex min-h-[44px] items-center border border-r-0 border-l-0 border-[var(--border)] px-2"
        style={{ color: 'var(--muted)' }}
        aria-hidden="true"
      >
        £
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={attendee.salary}
        onChange={handleSalaryChange}
        min={1}
        step={1000}
        aria-label="Annual salary"
        className={`${INPUT_CLASS} w-full max-w-[140px] shrink-0`}
        style={{ color: 'var(--text)' }}
      />
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(attendee.id)}
          aria-label={`Remove ${attendee.label || 'attendee'}`}
          className="flex min-h-[44px] w-11 shrink-0 items-center justify-center border border-l-0 border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]"
        >
          ×
        </button>
      )}
    </div>
  );
}

export { AttendeeRow, INPUT_CLASS };
