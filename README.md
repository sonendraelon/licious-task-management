# Task management dashboard

Task management dashboard built for a frontend assignment. Using React + TypeScript, data saved in the browser.

## Live demo

https://licious-task-management-dashboard.netlify.app/

## What it does

- Add, edit, delete tasks (delete asks for confirmation)
- Mark tasks complete / pending
- Search by title or description, filter by status and priority
- Switch between list and card view
- Drag and drop to reorder
- Pagination (you can change page size)
- Light / dark theme, remembered after refresh
- Tasks stay after reload (localStorage)

## Optimization Techniques

- `useMemo` for derived state (`visibleTasks`, stats, edit/delete selected tasks)
- Utility-driven pure logic (`applyTaskFilters`, `arrayMove`) to reduce component complexity
- Avoid unnecessary renders by keeping state normalized and updates scoped
- Defensive `localStorage` parsing to prevent runtime crashes from corrupted data
- Pagination to limit DOM nodes rendered at once and keep interactions responsive

## How I Handle 1,000+ Tasks

- **Pagination-first rendering:** only a page subset is rendered (`24` default), reducing DOM pressure and reflow cost.
- **Efficient filtering pipeline:** filtering is computed from normalized inputs and applied in-memory with predictable complexity.
- **Stable interaction model:** reorder, toggle, edit, and delete operations are done with targeted immutable updates.
- **Persistence robustness:** data is serialized once per state change and safely restored on load.
- **Scalability-ready architecture:** clear separation between UI components, hooks, and utilities enables migration to server-backed pagination later with minimal refactor.

## Pagination

- Built-in pagination includes:
  - Page-size options: `6`, `12`, `24`, `48`, `96`
  - Previous/Next navigation
  - Visible range indicator (example: `25-30 of 30`)
- Pagination works seamlessly with search/filter/view toggles.


## Screenshots

**List view**

<img width="1456" height="902" alt="list view" src="https://github.com/user-attachments/assets/66960da2-1838-473d-b738-fac2199d014b" />

**Card view**

<img width="1442" height="774" alt="card view" src="https://github.com/user-attachments/assets/fdc8bc5d-c98e-4e1e-aa1d-3f9e362b5395" />

**Mobile**

<img width="521" height="782" alt="Screenshot 2026-03-21 203044" src="https://github.com/user-attachments/assets/112d1a3a-24ea-46fd-aba4-f3a29eb13f07" />

<img width="529" height="815" alt="Screenshot 2026-03-21 203135" src="https://github.com/user-attachments/assets/6e313f42-9441-4197-85a2-476798ddfd05" />


## Tech stack

- React 19
- TypeScript
- Vite
- CSS (no framework)
- localStorage for tasks and theme
- Jest + React Testing Library for tests
- ESLint

## How to run

```bash
git clone <your-repo-url>
cd licious-frontend-assignment/frontend
npm install
npm run dev
```

App runs on http://localhost:5173 (Vite default).

Other scripts:

- `npm run build` — production build
- `npm run preview` — try the build locally
- `npm test` — run tests
- `npm run lint` — eslint


