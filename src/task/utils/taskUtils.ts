import type { Priority, Task, TaskFilters, TaskStatusFilter, PriorityFilter } from '../types'

export const TASKS_STORAGE_KEY = 'taskDashboard.tasks'

// Normalize strings for search comparisons
export function normalizeForSearch(value: string): string {
  return value.trim().toLowerCase()
}

// Format date strings as standard readable dates (e.g. Jan 01, 2024)
export function formatDueDate(dueDate: string): string {
  // Default to raw if empty
  if (!dueDate) return ''
  const [y, m, d] = dueDate.split('-').map((p) => Number(p))
  if (!y || !m || !d) return dueDate
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

// Helper for reordering array elements (used for Drag & Drop)
export function arrayMove<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = items.slice()
  const start = fromIndex < 0 ? 0 : fromIndex
  const end = toIndex < 0 ? 0 : toIndex
  const [moved] = next.splice(start, 1)
  next.splice(end, 0, moved)
  return next
}

// Filters tasks depending on current query, status, and priority
export function applyTaskFilters(tasks: Task[], filters: TaskFilters): Task[] {
  const query = normalizeForSearch(filters.query)

  return tasks.filter((task) => {
    if (filters.status !== 'All') {
      const desired: boolean = filters.status === 'Completed'
      if (task.completed !== desired) return false
    }

    if (filters.priority !== 'All') {
      if (task.priority !== filters.priority) return false
    }

    if (query) {
      const haystack = normalizeForSearch(`${task.title} ${task.description}`)
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

// Parse raw JSON from localStorage, safely ensuring missing/corrupted data won't crash the app
export function safeParseTasks(raw: string | null): Task[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    // Minimal runtime validation to avoid breaking the UI on corrupted storage.
    const tasks: Task[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const t = item as Partial<Task>
      if (typeof t.id !== 'string') continue
      if (typeof t.title !== 'string') continue
      if (typeof t.description !== 'string') continue
      if (t.priority !== 'Low' && t.priority !== 'Medium' && t.priority !== 'High') continue
      if (typeof t.dueDate !== 'string') continue
      if (typeof t.completed !== 'boolean') continue
      if (typeof t.createdAt !== 'number') continue
      tasks.push(t as Task)
    }
    return tasks
  } catch {
    return []
  }
}

export function getNextPriority(current: Priority, next: Priority): Priority {
  return next ?? current
}

// Ensure all required fields exist for typical form submissions
export function validateTaskInput(input: {
  title: string
  description: string
  priority: Priority
  dueDate: string
}): { ok: true } | { ok: false; message: string } {
  if (!input.title.trim()) return { ok: false, message: 'Title is required.' }
  if (!input.dueDate) return { ok: false, message: 'Due date is required.' }
  if (!input.priority) return { ok: false, message: 'Priority is required.' }
  // Description can be empty; it is still part of the data model.
  return { ok: true }
}

// Basic string label helpers for JSX bounds checking
export function statusLabel(status: TaskStatusFilter): string {
  if (status === 'All') return 'All'
  return status
}

export function priorityLabel(priority: PriorityFilter): string {
  if (priority === 'All') return 'All'
  return priority
}

// Standard debounce function to delay executing high-cost functions (like filtering when typing)
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return (...args: TArgs) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

