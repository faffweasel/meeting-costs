import type { Attendee } from '../lib/attendee.ts';

interface AttendeeRowProps {
  readonly attendee: Attendee;
  readonly onUpdate: (id: string, updated: Attendee) => void;
  readonly onRemove: (id: string) => void;
  readonly canRemove: boolean;
}

const INPUT_CLASS =
  'min-h-[44px] border border-[var(--border)] bg-[var(--bg)] px-2 text-sm outline-none focus:border-[var(--accent)]';

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
      onUpdate(attendee.id, { ...attendee, salary: Math.max(0, value) });
    }
  }

  return (
    <div
      className="border border-[var(--border)] p-3 text-left"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={attendee.label}
          onChange={handleLabelChange}
          placeholder="Label"
          className={`${INPUT_CLASS} w-28`}
          style={{ color: 'var(--text)' }}
        />
        <div className="flex items-center">
          <span
            className="flex min-h-[44px] items-center border border-r-0 border-[var(--border)] px-2 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            £
          </span>
          <input
            type="number"
            value={attendee.salary}
            onChange={handleSalaryChange}
            min={0}
            step={1000}
            className={`${INPUT_CLASS} w-24`}
            style={{ color: 'var(--text)' }}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(attendee.id)}
            className="ml-auto flex min-h-[44px] w-11 items-center justify-center border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export { AttendeeRow, INPUT_CLASS };
