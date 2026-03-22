import { applyTaskFilters, arrayMove } from '../src/task/utils/taskUtils'
import type { Task } from '../src/task/types'

function task(id: string, partial: Partial<Task> = {}): Task {
  return {
    id,
    title: 't',
    description: 'd',
    priority: 'Medium',
    dueDate: '2026-03-20',
    completed: false,
    createdAt: 1,
    ...partial,
  }
}

describe('taskUtils', () => {
  test('arrayMove moves item and preserves order', () => {
    const next = arrayMove(['a', 'b', 'c'], 0, 2)
    expect(next).toEqual(['b', 'c', 'a'])
  })

  test('applyTaskFilters filters by status, priority, and query', () => {
    const tasks: Task[] = [
      task('1', { title: 'Build UI', description: 'Cards', priority: 'High', completed: false }),
      task('2', { title: 'Fix bug', description: 'Overflow', priority: 'Low', completed: true }),
    ]

    const filtered = applyTaskFilters(tasks, { query: 'over', status: 'Completed', priority: 'All' })
    expect(filtered.map((t) => t.id)).toEqual(['2'])
  })
})

