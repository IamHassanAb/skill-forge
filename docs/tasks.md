# Situo Frontend — Refactoring Tasks

Each task below is a self-contained prompt for a coding agent. Execute in priority order. Each task is independent and won't conflict with others.

---

## P0 — Critical Hygiene

### Task 1: Fix hardcoded hex colors → CSS variables

- [x] Scan all `.jsx` files in `src/` for hardcoded hex color values used in Tailwind arbitrary value classes (e.g. `bg-[#110D0B]`, `text-[#EDE6DC]`, `border-[#2A1E16]`).
- [x] Replace each with its corresponding CSS variable form using the project's design tokens defined in `src/index.css`:
  - `#110D0B` → `var(--bg)`
  - `#1C1410` → `var(--s1)`
  - `#241912` → `var(--s2)`
  - `#2A1E16` → `var(--border)`
  - `#3D2820` → `var(--border2)`
  - `#EDE6DC` → `var(--t1)`
  - `#A89880` → `var(--t2)`
  - `#8C7060` → `var(--t3)`
  - `#7A6252` → `var(--t4)`
- [x] Do **not** replace `#C2624A` (terracotta) or `#C9912A` (amber) — these are fixed brand colors and are fine as-is or via Tailwind token `bg-terracotta` / `text-amber-score`.
- [x] Verify no visual regressions by running `npm run dev` and checking at least the onboarding, session, and feedback screens.

---

### Task 2: Remove dead code and console.logs from `useGroq.js`

- [x] Open `src/hooks/useGroq.js`.
- [x] Remove all `console.log(...)` statements (lines containing `"PROCESSED MESSAGES FOR GROQ"` and `"GROQ RESPONSE"`).
- [x] Remove the unused `updatedHistory` variable (lines 29–31) — it is computed but never read.
- [x] The `conversationHistory` snapshot update on line 36 and the `sendMessage` return flow must remain untouched.
- [x] Confirm the hook still exports `{ sendMessage, isLoading, resetConversation, conversationHistory }`.

---

### Task 3: Extract `parseGroqJSON` utility

- [x] Create a new file `src/utils/parseGroqJSON.js`.
- [x] Move the repeated JSON-cleaning logic (strip `` ```json `` fences, trim, `JSON.parse`, catch) into a single exported function:
  ```js
  export default function parseGroqJSON(text) {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try { return JSON.parse(clean); }
    catch { console.error('Failed to parse Groq JSON:', text); return null; }
  }
  ```
- [ ] Replace all inline instances of this pattern in:
  - `src/App.jsx` (`parseFeedbackResponse`, `handleSparkContinue`)
  - `src/components/onboarding/OnboardingFlow.jsx` (`generateDiagnostic`, `generateStudyPlan`)
- [ ] Each call site should now do: `const parsed = parseGroqJSON(response);` and then null-check the result.
- [ ] Do **not** change any component's external API or props.

---

## P1 — Developer Experience

### Task 4: Move API base URL to environment variable

- [x] Create or update `.env.example` at the project root to include: `VITE_API_BASE_URL=http://localhost:8000`
- [x] In `src/hooks/useGroq.js`, replace the hardcoded `'http://localhost:8000/api/chat'` with `` `${import.meta.env.VITE_API_BASE_URL}/api/chat` ``.
- [x] Search for any other hardcoded `localhost:8000` references in `src/` (e.g. `App.jsx` audio analysis endpoint) and replace them the same way.
- [x] Add `VITE_API_BASE_URL` to any existing `.env` or `.env.local` file with the default value `http://localhost:8000`.
- [ ] Verify the app still connects to the backend by running `npm run dev`.

---

### Task 5: Add path aliases to `vite.config.js`

- [x] Open `vite.config.js` and add the following `resolve.alias` configuration:
  ```js
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@data': path.resolve(__dirname, './src/data'),
        '@utils': path.resolve(__dirname, './src/utils'),
      }
    }
  })
  ```
- [ ] Do **not** update any existing imports yet — this task only configures the aliases so they are available for future code. Migrating existing imports can be done as a follow-up.

---

### Task 6: Clean up `tailwind.config.js` (remove unused tokens)

- [ ] Open `tailwind.config.js`.
- [ ] Remove the following color tokens that are not used anywhere in the codebase and conflict with the design system:
  - `accent: '#c8f135'`
  - `surface: '#111111'`
  - `card: '#1a1a1a'`
  - `border: '#2a2a2a'` (conflicts with the semantic `s-border` token)
- [ ] Before removing each token, grep `src/` to confirm it has zero usages.
- [ ] Keep all `s-*`, `light-*`, `terracotta*`, and `amber-score` tokens.
- [ ] Run `npm run build` to confirm no Tailwind class resolution errors.

---

### Task 7: Remove unnecessary `import React` statements

- [ ] Scan all `.jsx` files in `src/` for `import React from 'react'` or `import React, { ... } from 'react'`.
- [ ] Since Vite uses `@vitejs/plugin-react` which enables the automatic JSX runtime, the default `React` import is not needed unless `React` is directly referenced in the code (e.g. `React.lazy`, `React.memo`, `React.createElement`).
- [ ] Remove the `React` import where it is not directly used. Keep named imports like `{ useState, useCallback, memo }`.
- [ ] Example: `import React, { useState } from 'react'` → `import { useState } from 'react'`
- [ ] Verify the app still renders by running `npm run dev`.

---

## P2 — Polish & Accessibility

### Task 8: Move inline keyframes to `tailwind.config.js`

- [ ] Search all `.jsx` and `.css` files in `src/` for inline `@keyframes` or inline `style={{ animation: ... }}` definitions.
- [ ] Move any discovered keyframes into the `theme.extend.keyframes` section of `tailwind.config.js` and register corresponding entries in `theme.extend.animation`.
- [ ] Update the components to use the new Tailwind `animate-*` class instead of inline styles.
- [ ] Do not modify keyframes that are already in `tailwind.config.js` (`fadeIn`, `badgePulse`, `typeIndicator`).

---

### Task 9: Add `aria-label` to icon buttons and form inputs

- [ ] Search all `.jsx` files in `src/` for `<button>` elements that contain only an icon (e.g. SVG, `<span className="material-symbols-outlined">`, or emoji) and no visible text.
- [ ] Add a descriptive `aria-label` attribute to each. Examples:
  - A close button → `aria-label="Close"`
  - A settings gear icon → `aria-label="Settings"`
  - A play/stop button → `aria-label="Play recording"` / `aria-label="Stop recording"`
- [ ] Search for `<textarea>` and `<input>` elements and ensure each has either a visible `<label>` with `htmlFor`, or an `aria-label` attribute.
- [ ] Do not add `aria-label` to buttons that already have visible text content.

---

### Task 10: Add `role="status"` to loading states

- [ ] Search all `.jsx` files in `src/` for loading indicators — look for patterns like `animate-spin`, `animate-pulse`, `animate-bounce`, "Loading", "Generating", or conditional rendering gated by `isLoading`.
- [ ] Wrap each loading indicator's container element with `role="status"` and `aria-live="polite"`.
- [ ] If the loading indicator already has these attributes, skip it.
- [ ] Example: `<div className="animate-spin ...">` → `<div role="status" aria-live="polite" className="animate-spin ...">`

---

## P3 — Architecture

### Task 11: Extract `useSession` and `useFeedback` hooks from `App.jsx`

- [ ] Open `src/App.jsx` and identify the two logical state groups:
  1. **Session state**: `sessionState`, `handleSparkContinue`, `handleLearnContinue`, `handleContinue`, `handleGoToPractice`, `buildSidebarStages` and related logic.
  2. **Feedback state**: `feedbackState`, `parseFeedbackResponse`, `handleWrittenSubmit`, `handleSpokenSubmit`, `handleRequestReview` and related logic.
- [ ] Extract each group into its own custom hook: `src/hooks/useSession.js` and `src/hooks/useFeedback.js`.
- [ ] Each hook should accept the dependencies it needs as arguments (e.g. `useFeedback` needs `sendMessage`, `sessionState`).
- [ ] `App.jsx` should import and call both hooks, passing the returned values to child components exactly as before.
- [ ] Verify the app flow still works: Onboarding → Spark → Learn → Practice → Feedback → Continue.

---

### Task 12: Move AI prompt templates to `src/prompts/`

- [ ] Create a new directory `src/prompts/`.
- [ ] Search `src/` for all template literal strings that are sent to `sendMessage(...)` as prompts. These are found in:
  - `App.jsx` — lesson generation prompt, written feedback prompt, spoken feedback prompt.
  - `OnboardingFlow.jsx` — diagnostic prompt, study plan prompt.
- [ ] Extract each into a named export function in a relevant file, e.g.:
  - `src/prompts/lessonPrompts.js` → `export function buildLessonPrompt(content) { ... }`
  - `src/prompts/feedbackPrompts.js` → `export function buildWrittenFeedbackPrompt(practicePrompt, userResponse) { ... }`
  - `src/prompts/onboardingPrompts.js` → `export function buildDiagnosticPrompt(text) { ... }`
- [ ] Each function takes the dynamic variables as arguments and returns the full prompt string.
- [ ] Update all call sites to use the new prompt functions.
- [ ] Do **not** change the actual prompt text content — only relocate it.

---

### Task 13: Add `React.lazy` + `Suspense` for screen components

- [ ] In `src/App.jsx`, change the static imports of heavy screen components to lazy imports:
  ```js
  const FeedbackLayout = lazy(() => import('./components/feedback/FeedbackLayout'))
  const ReaderPanel = lazy(() => import('./components/reader/ReaderPanel'))
  const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow'))
  ```
- [ ] Wrap the usage of each lazy component in `<Suspense>` with a minimal fallback:
  ```jsx
  <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
    <FeedbackLayout ... />
  </Suspense>
  ```
- [ ] Keep `SessionLayout`, `Sidebar`, and small leaf components as static imports.
- [ ] Verify that navigating between screens still works without errors.

---

### Task 14: Wrap presentational components in `memo`

- [ ] Identify pure presentational components that receive stable props and do not manage internal state. Good candidates:
  - `SparkCard`, `LearnCard`, `Sidebar` stage rows, `FeedbackLayout` sub-cards.
- [ ] Wrap each with `memo`:
  ```jsx
  import { memo } from 'react'
  const SparkCard = memo(function SparkCard({ title, source, ... }) { ... })
  export default SparkCard
  ```
- [ ] Do **not** wrap components that receive new object/array/function props on every render — this defeats the purpose of `memo`.
- [ ] Do **not** wrap components that already manage significant internal state (e.g. `WrittenPractice`, `AudioRecorder`).

---

## P4 — Resilience & Scale

### Task 15: Add error boundaries around screen sections

- [ ] Create a reusable `src/components/shared/ErrorBoundary.jsx` component using a class component (error boundaries require `componentDidCatch`).
- [ ] The fallback UI should show a styled card with the message "Something went wrong" and a "Try again" button that calls `this.setState({ hasError: false })`.
- [ ] Style the fallback using the project's design tokens (`var(--bg)`, `var(--s1)`, `var(--t1)`, `terracotta`).
- [ ] Wrap the following sections in `App.jsx` with `<ErrorBoundary>`:
  - The onboarding screen
  - The session content area
  - The feedback screen
- [ ] Verify that throwing an error inside a wrapped component shows the fallback instead of a white screen.

---

### Task 16: Add `AbortController` to `useGroq`

- [ ] Open `src/hooks/useGroq.js`.
- [ ] Create an `AbortController` inside `sendMessage` before the `fetch` call.
- [ ] Pass `signal: controller.signal` to the `fetch` options.
- [ ] Add a 15-second timeout using `setTimeout(() => controller.abort(), 15000)`.
- [ ] In the `catch` block, check for `error.name === 'AbortError'` and return a distinct error or null.
- [ ] Clear the timeout in a `finally` block.
- [ ] Optionally, store the controller in a `useRef` so that calling `resetConversation` or unmounting also aborts any in-flight request.

---

### Task 17: Refactor `App.jsx` state to `useReducer`

- [ ] Open `src/App.jsx` and identify all `useState` calls: `screen`, `onboardingData`, `sessionState`, `feedbackState`, `isReaderOpen`, `confidenceLevel`.
- [ ] Define a reducer function that manages all of these as a single state object with typed actions:
  ```js
  const initialState = {
    screen: 'onboarding',
    onboardingData: null,
    session: { ... },
    feedback: { ... },
    isReaderOpen: false,
    confidenceLevel: 'Low'
  }

  function appReducer(state, action) {
    switch (action.type) {
      case 'ONBOARDING_COMPLETE': ...
      case 'SET_SCREEN': ...
      case 'UPDATE_SESSION': ...
      case 'SET_FEEDBACK': ...
      case 'TOGGLE_READER': ...
      case 'SET_CONFIDENCE': ...
      default: return state
    }
  }
  ```
- [ ] Replace all `useState` + `setX` calls with `dispatch({ type: '...', payload: ... })`.
- [ ] Keep `useGroq` as a separate hook — it manages its own internal state.
- [ ] Verify all screen transitions and state updates still work correctly.
