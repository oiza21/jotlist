import { useState } from 'react';

const blank = { title: '', notes: '', priority: 'medium', dueDate: '' };

export default function TaskForm({ onAdd }) {
  const [form, setForm] = useState(blank);
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const errors = onAdd(form);
    const first = Object.values(errors)[0];
    if (first) { setError(first); return; }
    setForm(blank); setShowNotes(false); setError('');
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form className="add-form" onSubmit={submit} noValidate>
      <label htmlFor="new-title" className="sr-only">New task</label>
      <input
        id="new-title"
        className="title-input"
        placeholder="What needs doing?"
        value={form.title}
        onChange={(e) => { set('title')(e); setError(''); }}
        maxLength={120}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'add-error' : undefined}
      />
      <div className="add-row">
        <label className="field">
          <span>Priority</span>
          <select value={form.priority} onChange={set('priority')}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="field">
          <span>Due</span>
          <input type="date" value={form.dueDate} onChange={set('dueDate')} />
        </label>
        <button type="button" className="ghost" onClick={() => setShowNotes(!showNotes)} aria-expanded={showNotes}>
          {showNotes ? 'Hide note' : '+ Add a note'}
        </button>
        <button type="submit" className="primary">Add task</button>
      </div>
      {showNotes && (
        <textarea
          className="notes-input"
          placeholder="Details, links, reminders…"
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          aria-label="Note for new task"
        />
      )}
      {error && <p id="add-error" className="error">{error}</p>}
    </form>
  );
}
