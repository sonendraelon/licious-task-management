import { useMemo, useState } from 'react'
import type { Priority } from '../types'
import { validateTaskInput } from '../utils/taskUtils'

// Form state omitting ID and generated times
export type TaskFormValues = {
  title: string
  description: string
  priority: Priority
  dueDate: string
}

// Reusable form layout with local validation
export function TaskForm({
  initialValues,
  submitText,
  onSubmit,
}: {
  initialValues?: Partial<TaskFormValues>
  submitText: string
  onSubmit: (values: TaskFormValues) => void
}) {
  const defaults = useMemo<TaskFormValues>(
    () => ({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      ...initialValues,
    }),
    [initialValues]
  )

  const [values, setValues] = useState<TaskFormValues>(defaults)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof TaskFormValues>(key: K, next: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: next }))
  }

  // Validate and submit task payload
  function submit() {
    const result = validateTaskInput(values)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setError(null)
    onSubmit(values)
  }

  return (
    <div className="taskForm" role="form" aria-label="Task form">
      <div className="field">
        <label className="label" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className="input"
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="e.g. Prepare sprint plan"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="task-desc">
          Description
        </label>
        <textarea
          id="task-desc"
          className="textarea"
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="What needs to be done?"
          rows={3}
        />
      </div>

      <div className="grid2">
        <div className="field">
          <label className="label" htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className="select"
            value={values.priority}
            onChange={(e) => setField('priority', e.target.value as Priority)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="task-dueDate">
            Due Date
          </label>
          <input
            id="task-dueDate"
            className="input"
            type="date"
            value={values.dueDate}
            onChange={(e) => setField('dueDate', e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="formError" role="alert">{error}</div> : null}

      <button className="button buttonPrimary" type="button" onClick={submit} aria-label={submitText}>
        {submitText}
      </button>
    </div>
  )
}

