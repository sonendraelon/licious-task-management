import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDashboard } from "../src/task/TaskDashboard";

async function addTask({
  title,
  description,
  priority,
  dueDate,
}: {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
}) {
  const user = userEvent.setup();

  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: description },
  });
  fireEvent.change(screen.getByLabelText("Priority"), {
    target: { value: priority },
  });
  fireEvent.change(screen.getByLabelText("Due Date"), {
    target: { value: dueDate },
  });

  await user.click(screen.getByRole("button", { name: /add task/i }));
}

function taskItemByTitle(title: string): HTMLElement {
  const titleNode = screen.getByText(title);
  const item = titleNode.closest(".taskItem") as HTMLElement | null;
  if (!item) throw new Error("Task item not found");
  return item;
}

describe("TaskDashboard", () => {
  test("creates tasks and persists to localStorage after remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TaskDashboard />);

    await addTask({
      title: "Plan",
      description: "Sprint planning",
      priority: "High",
      dueDate: "2026-03-20",
    });

    expect(screen.getByText("Plan")).toBeInTheDocument();

    await waitFor(() => {
      const raw = window.localStorage.getItem("taskDashboard.tasks");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw || "[]") as unknown[];
      expect(parsed.length).toBe(1);
    });

    unmount();
    render(<TaskDashboard />);

    expect(screen.getByText("Plan")).toBeInTheDocument();

    // Quiet usage of `user` so lint doesn't complain about unused vars in test files.
    void user;
  });

  test("search and status filters update visible tasks", async () => {
    render(<TaskDashboard />);

    await addTask({
      title: "Alpha",
      description: "First task",
      priority: "Low",
      dueDate: "2026-03-20",
    });
    await addTask({
      title: "Beta",
      description: "Second task",
      priority: "Medium",
      dueDate: "2026-03-21",
    });

    const searchInput = screen.getByPlaceholderText(
      /search by title or description/i,
    );
    await userEvent.type(searchInput, "Alpha");

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    });

    // Mark Alpha as completed.
    const alphaItem = taskItemByTitle("Alpha");
    const checkbox = within(alphaItem).getByRole("checkbox", {
      name: /mark as complete/i,
    });
    await userEvent.click(checkbox);

    // Switch filter to Completed.
    await userEvent.click(screen.getByRole("button", { name: /completed/i }));

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  test("toggle completion updates UI and delete confirmation removes the task", async () => {
    render(<TaskDashboard />);

    await addTask({
      title: "Gamma",
      description: "Third task",
      priority: "Low",
      dueDate: "2026-03-20",
    });

    const item = taskItemByTitle("Gamma");
    const checkbox = within(item).getByRole("checkbox", {
      name: /mark as complete/i,
    });
    await userEvent.click(checkbox);

    expect(within(item).getByText("Completed")).toBeInTheDocument();
    expect(item.className).toMatch(/taskItemCompleted/);

    const deleteButton = within(item).getByRole("button", {
      name: /delete task/i,
    });
    await userEvent.click(deleteButton);

    // Confirm deletion.
    await userEvent.click(screen.getByLabelText("Delete"));
    await waitFor(() =>
      expect(screen.queryByText("Gamma")).not.toBeInTheDocument(),
    );
  });

  test("drag-and-drop reorder updates task order", async () => {
    const { container } = render(<TaskDashboard />);

    await addTask({
      title: "A",
      description: "a",
      priority: "Low",
      dueDate: "2026-03-20",
    });
    await addTask({
      title: "B",
      description: "b",
      priority: "Low",
      dueDate: "2026-03-21",
    });

    const getOrder = () =>
      Array.from(container.querySelectorAll(".taskTitle"))
        .map((n) => n.textContent)
        .filter(Boolean) as string[];

    // New tasks go to the top: B then A.
    expect(getOrder()).toEqual(["B", "A"]);

    const aItem = taskItemByTitle("A");
    const bItem = taskItemByTitle("B");

    const aHandle = within(aItem).getByLabelText("Drag to reorder");
    fireEvent.dragStart(aHandle);

    fireEvent.dragOver(bItem);
    fireEvent.drop(bItem);

    await waitFor(() => expect(getOrder()).toEqual(["A", "B"]));
  });

  test("card/list view toggle switches task layout", async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskDashboard />);

    await addTask({
      title: "View",
      description: "Mode toggle",
      priority: "Low",
      dueDate: "2026-03-20",
    });
    expect(screen.getByText("View")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cards/i }));
    await waitFor(() => {
      const list = container.querySelector(".taskList");
      expect(list?.className).toMatch(/taskListCard/);
    });

    await user.click(screen.getByRole("button", { name: /list/i }));
    await waitFor(() => {
      const list = container.querySelector(".taskList");
      expect(list?.className).toMatch(/taskListRow/);
    });

    // Quiet usage of `user` so lint doesn't complain about unused vars in test files.
    void user;
  });

  test("theme toggle switches theme and persists", async () => {
    render(<TaskDashboard />);

    // After mount, the theme effect should set the dataset.
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBeTruthy(),
    );

    const toggle = screen.getByRole("button", { name: /toggle theme/i });
    await userEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
    expect(
      JSON.parse(window.localStorage.getItem("taskDashboard.theme") || "null"),
    ).toBe("dark");
  });

  test("pagination keeps large task sets manageable", async () => {
    const seeded = Array.from({ length: 30 }, (_, i) => ({
      id: `seed-${i + 1}`,
      title: `Task ${String(i + 1).padStart(2, "0")}`,
      description: "Seeded",
      priority: "Low",
      dueDate: "2026-03-20",
      completed: false,
      createdAt: i + 1,
    }));
    window.localStorage.setItem("taskDashboard.tasks", JSON.stringify(seeded));

    render(<TaskDashboard />);

    expect(screen.getByText("1-24 of 30")).toBeInTheDocument();
    expect(screen.getByText("Task 01")).toBeInTheDocument();
    expect(screen.queryByText("Task 30")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => {
      expect(screen.getByText("25-30 of 30")).toBeInTheDocument();
      expect(screen.getByText("Task 30")).toBeInTheDocument();
    });
  });
});
