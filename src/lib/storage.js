const KEY = 'jotlist:v1';

export function loadState(store = globalThis.localStorage) {
  try {
    const raw = store?.getItem(KEY);
    if (!raw) return { tasks: [], theme: null };
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : null,
    };
  } catch {
    return { tasks: [], theme: null };
  }
}

export function saveState(state, store = globalThis.localStorage) {
  try {
    store?.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export const STORAGE_KEY = KEY;
