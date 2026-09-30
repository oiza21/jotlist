// Pure task logic. No React, no storage — easy to test.

export const PRIORITIES = ['high', 'medium', 'low'];
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

let counter = 0;
export function makeId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function validateTask(input) {
  const errors = {};
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (!title) errors.title = 'Give the task a title.';
  else if (title.length > 120) errors.title = 'Keep the title under 120 characters.';
  if (input?.priority !== undefined && !PRIORITIES.includes(input.priority)) {
    errors.priority = 'Priority must be high, medium or low.';
  }
  if (input?.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    errors.dueDate = 'Due date must look like YYYY-MM-DD.';
  }
  if (input?.notes !== undefined && typeof input.notes !== 'string') {
    errors.notes = 'Notes must be text.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function createTask(tasks, input, now = new Date()) {
  const { valid, errors } = validateTask(input);
  if (!valid) return { tasks, errors, task: null };
  const stamp = now.toISOString();
  const task = {
    id: makeId(),
    title: input.title.trim(),
    notes: (input.notes ?? '').trim(),
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate || '',
    completed: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  return { tasks: [task, ...tasks], errors: {}, task };
}

export function updateTask(tasks, id, changes, now = new Date()) {
  const existing = tasks.find((t) => t.id === id);
  if (!existing) return { tasks, errors: { id: 'Task not found.' }, task: null };
  const merged = { ...existing, ...changes, id: existing.id, createdAt: existing.createdAt };
  const { valid, errors } = validateTask(merged);
  if (!valid) return { tasks, errors, task: null };
  const task = {
    ...merged,
    title: merged.title.trim(),
    notes: (merged.notes ?? '').trim(),
    updatedAt: now.toISOString(),
  };
  return { tasks: tasks.map((t) => (t.id === id ? task : t)), errors: {}, task };
}

export function toggleTask(tasks, id, now = new Date()) {
  const existing = tasks.find((t) => t.id === id);
  if (!existing) return { tasks, errors: { id: 'Task not found.' }, task: null };
  return updateTask(tasks, id, { completed: !existing.completed }, now);
}

export function deleteTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) return { tasks, errors: { id: 'Task not found.' } };
  return { tasks: tasks.filter((t) => t.id !== id), errors: {} };
}

export function clearCompleted(tasks) {
  return tasks.filter((t) => !t.completed);
}

export function isOverdue(task, today = todayString()) {
  return Boolean(task.dueDate) && !task.completed && task.dueDate < today;
}

export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function filterTasks(tasks, { status = 'all', priority = 'all', query = '' } = {}, today = todayString()) {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) => {
    if (status === 'active' && t.completed) return false;
    if (status === 'done' && !t.completed) return false;
    if (status === 'overdue' && !isOverdue(t, today)) return false;
    if (priority !== 'all' && t.priority !== priority) return false;
    if (q && !`${t.title} ${t.notes}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function sortTasks(tasks, by = 'created') {
  const list = [...tasks];
  const doneLast = (a, b) => Number(a.completed) - Number(b.completed);
  if (by === 'priority') {
    return list.sort((a, b) => doneLast(a, b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }
  if (by === 'due') {
    return list.sort((a, b) => {
      const d = doneLast(a, b);
      if (d) return d;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return list.sort((a, b) => doneLast(a, b) || b.createdAt.localeCompare(a.createdAt));
}

export function summarize(tasks, today = todayString()) {
  const done = tasks.filter((t) => t.completed).length;
  return {
    total: tasks.length,
    done,
    active: tasks.length - done,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
  };
}
