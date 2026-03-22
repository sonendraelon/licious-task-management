import { useEffect, useState } from 'react'
import { TASKS_STORAGE_KEY, safeParseTasks } from '../utils/taskUtils'
import type { Task } from '../types'

// Centralized tasks hook handling fetching and saving from localStorage
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return []
    return safeParseTasks(window.localStorage.getItem(TASKS_STORAGE_KEY))
  })

  // Auto-save tasks whenever they are modified
  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Ignore save failures
    }
  }, [tasks])

  return { tasks, setTasks }
}

