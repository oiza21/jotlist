import { describe, it, expect } from 'vitest';
import {
  validateTask, createTask, updateTask, toggleTask, deleteTask, clearCompleted,
  filterTasks, sortTasks, summarize, isOverdue, todayString,
} from '../src/lib/tasks.js';

const NOW = new Date('2026-09-30T10:00:00Z');
const seed = () => {
  let list = [];
  list = createTask(list, { title: 'Buy milk', priority: 'low', dueDate: '2026-09-28' }, new Date('2026-09-29T09:00:00Z')).tasks;
  list = createTask(list, { title: 'Submit HNG task', priority: 'high', dueDate: '2026-10-01', notes: 'Use the Zedu form' }, new Date('2026-09-29T10:00:00Z')).tasks;
  list = createTask(list, { title: 'Read chapter 3', priority: 'medium' }, new Date('2026-09-29T11:00:00Z')).tasks;
  return list;
};

describe('validateTask', () => {
  it('accepts a valid task', () => {
    expect(validateTask({ title: 'Hi', priority: 'high', dueDate: '2026-10-01', notes: '' }).valid).toBe(true);
  });
  it('rejects an empty or whitespace title', () => {
    expect(validateTask({ title: '   ' }).errors.title).toBeDefined();
    expect(validateTask({}).valid).toBe(false);
  });
  it('rejects titles over 120 characters', () => {
    expect(validateTask({ title: 'x'.repeat(121) }).valid).toBe(false);
  });
  it('rejects unknown priorities and bad dates', () => {
    const r = validateTask({ title: 'ok', priority: 'urgent', dueDate: '01/10/2026' });
    expect(r.errors.priority).toBeDefined();
    expect(r.errors.dueDate).toBeDefined();
  });
});

describe('createTask', () => {
  it('adds a task with defaults and trimmed fields', () => {
    const { tasks, task } = createTask([], { title: '  Write AGENTS.md  ', notes: '  rules  ' }, NOW);
    expect(tasks).toHaveLength(1);
    expect(task).toMatchObject({ title: 'Write AGENTS.md', notes: 'rules', priority: 'medium', completed: false });
    expect(task.createdAt).toBe(NOW.toISOString());
    expect(task.id).toBeTruthy();
  });
  it('does not change the list when invalid', () => {
    const before = seed();
    const res = createTask(before, { title: '' });
    expect(res.tasks).toBe(before);
    expect(res.task).toBeNull();
  });
  it('gives every task a unique id', () => {
    const ids = seed().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('updateTask', () => {
  it('edits title, notes, priority and due date', () => {
    const list = seed();
    const id = list[0].id;
    const { tasks, task } = updateTask(list, id, { title: 'Read chapter 4', notes: 'pages 40-60', priority: 'high', dueDate: '2026-10-05' }, NOW);
    expect(task).toMatchObject({ title: 'Read chapter 4', notes: 'pages 40-60', priority: 'high', dueDate: '2026-10-05' });
    expect(task.updatedAt).toBe(NOW.toISOString());
    expect(tasks.find((t) => t.id === id).title).toBe('Read chapter 4');
  });
  it('keeps id and createdAt fixed', () => {
    const list = seed();
    const orig = list[0];
    const { task } = updateTask(list, orig.id, { id: 'hacked', createdAt: 'x' });
    expect(task.id).toBe(orig.id);
    expect(task.createdAt).toBe(orig.createdAt);
  });
  it('rejects invalid edits and unknown ids', () => {
    const list = seed();
    expect(updateTask(list, list[0].id, { title: '' }).task).toBeNull();
    expect(updateTask(list, 'missing', { title: 'x' }).errors.id).toBeDefined();
  });
});

describe('toggleTask / deleteTask / clearCompleted', () => {
  it('toggles completion both ways', () => {
    const list = seed();
    const id = list[1].id;
    const once = toggleTask(list, id).tasks;
    expect(once.find((t) => t.id === id).completed).toBe(true);
    expect(toggleTask(once, id).tasks.find((t) => t.id === id).completed).toBe(false);
  });
  it('deletes only the chosen task', () => {
    const list = seed();
    const { tasks } = deleteTask(list, list[0].id);
    expect(tasks).toHaveLength(2);
    expect(tasks.some((t) => t.id === list[0].id)).toBe(false);
    expect(deleteTask(list, 'missing').errors.id).toBeDefined();
  });
  it('clears completed tasks', () => {
    let list = seed();
    list = toggleTask(list, list[0].id).tasks;
    expect(clearCompleted(list)).toHaveLength(2);
  });
});

describe('filter, sort and summary', () => {
  const today = '2026-09-30';
  it('detects overdue tasks, but not completed ones', () => {
    const list = seed();
    const milk = list.find((t) => t.title === 'Buy milk');
    expect(isOverdue(milk, today)).toBe(true);
    expect(isOverdue({ ...milk, completed: true }, today)).toBe(false);
  });
  it('filters by status, priority and search text (including notes)', () => {
    let list = seed();
    list = toggleTask(list, list.find((t) => t.title === 'Read chapter 3').id).tasks;
    expect(filterTasks(list, { status: 'done' }, today)).toHaveLength(1);
    expect(filterTasks(list, { status: 'active' }, today)).toHaveLength(2);
    expect(filterTasks(list, { status: 'overdue' }, today)).toHaveLength(1);
    expect(filterTasks(list, { priority: 'high' }, today)[0].title).toBe('Submit HNG task');
    expect(filterTasks(list, { query: 'zedu' }, today)[0].title).toBe('Submit HNG task');
  });
  it('sorts by priority and due date, with completed tasks last', () => {
    let list = seed();
    expect(sortTasks(list, 'priority').map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
    expect(sortTasks(list, 'due').map((t) => t.title)).toEqual(['Buy milk', 'Submit HNG task', 'Read chapter 3']);
    list = toggleTask(list, list.find((t) => t.priority === 'high').id).tasks;
    expect(sortTasks(list, 'priority').at(-1).priority).toBe('high');
  });
  it('sorts newest first by default', () => {
    expect(sortTasks(seed()).map((t) => t.title)[0]).toBe('Read chapter 3');
  });
  it('summarizes counts', () => {
    expect(summarize(seed(), today)).toEqual({ total: 3, done: 0, active: 3, overdue: 1 });
  });
  it('formats today as YYYY-MM-DD', () => {
    expect(todayString(new Date(2026, 8, 5))).toBe('2026-09-05');
  });
});
