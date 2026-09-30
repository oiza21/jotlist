const STATUSES = [
  ['all', 'All'],
  ['active', 'To do'],
  ['done', 'Done'],
  ['overdue', 'Overdue'],
];

export default function Toolbar({ filters, setFilters, sortBy, setSortBy, stats, onClearDone }) {
  const set = (key, value) => setFilters({ ...filters, [key]: value });
  const counts = { all: stats.total, active: stats.active, done: stats.done, overdue: stats.overdue };

  return (
    <div className="toolbar">
      <input
        type="search"
        className="search"
        placeholder="Search tasks and notes"
        value={filters.query}
        onChange={(e) => set('query', e.target.value)}
        aria-label="Search tasks and notes"
      />
      <div className="tabs" role="group" aria-label="Filter by status">
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            className={`tab ${filters.status === value ? 'active' : ''}`}
            aria-pressed={filters.status === value}
            onClick={() => set('status', value)}
          >
            {label} <span className="count">{counts[value]}</span>
          </button>
        ))}
      </div>
      <div className="toolbar-row">
        <label className="field inline">
          <span>Priority</span>
          <select value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="all">Any</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="field inline">
          <span>Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created">Newest</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <button className="link" onClick={onClearDone} disabled={!stats.done}>Clear completed</button>
      </div>
    </div>
  );
}
