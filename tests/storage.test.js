import { describe, it, expect } from 'vitest';
import { loadState, saveState, STORAGE_KEY } from '../src/lib/storage.js';

function memoryStore() {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    data,
  };
}

describe('storage', () => {
  it('returns empty state when nothing is saved', () => {
    expect(loadState(memoryStore())).toEqual({ tasks: [], theme: null });
  });
  it('saves and loads tasks and theme', () => {
    const store = memoryStore();
    const state = { tasks: [{ id: '1', title: 'x' }], theme: 'dark' };
    expect(saveState(state, store)).toBe(true);
    expect(loadState(store)).toEqual(state);
  });
  it('survives corrupted data', () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEY, '{not json');
    expect(loadState(store)).toEqual({ tasks: [], theme: null });
  });
  it('ignores invalid theme values', () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ tasks: [], theme: 'purple' }));
    expect(loadState(store).theme).toBeNull();
  });
  it('reports failure when storage throws', () => {
    const broken = { setItem: () => { throw new Error('full'); }, getItem: () => { throw new Error('no'); } };
    expect(saveState({ tasks: [] }, broken)).toBe(false);
    expect(loadState(broken)).toEqual({ tasks: [], theme: null });
  });
});
