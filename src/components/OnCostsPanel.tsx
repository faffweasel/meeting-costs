import type { Attendee } from '../lib/attendee.ts';
import type { OnCosts } from '../lib/on-costs.ts';

interface OnCostsPanelProps {
  readonly includeOnCosts: boolean;
  readonly onIncludeOnCostsChange: (value: boolean) => void;
  readonly includeLevy: boolean;
  readonly onIncludeLevyChange: (value: boolean) => void;
  readonly attendees: readonly Attendee[] | null;
  readonly onCostsPerAttendee: readonly OnCosts[];
}

function formatGBP(amount: number): string {
  return `£${Math.round(amount).toLocaleString('en-GB')}`;
}

function OnCostsPanel({
  includeOnCosts,
  onIncludeOnCostsChange,
  includeLevy,
  onIncludeLevyChange,
  attendees,
  onCostsPerAttendee,
}: OnCostsPanelProps): React.ReactNode {
  function handleOnCostsToggle(e: React.ChangeEvent<HTMLInputElement>) {
    onIncludeOnCostsChange(e.target.checked);
  }

  function handleLevyToggle(e: React.ChangeEvent<HTMLInputElement>) {
    onIncludeLevyChange(e.target.checked);
  }

  const showBreakdown = attendees !== null && onCostsPerAttendee.length > 0;

  return (
    <div className="mt-6">
      <label
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2"
        style={{ color: 'var(--text)' }}
      >
        <input
          type="checkbox"
          checked={includeOnCosts}
          onChange={handleOnCostsToggle}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Include employer on-costs
      </label>

      {includeOnCosts && (
        <>
          <div className="mt-1">
            <label
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2"
              style={{ color: 'var(--text)' }}
            >
              <input
                type="checkbox"
                checked={includeLevy}
                onChange={handleLevyToggle}
                className="ml-6 h-4 w-4 accent-[var(--accent)]"
              />
              Include apprenticeship levy
            </label>
          </div>

          {showBreakdown && (
            <details className="mt-4">
              <summary
                className="cursor-pointer text-sm tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                ON-COSTS BREAKDOWN
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full" style={{ color: 'var(--text)' }}>
                  <thead>
                    <tr
                      className="border-b border-[var(--border)]"
                      style={{ color: 'var(--muted)' }}
                    >
                      <th className="py-2 text-left font-normal">Attendee</th>
                      <th className="py-2 text-right font-normal">Salary</th>
                      <th className="py-2 text-right font-normal">NI</th>
                      <th className="py-2 text-right font-normal">Pension</th>
                      <th className="py-2 text-right font-normal">Levy</th>
                      <th className="py-2 text-right font-normal">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee, i) => {
                      const oc = onCostsPerAttendee[i];
                      if (!oc) return null;
                      return (
                        <tr key={attendee.id} className="border-b border-[var(--border)]">
                          <td className="py-2">{attendee.label || `Attendee ${i + 1}`}</td>
                          <td className="py-2 text-right">{formatGBP(attendee.salary)}</td>
                          <td className="py-2 text-right">{formatGBP(oc.employerNi)}</td>
                          <td className="py-2 text-right">{formatGBP(oc.employerPension)}</td>
                          <td className="py-2 text-right">{formatGBP(oc.apprenticeshipLevy)}</td>
                          <td className="py-2 text-right">{formatGBP(oc.totalEmploymentCost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

export { OnCostsPanel };
