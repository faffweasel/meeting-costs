import { useState } from 'react';
import type { Attendee } from '../lib/attendee.ts';
import { createAttendee } from '../lib/attendee.ts';
import { AttendeeRow, INPUT_CLASS } from './AttendeeRow.tsx';

interface AttendeeListProps {
  readonly attendees: readonly Attendee[];
  readonly onAttendeesChange: (attendees: readonly Attendee[]) => void;
}

const MAX_ATTENDEES = 100;

function AttendeeList({ attendees, onAttendeesChange }: AttendeeListProps): React.ReactNode {
  const canAdd = attendees.length < MAX_ATTENDEES;
  const [quickCount, setQuickCount] = useState(1);
  const [quickSalary, setQuickSalary] = useState(35_000);

  function handleUpdate(id: string, updated: Attendee) {
    onAttendeesChange(attendees.map((a) => (a.id === id ? updated : a)));
  }

  function handleRemove(id: string) {
    onAttendeesChange(attendees.filter((a) => a.id !== id));
  }

  function handleAdd() {
    if (!canAdd) return;
    onAttendeesChange([...attendees, createAttendee()]);
  }

  function handleQuickAdd() {
    const remaining = MAX_ATTENDEES - attendees.length;
    if (remaining <= 0) return;
    const count = Math.max(1, Math.min(remaining, quickCount));
    const newAttendees = Array.from({ length: count }, () =>
      createAttendee({ salary: quickSalary })
    );
    onAttendeesChange([...attendees, ...newAttendees]);
  }

  function handleQuickCountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) setQuickCount(Math.max(1, value));
  }

  function handleQuickSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) setQuickSalary(Math.max(0, value));
  }

  return (
    <div className="mt-8 space-y-1">
      {attendees.map((attendee) => (
        <AttendeeRow
          key={attendee.id}
          attendee={attendee}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          canRemove={attendees.length > 1}
        />
      ))}

      {canAdd && (
        <>
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleAdd}
              className="min-h-[44px] border border-[var(--border)] px-4 py-2 tracking-wider text-[var(--accent)] hover:bg-[var(--surface)]"
            >
              + ADD ATTENDEE
            </button>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-2 pt-2"
            style={{ color: 'var(--muted)' }}
          >
            <span className="tracking-wider">ADD</span>
            <input
              type="number"
              inputMode="decimal"
              value={quickCount}
              onChange={handleQuickCountChange}
              min={1}
              max={MAX_ATTENDEES - attendees.length}
              className={`${INPUT_CLASS} w-14 text-center`}
              style={{ color: 'var(--text)' }}
              aria-label="Number of people to add"
            />
            <span className="tracking-wider">AT £</span>
            <input
              type="number"
              inputMode="decimal"
              value={quickSalary}
              onChange={handleQuickSalaryChange}
              min={0}
              step={1000}
              className={`${INPUT_CLASS} w-24`}
              style={{ color: 'var(--text)' }}
              aria-label="Salary for new attendees"
            />
            <button
              type="button"
              onClick={handleQuickAdd}
              className="min-h-[44px] bg-[var(--accent)] px-4 py-2 font-bold tracking-wider text-[var(--bg)] hover:opacity-80"
            >
              ADD
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export { AttendeeList };
