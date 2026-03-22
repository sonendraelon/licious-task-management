// Task count summary display
export function TaskStats({
  total,
  pending,
  completed,
}: {
  total: number
  pending: number
  completed: number
}) {
  return (
    <div className="stats" aria-label="Task summary">
      <div className="stat">
        <div className="statValue">{total}</div>
        <div className="statLabel">Total</div>
      </div>
      <div className="stat">
        <div className="statValue">{pending}</div>
        <div className="statLabel">Pending</div>
      </div>
      <div className="stat">
        <div className="statValue">{completed}</div>
        <div className="statLabel">Completed</div>
      </div>
    </div>
  )
}

