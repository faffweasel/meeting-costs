# Meeting Cost Calculator

Real-time meeting cost calculator. Enter attendees and salaries, start a timer, watch the cost tick. Two modes: Simple (quick estimate) and Advanced (per-person salaries). Employer on-costs (generic UK).

Client-side only. No data leaves the browser. No accounts. No tracking.

## Stack

React + Vite + TypeScript (strict) + Tailwind CSS v4. Single-page app, no routing. Biome for linting/formatting (not ESLint/Prettier).

## Architecture

- `src/lib/` — pure calculation logic. No React, no DOM APIs.
  - `timer.ts` — start/pause/resume/reset, uses `performance.now()`, returns elapsed ms
  - `cost.ts` — salary-to-hourly conversion, simple cost, advanced cost
  - `on-costs.ts` — UK employer on-cost calculations
- `src/components/` — React UI components
- `scripts/` — maintenance scripts (not bundled)

## Key Constraints

- `src/lib/` must never import from React, DOM, or `src/components/`
- All calculation functions must be pure: same inputs → same outputs, no side effects
- Timer must use `performance.now()` — not `Date.now()` — to avoid drift on pause/resume
- Timer display updates at 100ms intervals via `requestAnimationFrame` or `setInterval`
- No external runtime dependencies beyond React. All data is hardcoded constants.
- Tailwind utility classes only, no custom CSS files
- Dark mode via `prefers-color-scheme` media query (follow system, no manual toggle)

## Design Tokens

Faffweasel brand. Monospace throughout. Defined as CSS custom properties.

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#f4f4f0` | `#0e0e0e` |
| `--text` | `#1a1a1a` | `#c8c8c0` |
| `--muted` | `#6b6b6b` | `#a3a3a3` |
| `--faint` | `#767676` | `#949494` |
| `--accent` | `#007070` | `#00a3a3` |
| `--accent-muted` | `#5a8a8a` | `#558888` |
| `--border` | `#8c8c85` | `#3a3a3a` |
| `--surface` | `#ffffff` | `#181818` |
| `--focus-ring` | `#007070` | `#00a3a3` |

Font: `Courier New`, monospace. No web fonts. No external font requests.

## File Structure

```
src/
├── lib/
│   ├── timer.ts                ← timer engine (pure, no React)
│   ├── cost.ts                 ← cost calculation functions
│   └── on-costs.ts             ← employer on-cost calculations
├── components/
│   ├── CostDisplay.tsx         ← large running cost, elapsed time, per-minute rate
│   ├── TimerControls.tsx       ← start/pause/resume/reset buttons
│   ├── ModeToggle.tsx          ← simple/advanced tab switch
│   ├── SimpleSettings.tsx      ← people count + average salary
│   ├── AttendeeList.tsx        ← advanced: per-person salary rows
│   ├── AttendeeRow.tsx         ← single attendee: label, salary input
│   ├── OnCostsPanel.tsx        ← on-costs toggle + breakdown
│   └── Footer.tsx              ← privacy notice, data source dates, repo link
├── App.tsx
├── main.tsx
└── index.css
```

## Key Types

```typescript
interface Attendee {
  id: string;
  label: string;
  salary: number;
}

interface OnCosts {
  employerNi: number;
  employerPension: number;
  apprenticeshipLevy: number;
  totalEmploymentCost: number;
  onCostPercentage: number;
}
```

## Constants

```typescript
const UK_WORKING_DAYS_PER_YEAR = 252;
const UK_HOURS_PER_DAY = 7.5;

// UK 2025/26 (from April 2025)
const EMPLOYER_NI_RATE = 0.15;
const EMPLOYER_NI_THRESHOLD = 5000;
const AUTO_ENROLMENT_LOWER = 6240;
const AUTO_ENROLMENT_UPPER = 50270;
const AUTO_ENROLMENT_RATE = 0.03;
const APPRENTICESHIP_LEVY_RATE = 0.005;
```

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run check` — Biome lint + format
- `npm run test` — Vitest

## Data Maintenance

- **UK NI/pension rates:** update constants in `on-costs.ts` annually (~April).

## Licence

AGPL-3.0
