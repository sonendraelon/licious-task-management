export type Priority = 'Low' | 'Medium' | 'High'
export type TaskStatusFilter = 'All' | 'Pending' | 'Completed'
export type PriorityFilter = 'All' | Priority
export type ViewMode = 'list' | 'card'

// Core Task Entity
export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string // YYYY-MM-DD
  completed: boolean
  createdAt: number
}

// Global Filter State
export interface TaskFilters {
  query: string
  status: TaskStatusFilter
  priority: PriorityFilter
}

