import type { Priority, Task } from '../types'
import { formatDueDate } from '../utils/taskUtils'

const PRIORITY_META: Record<Priority, { label: string; tone: string }> = {
  Low: { label: 'Low', tone: 'toneLow' },
  Medium: { label: 'Medium', tone: 'toneMedium' },
  High: { label: 'High', tone: 'toneHigh' },
}

// Renders a single task card/row with HTML5 drag-and-drop bindings
export function TaskItem({
  task,
  viewMode,
  isDragOver,
  onToggleCompleted,
  onEdit,
  onRequestDelete,
  onDropOnMe,
  onDragOverMe,
  onDragStartId,
  isNew,
}: {
  task: Task
  viewMode: 'list' | 'card'
  isDragOver: boolean
  isNew: boolean
  onToggleCompleted: (next: boolean) => void
  onEdit: () => void
  onRequestDelete: () => void
  onDropOnMe: () => void
  onDragOverMe: () => void
  onDragStartId: (id: string) => void
}) {
  const meta = PRIORITY_META[task.priority]

  return (
    <div
      className={`taskItem ${viewMode === 'card' ? 'taskItemCard' : 'taskItemRow'} ${
        task.completed ? 'taskItemCompleted' : ''
      } ${isDragOver ? 'taskItemDragOver' : ''} ${isNew ? 'taskItemNew' : ''}`}
      data-task-id={task.id}
      // HTML5 Drag handlers for reordering
      onDragOver={(e) => {
        e.preventDefault() // Required to allow a drop event to fire
        onDragOverMe()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDropOnMe()
      }}
    >
      <div className="taskDragHandle" draggable onDragStart={() => onDragStartId(task.id)} aria-label="Drag to reorder" />

      <div className="taskMain">
        <div className="taskTop">
          <div className="taskTitleWrap">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => onToggleCompleted(e.target.checked)}
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              className="taskCheckbox"
            />
            <div className="taskTitle">{task.title}</div>
          </div>

          <div className="taskBadges">
            <span className={`badge ${meta.tone}`} aria-label={`Priority: ${meta.label}`}>
              {meta.label}
            </span>
          </div>
        </div>

        <div className="taskDesc">{task.description}</div>

        <div className="taskBottom">
          <div className="taskDue" aria-label={`Due date: ${task.dueDate}`}>
            Due: <span className="taskDueValue">{formatDueDate(task.dueDate)}</span>
          </div>
          <div className="taskStatus">
            Status:{' '}
            <span className={task.completed ? 'statusCompleted' : 'statusPending'}>
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="taskActions">
        <button className="iconButton" type="button" onClick={onEdit} aria-label="Edit task">
          Edit
        </button>
        <button className="iconButton iconButtonDanger" type="button" onClick={onRequestDelete} aria-label="Delete task">
          Delete
        </button>
      </div>
    </div>
  )
}

