import type { Priority, TaskFilters, TaskStatusFilter, PriorityFilter } from '../types'
import { priorityLabel, statusLabel } from '../utils/taskUtils'

const STATUS_OPTIONS: TaskStatusFilter[] = ['All', 'Pending', 'Completed']
const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High']

export function FilterBar({
  filters,
  onChange,
}: {
  filters: TaskFilters
  onChange: (next: TaskFilters) => void
}) {
  function setQuery(query: string) {
    onChange({ ...filters, query })
  }

  function setStatus(status: TaskStatusFilter) {
    onChange({ ...filters, status })
  }

  function setPriority(priority: PriorityFilter) {
    onChange({ ...filters, priority })
  }

  return (
    <div className="filterBar">
      <div className="searchWrap">
        <label className="srOnly" htmlFor="task-search">
          Search tasks
        </label>
        <input
          id="task-search"
          className="input"
          placeholder="Search by title or description..."
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filterGroup">
        <div className="filterLabel">Status</div>
        <div className="chipRow" role="group" aria-label="Status filter">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${filters.status === s ? 'chipActive' : ''}`}
              onClick={() => setStatus(s)}
              aria-pressed={filters.status === s}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="filterGroup">
        <div className="filterLabel">Priority</div>
        <div className="chipRow" role="group" aria-label="Priority filter">
          <button
            type="button"
            className={`chip ${filters.priority === 'All' ? 'chipActive' : ''}`}
            onClick={() => setPriority('All')}
            aria-pressed={filters.priority === 'All'}
          >
            {priorityLabel('All')}
          </button>
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${filters.priority === p ? 'chipActive' : ''}`}
              onClick={() => setPriority(p)}
              aria-pressed={filters.priority === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

