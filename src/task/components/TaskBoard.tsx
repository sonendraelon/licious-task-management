import { useMemo, useState } from "react";
import type { Task, ViewMode } from "../types";
import { TaskItem } from "./TaskItem";

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48, 96];

export function TaskBoard({
  visibleTasks,
  viewMode,
  onViewModeChange,
  newTaskId,
  dragEnabled = true,
  onToggleCompleted,
  onEdit,
  onRequestDelete,
  onReorder,
}: {
  visibleTasks: Task[];
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
  newTaskId: string | null;
  dragEnabled?: boolean;
  onToggleCompleted: (taskId: string, nextCompleted: boolean) => void;
  onEdit: (taskId: string) => void;
  onRequestDelete: (taskId: string) => void;
  onReorder: (fromTaskId: string, toTaskId: string) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(24);
  const [page, setPage] = useState<number>(1);

  const totalTasks = visibleTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = totalTasks === 0 ? 0 : (clampedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalTasks);
  const pagedTasks = useMemo(() => {
    return visibleTasks.slice(startIndex, endIndex);
  }, [visibleTasks, startIndex, endIndex]);

  const viewLabel = useMemo(() => {
    return viewMode === "card" ? "Cards view" : "List view";
  }, [viewMode]);

  const showPager = totalTasks > pageSize;
  const goToPage = (nextPage: number) => {
    const normalized = Math.min(totalPages, Math.max(1, nextPage));
    setPage(normalized);
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div className="taskBoard">
      <div className="boardTop">
        <div
          className="viewToggle"
          role="group"
          aria-label="Toggle list or card view"
        >
          <button
            type="button"
            className={`toggleButton ${viewMode === "list" ? "toggleButtonActive" : ""}`}
            onClick={() => {
              onViewModeChange("list");
              goToPage(1);
            }}
            aria-pressed={viewMode === "list"}
          >
            List
          </button>
          <button
            type="button"
            className={`toggleButton ${viewMode === "card" ? "toggleButtonActive" : ""}`}
            onClick={() => {
              onViewModeChange("card");
              goToPage(1);
            }}
            aria-pressed={viewMode === "card"}
          >
            Cards
          </button>
        </div>

        <div className="boardTopRight">
          <label className="boardPageSizeLabel" htmlFor="board-page-size">
            Show
          </label>
          <select
            id="board-page-size"
            className="boardPageSizeSelect"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              goToPage(1);
            }}
            aria-label="Tasks per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="boardMeta" aria-label={viewLabel}>
            {totalTasks === 0 ? "0 tasks shown" : `${startIndex + 1}-${endIndex} of ${totalTasks}`}
          </div>
        </div>
      </div>

      {totalTasks === 0 ? (
        <div className="emptyState">
          <div className="emptyTitle">No matches right now.</div>
          <div className="emptyHint">
            Try tweaking search, status, or priority.
          </div>
        </div>
      ) : null}

      {totalTasks > 0 ? (
        <div className="boardScroller">
          <div className={`taskList ${viewMode === "card" ? "taskListCard" : "taskListRow"}`}>
            {pagedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                viewMode={viewMode}
                isDragOver={dragOverId === task.id && draggingId !== task.id}
                isNew={newTaskId === task.id}
                onToggleCompleted={(next) => onToggleCompleted(task.id, next)}
                onEdit={() => onEdit(task.id)}
                onRequestDelete={() => onRequestDelete(task.id)}
                onDropOnMe={() => {
                  if (!draggingId) return;
                  if (draggingId === task.id) return;
                  onReorder(draggingId, task.id);
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragOverMe={() => {
                  if (!draggingId) return;
                  setDragOverId(task.id);
                }}
                onDragStartId={(id) => {
                  if (!dragEnabled) return;
                  setDraggingId(id);
                  setDragOverId(id);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {showPager ? (
        <div className="boardPager" aria-label="Task pagination">
          <button
            type="button"
            className="iconButton"
            onClick={() => goToPage(clampedPage - 1)}
            disabled={clampedPage === 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <div className="boardPagerMeta">
            Page {clampedPage} / {totalPages}
          </div>
          <button
            type="button"
            className="iconButton"
            onClick={() => goToPage(clampedPage + 1)}
            disabled={clampedPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
