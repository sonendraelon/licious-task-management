import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { TaskBoard } from "./components/TaskBoard";
import { TaskForm, type TaskFormValues } from "./components/TaskForm";
import { EditTaskModal } from "./components/EditTaskModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { TaskStats } from "./components/TaskStats";
import { useTheme } from "./hooks/useTheme";
import { useTasks } from "./hooks/useTasks";
import type { Task, TaskFilters, ViewMode } from "./types";
import { applyTaskFilters, arrayMove } from "./utils/taskUtils";
import "./taskDashboard.css";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `task_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const DEFAULT_FILTERS: TaskFilters = {
  query: "",
  status: "All",
  priority: "All",
};

// Main Task Dashboard Container orchestrating state and layout
export function TaskDashboard() {
  const { tasks, setTasks } = useTasks();
  const { theme, setTheme } = useTheme();

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [newTaskId, setNewTaskId] = useState<string | null>(null);

  // Derived state for Modals
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const editingTask = useMemo(
    () => tasks.find((t) => t.id === editingTaskId) ?? null,
    [editingTaskId, tasks],
  );

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const deleteTask = useMemo(
    () => tasks.find((t) => t.id === deleteTaskId) ?? null,
    [deleteTaskId, tasks],
  );

  // Apply filters to tasks list
  const visibleTasks = useMemo(
    () => applyTaskFilters(tasks, filters),
    [tasks, filters],
  );

  // Calculate high-level task metrics
  const totals = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  // Clear 'new task' animation state timer
  useEffect(() => {
    if (!newTaskId) return;
    const t = window.setTimeout(() => setNewTaskId(null), 1200);
    return () => window.clearTimeout(t);
  }, [newTaskId]);

  // --- Handlers ---

  function addTask(values: TaskFormValues) {
    const nextTask: Task = {
      id: createId(),
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      dueDate: values.dueDate,
      completed: false, // New tasks default to pending
      createdAt: Date.now(),
    };

    setTasks((prev) => {
      return [nextTask, ...prev];
    });

    setNewTaskId(nextTask.id);
  }

  function toggleCompleted(taskId: string, nextCompleted: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: nextCompleted } : t,
      ),
    );
  }

  function openEdit(taskId: string) {
    setEditingTaskId(taskId);
  }

  function saveEdit(next: Task) {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  }

  function requestDelete(taskId: string) {
    setDeleteTaskId(taskId);
  }

  function confirmDelete() {
    if (!deleteTaskId) return;
    const id = deleteTaskId;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteTaskId(null);
    if (editingTaskId === id) setEditingTaskId(null);
  }

  function reorder(fromTaskId: string, toTaskId: string) {
    if (fromTaskId === toTaskId) return;
    const fromIndex = tasks.findIndex((t) => t.id === fromTaskId);
    const toIndex = tasks.findIndex((t) => t.id === toTaskId);
    if (fromIndex < 0 || toIndex < 0) return;
    setTasks((prev) => arrayMove(prev, fromIndex, toIndex));
  }

  // Theme toggle with instantaneous CSS variables
  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <div className="dashboardShell">
      <header className="dashboardHeader">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            Licious
          </div>
          <div className="brandText">
            <div className="brandTitle">Task Management</div>
            <div className="brandSubtitle">
              Create, reorder, and track your work
            </div>
          </div>
        </div>

        <div className="headerActions">
          <button
            type="button"
            className="themeToggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="themeIcon" aria-hidden="true">
              {theme === "dark" ? <MoonIcon /> : <SunIcon />}
            </span>
          </button>
        </div>
      </header>

      <main className="dashboardMain">
        <section className="panel panelPrimary">
          <div className="panelTitleRow">
            <h1 className="panelTitle">Create a task</h1>
            <div className="panelTitleMeta">
              Due dates keep everything on track
            </div>
          </div>
          <TaskForm submitText="Add task" onSubmit={addTask} />
        </section>

        <section className="panel panelSecondary">
          <div className="panelTitleRow">
            <h2 className="panelTitle">Search, filter, and update</h2>
          </div>

          <TaskStats
            total={totals.total}
            pending={totals.pending}
            completed={totals.completed}
          />
          <FilterBar filters={filters} onChange={setFilters} />

          <TaskBoard
            visibleTasks={visibleTasks}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            newTaskId={newTaskId}
            onToggleCompleted={toggleCompleted}
            onEdit={openEdit}
            onRequestDelete={requestDelete}
            onReorder={reorder}
          />
        </section>
      </main>

      <EditTaskModal
        open={Boolean(editingTaskId)}
        task={editingTask}
        onClose={() => setEditingTaskId(null)}
        onSave={(next) => saveEdit(next)}
      />

      <ConfirmDialog
        open={Boolean(deleteTaskId)}
        title="Delete task?"
        description={
          deleteTask
            ? `This will permanently remove "${deleteTask.title}" from your list.`
            : "This will permanently remove the selected task."
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTaskId(null)}
      />
    </div>
  );
}
