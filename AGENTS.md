# AGENTS.md — Jotlist

Rules for any AI coding agent working on this repository. Read this file before making changes, and follow it in every session.

## Project summary

Jotlist is a to-do list web app with notes, priorities, due dates, search/filter, sorting, progress tracking and dark mode. It is a React + Vite single-page app. Data is saved in the browser with localStorage. It is deployed on Vercel.

## Tech stack

- React 18 (function components and hooks only, no class components)
- Vite 5 for dev server and build
- Vitest for tests
- Plain CSS in `src/styles.css` with CSS custom properties (no CSS frameworks)
- No backend and no database at this stage

## Project structure

```
src/
  lib/tasks.js       pure task logic (create, update, toggle, delete, filter, sort, summarize)
  lib/storage.js     load/save to localStorage
  components/        UI components (TaskForm, TaskItem, Toolbar)
  App.jsx            app state and wiring
  styles.css         all styles and theme tokens
tests/               Vitest tests, one file per lib module
```

## Coding rules

1. Keep business logic in `src/lib/` as pure functions. Components call these functions; they never duplicate the logic.
2. Lib functions never mutate their inputs. They return a new list plus an `errors` object.
3. Validate all user input with `validateTask` before saving. Show errors in plain words that tell the user how to fix the problem.
4. Name files in PascalCase for components (`TaskItem.jsx`) and camelCase for modules (`tasks.js`). Name functions with verbs (`createTask`, `filterTasks`).
5. Use colors only through the CSS variables in `:root`. Every new color needs a dark-mode value too.
6. Every interactive element must work with a keyboard and have an accessible label.
7. Wrap every localStorage access in try/catch. The app must still load if storage is empty, full or corrupted.
8. Do not add new dependencies without a clear reason. Prefer a few lines of code over a library.
9. Keep UI text in sentence case, short and in plain language. Buttons say exactly what they do ("Add task", "Save changes").

## Testing and validation rules (required)

1. Write tests for every function you create or change in `src/lib/`. Cover the success case, invalid input, and "not found" cases.
2. If you add an API endpoint (for example a serverless function in `/api`), write tests for every endpoint you create and always validate that the endpoint works: correct status codes, correct response body, and error handling for bad input.
3. Run `npm test` after every change. All tests must pass before you say a task is finished.
4. Run `npm run build` before committing. The build must succeed with no errors.
5. Never delete or weaken an existing test to make it pass. Fix the code instead.
6. After deploying, check the live URL: add, edit, complete and delete a task; add and edit a note; test search, filters, sort and dark mode; reload the page and confirm the data is still there.

## Workflow

1. Make small, focused changes. One feature or fix at a time.
2. Explain what you changed and why in plain language.
3. Commit with a short, clear message in the present tense, e.g. `Add due date sorting`.
4. Never commit secrets, API keys or `.env` files.

## Commands

- `npm install` — install dependencies
- `npm run dev` — run locally at http://localhost:5173
- `npm test` — run all tests
- `npm run build` — production build into `dist/`
