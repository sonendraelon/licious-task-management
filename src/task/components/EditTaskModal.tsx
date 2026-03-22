import type { Task } from '../types'
import { Modal } from './Modal'
import { TaskForm, type TaskFormValues } from './TaskForm'

// Modal wrapper for the TaskForm populated with existing task data
export function EditTaskModal({
  open,
  task,
  onSave,
  onClose,
}: {
  open: boolean
  task: Task | null
  onSave: (next: Task) => void
  onClose: () => void
}) {
  const initialValues = task
    ? {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
      }
    : undefined

  return (
    <Modal title="Edit task" open={open} onClose={onClose}>
      {task ? (
        <TaskForm
          key={task.id}
          initialValues={initialValues}
          submitText="Save changes"
          onSubmit={(values: TaskFormValues) => {
            onSave({
              ...task,
              title: values.title,
              description: values.description,
              priority: values.priority,
              dueDate: values.dueDate,
            })
            onClose()
          }}
        />
      ) : (
        <p className="muted">No task selected.</p>
      )}
    </Modal>
  )
}

