import { useState } from 'react';
import { isOverdue } from '../lib/tasks.js';

function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const LABEL = { high: 'High', medium: 'Medium', low: 'Low' };

export default function TaskItem({ task, today, onToggle, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task);
  const [error, setError] = useState('');
  const overdue = isOverdue(task, today);

  function startEdit() { setDraft(task); setEditing(true); setOpen(true); setError(''); }
  function save(e) {
    e.preventDefault();
    const errors = onUpdate(task.id, {
      title: draft.title, notes: draft.notes, priority: draft.priority, dueDate: draft.dueDate,
    });
    const first = Object.values(errors)[0];
    if (first) { setError(first); return; }
    setEditing(false);
  }
  function remove() {
    if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id);
  }

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  return (
    <li className={`task p-${task.priority} ${task.completed ? 'done' : ''}`}>
      <div className="task-main">
        <input
          type="checkbox"
          className="check"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        />
        <button className="task-title" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className="title-text">{task.title}</span>
          <span className="meta">
            <span className={`chip chip-${task.priority}`}>{LABEL[task.priority]}</span>
            {task.dueDate && (
              <span className={`due ${overdue ? 'late' : ''}`}>
                {overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}
              </span>
            )}
            {task.notes && <span className="has-note" title="Has a note">📝 Note</span>}
          </span>
        </button>
        <div className="actions">
          <button className="icon" onClick={startEdit} aria-label={`Edit "${task.title}"`}>Edit</button>
          <button className="icon danger" onClick={remove} aria-label={`Delete "${task.title}"`}>Delete</button>
        </div>
      </div>

      {open && !editing && (
        <div className="task-notes">
          {task.notes
            ? <p className="note-body">{task.notes}</p>
            : <p className="note-empty">No note yet. <button className="link" onClick={startEdit}>Add one</button></p>}
        </div>
      )}

      {editing && (
        <form className="edit-form" onSubmit={save} noValidate>
          <label className="field block">
            <span>Title</span>
            <input value={draft.title} onChange={set('title')} maxLength={120} autoFocus />
          </label>
          <label className="field block">
            <span>Note</span>
            <textarea value={draft.notes} onChange={set('notes')} rows={4} />
          </label>
          <div className="add-row">
            <label className="field">
              <span>Priority</span>
              <select value={draft.priority} onChange={set('priority')}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field">
              <span>Due</span>
              <input type="date" value={draft.dueDate} onChange={set('dueDate')} />
            </label>
            <button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="primary">Save changes</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </li>
  );
}
