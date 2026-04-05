# Frontend Best Practices Plan — React + Vite + Tailwind CSS v3

> Generated from a full audit of the Situo `src/` directory against the project's own skill references (`.claude/frontend-skill/`) and industry-standard React/Vite/Tailwind patterns. This plan is **generic** — every guideline applies uniformly across all components.

---

## 1. Current Architecture Summary

| Layer | Pattern in use | Status |
|---|---|---|
| **State machine** | `screen` + `sessionStep` string state in `App.jsx` | Functional but monolithic |
| **State management** | `useState` + prop drilling; `ThemeContext` for theme | Minimal context usage |
| **AI integration** | `useGroq` hook → FastAPI proxy → Groq | Working, some dead-code paths |
| **Styling** | Tailwind v3 + CSS custom properties in `index.css` | Partially consistent |
| **Build** | Vite 5, no path aliases, no code splitting | Basic config |
| **Component design** | Functional components, no `memo`, no lazy loading | No performance optimizations |

---

## 2. Anti-Patterns Found in the Codebase

### 2.1 God Component — `App.jsx` (437 lines)

**Problem:** `App.jsx` owns all application state (onboarding, session, feedback, reader, confidence), all handler logic (8+ async handlers including full AI prompt construction and JSON parsing), and all screen rendering. This violates *single responsibility* and makes the file the bottleneck for every change.

**What breaks at scale:**
- Every state change re-renders the entire tree (no isolation).
- AI prompt templates are buried inside event handlers — impossible to test, version, or reuse.
- Adding a new screen means touching 3+ sections of the same file.

**Guideline:**
- Extract stateful logic into custom hooks by domain: `useSession`, `useOnboarding`, `useFeedback`.
- Move AI prompt templates into a dedicated `src/prompts/` or `src/data/prompts.js` module.
- Keep `App.jsx` as a thin orchestrator: read hook state, render the correct screen.

---

### 2.2 Hardcoded Colors Bypassing the Design System

**Problem:** Several components use raw hex values instead of CSS variables:
- `App.jsx:326` — `bg-[#110D0B] text-[#EDE6DC]` instead of `bg-[var(--bg)] text-[var(--t1)]`
- `Sidebar.jsx:43` — `bg-[#2A1E16]` instead of `bg-[var(--border)]`
- `StepFocusAreas.jsx:45` — `text-[#A89880]` instead of `text-[var(--t2)]`
- `StepFocusAreas.jsx:57` — `border-[#55423e]`, `text-[#dbc1ba]` — colors not in the design system at all
- `AudioRecorder.jsx:297` — `bg-[#2A1E16]` instead of `bg-[var(--border)]`
- `SparkCard.jsx:7,36` — `bg-[rgba(194,98,74,0.06)]` inline instead of using `bg-terracotta/5` or a CSS variable

**What breaks at scale:** Light/dark theme switching produces inconsistent surfaces. Adding a third theme requires hunting every raw hex.

**Guideline:**
- **Never use raw hex for surface/text colors.** Always use `var(--bg)`, `var(--s1)`, `var(--t1)`, etc.
- For terracotta opacity variants, use Tailwind's built-in opacity syntax: `bg-terracotta/5`, `bg-terracotta/10`, `border-terracotta/20`.
- Run a periodic grep for `#[0-9a-fA-F]` in JSX files to catch regressions.

---

### 2.3 Duplicated JSON Parsing Logic

**Problem:** The pattern `response.replace(/```json/g, '').replace(/```/g, '').trim()` followed by `JSON.parse()` appears in 4 separate locations:
- `App.jsx:79` (`parseFeedbackResponse`)
- `App.jsx:150` (`handleSparkContinue`)
- `OnboardingFlow.jsx:37` (`generateDiagnostic`)
- `OnboardingFlow.jsx:58` (`generateStudyPlan`)

**What breaks at scale:** When the Groq response format changes (e.g., new fence syntax), you must find and update every copy. Bugs in one copy won't be fixed in others.

**Guideline:**
- Extract a single `parseGroqJSON(text)` utility function (the skill file already documents the pattern).
- Place it in `src/utils/parseGroqJSON.js` and import everywhere.
- All Groq JSON parsing flows through one function.

---

### 2.4 Hardcoded API URLs

**Problem:** API base URL `http://localhost:8000` is hardcoded in multiple files:
- `useGroq.js:59`
- `AudioRecorder.jsx:65`
- `App.jsx:234`

**What breaks at scale:** Deploying to staging/production requires find-and-replace across the codebase.

**Guideline:**
- Define the base URL in a Vite env variable: `VITE_API_URL=http://localhost:8000` in `.env.local`.
- Access via `import.meta.env.VITE_API_URL` or create a thin `src/utils/api.js` that exports a configured `fetch` wrapper.

---

### 2.5 No Path Aliases in Vite Config

**Problem:** All imports use relative paths (`../../hooks/useGroq`, `../../context/ThemeContext`). Deeply nested components produce fragile, hard-to-read import chains.

**What breaks at scale:** Moving a file breaks every relative import that references it. Refactoring folder structure becomes painful.

**Guideline:**
- Add aliases in `vite.config.js`: `@` → `src/`, `@components`, `@hooks`, `@data`, `@utils`.
- Refactor imports incrementally as you touch each file.

---

### 2.6 No Code Splitting / Lazy Loading

**Problem:** Every component is eagerly imported in `App.jsx` — all 12 component imports load on initial page load, including heavy screens the user hasn't reached yet (FeedbackLayout, AudioRecorder, ReaderPanel).

**What breaks at scale:** Bundle size grows linearly with every new feature. Initial load becomes slow.

**Guideline:**
- Lazy-load screen-level components (`FeedbackLayout`, `ReaderPanel`, `OnboardingFlow`) using `React.lazy()` + `<Suspense>`.
- Keep shared/small components (Sidebar, TopBar, ConfidenceBadge) eagerly loaded.

---

### 2.7 No `memo` on Pure Presentational Components

**Problem:** None of the presentational components (`SparkCard`, `LearnCard`, `ContentFeedback`, `OverallCard`, `DeliveryNotice`) use `React.memo()`. Since `App.jsx` holds all state, any state change re-renders every visible component.

**What breaks at scale:** As the component tree deepens, unnecessary re-renders compound. Feedback screens with multiple cards and grids become visibly sluggish.

**Guideline:**
- Wrap pure presentational components (props in → JSX out, no internal state) with `memo()`.
- Skip `memo` on components that always receive new object/array props on every render (it would be useless).
- Use `useCallback` for handler props passed to memoized children.

---

### 2.8 Inline Anonymous Functions Creating New References

**Problem:** Several components create new function references on every render in JSX:
- `App.jsx:346` — `onClose={() => setIsReaderOpen(false)}`
- `StepFocusAreas.jsx:56` — `onClick={() => toggleArea(area)}` inside a `.map()`
- `WrittenPractice.jsx:39` — `onClick={() => onSubmit(text)}`
- `Sidebar.jsx:92` — inline onClick for theme toggle

**What breaks at scale:** When combined with `memo` on children, inline functions defeat memoization. In lists (`.map()`), every item gets a brand-new handler on every render.

**Guideline:**
- For simple callbacks outside loops, use `useCallback` if the child is memoized.
- For callbacks inside `.map()`, use the `data-*` attribute pattern or extract a sub-component that receives the item and the handler.

---

### 2.9 Dead / Misleading Code in `useGroq.js`

**Problem:**
- Lines 29–31: `updatedHistory` is computed but never used — identical logic in both branches of the ternary.
- `conversationHistory` is captured via closure at call time, not via the state updater, meaning concurrent calls could lose messages.
- `console.log("PROCESSED MESSAGES FOR GROQ:", messages)` left in production code.

**What breaks at scale:** Stale closures cause silent data loss. Dead code confuses contributors.

**Guideline:**
- Remove dead code and debug logs before merging.
- Use the functional form of `setState` (e.g., `setConversationHistory(prev => [...prev, newUserTurn])`) when the new state depends on the previous state — this is already partially done but inconsistent.

---

### 2.10 Missing Accessibility Basics

**Problem:**
- Textareas lack `aria-label` or associated `<label>` (`WrittenPractice.jsx:25`).
- Icon-only buttons lack `aria-label` (`AudioRecorder.jsx` play/pause/stop, `Sidebar.jsx` settings).
- Loading states don't use `role="status"` or `aria-live` (`StepLoading`, `DiagnosticLoading`).
- No focus management after screen transitions.

**What breaks at scale:** Screen readers can't navigate the app. Fails WCAG 2.1 AA.

**Guideline:**
- Every `<button>` with only an icon must have `aria-label`.
- Every form input must have a visible `<label>` or `aria-label`.
- Loading/progress indicators must use `role="status" aria-live="polite"`.
- After screen transitions, programmatically focus the new screen's heading via `useEffect` + `ref.focus()`.

---

### 2.11 Inline `<style>` Tags in JSX

**Problem:** `AudioRecorder.jsx:229-234` injects a `<style>` block with `@keyframes waveBar` directly in JSX. This runs on every render, pollutes the document head, and bypasses the Tailwind/CSS pipeline.

**What breaks at scale:** Duplicate style tags accumulate if the component mounts/unmounts. No tree-shaking or minification.

**Guideline:**
- Move custom keyframes into `tailwind.config.js` under `theme.extend.keyframes` (the config already has `fadeIn`, `badgePulse`, etc.).
- Reference via Tailwind's `animate-*` utility.

---

### 2.12 Tailwind Config Contains Unused / Conflicting Tokens

**Problem:** `tailwind.config.js` defines two sets of color tokens:
1. Situo design system: `terracotta`, `s-bg`, `s-1`, `s-2`, etc.
2. Generic leftover tokens: `accent: '#c8f135'`, `surface: '#111111'`, `card: '#1a1a1a'`, `border: '#2a2a2a'`

The generic tokens conflict with the design system (e.g., `border` maps to `#2a2a2a` in Tailwind config but `#2A1E16` in CSS variables). Meanwhile, the `s-*` Tailwind tokens are never used — the codebase uses CSS variables directly.

**What breaks at scale:** Developers pick the wrong token. `bg-border` resolves to the Tailwind config value, not the CSS variable.

**Guideline:**
- Remove unused color tokens (`accent`, `surface`, `card`, `border` generic, `s-*` tokens).
- Keep only `terracotta`, `terracotta-dim`, `terracotta-border`, `amber-score`, and the light-theme tokens if still needed.
- For surface/text/border colors, the CSS variable approach (`bg-[var(--bg)]`) is correct — don't duplicate them as Tailwind tokens.

---

### 2.13 Unused React Import

**Problem:** Most component files import `React` at the top (`import React from 'react'`). Since React 17+ with the new JSX transform (which Vite uses by default), this import is unnecessary.

**What breaks at scale:** Nothing critical, but it's noise in every file and signals unfamiliarity with the toolchain.

**Guideline:**
- Remove `import React from 'react'` unless you explicitly use `React.memo`, `React.lazy`, `React.createElement`, etc. — in those cases, import only what you need: `import { memo } from 'react'`.

---

## 3. Common Anti-Patterns to Watch For (Not Yet Present, But Will Appear at Scale)

### 3.1 Prop Drilling Beyond 2 Levels

**Current state:** Props flow App → SessionLayout → SparkCard (2 levels), which is fine. But as intermediate layout components grow, drilling will become painful.

**Guideline:** When props pass through 3+ levels without being used by intermediate components, introduce a focused Context (e.g., `SessionContext`) rather than threading props through wrappers.

---

### 3.2 `useEffect` for Derived State

**Current state:** Not widespread, but `OnboardingFlow.jsx:24-28` uses `useEffect` to synchronize two boolean flags into a step transition — this is a derived state pattern trying to be an effect.

**Guideline:** Prefer computing derived values inline. If two async conditions must be met, consider a reducer or derived check in the handler rather than synchronizing via effect.

---

### 3.3 String-Based State Machines Without Exhaustive Handling

**Current state:** `screen` is a plain string (`'onboarding' | 'session' | 'feedback'`). `sessionStep` is another (`'spark' | 'learn' | 'practice'`). The switch/if-else chains don't have default/exhaustive handling.

**Guideline:** Use a `switch` with an explicit `default` that throws or logs an error for unexpected states. Consider `useReducer` if the state machine grows beyond 3 states with complex transitions (e.g., adding a `'review'` screen).

---

### 3.4 Unbounded Re-renders from Object/Array Props

**Current state:** `buildSidebarStages()` in `App.jsx` returns a new array on every call. If `Sidebar` were wrapped in `memo`, it would still re-render because the `stages` prop is a new reference every time.

**Guideline:** When memoizing components, also memoize the data you pass to them. Use `useMemo` for computed arrays/objects passed as props.

---

### 3.5 No Error Boundaries

**Current state:** No error boundaries exist. A JSON parse failure in any component crashes the whole app.

**Guideline:** Add error boundaries around each major screen section (OnboardingFlow, SessionLayout+children, FeedbackLayout). The skill reference already provides a `FeedbackErrorBoundary` template.

---

### 3.6 No AbortController for API Calls

**Current state:** `useGroq.js` has no request cancellation. If a user navigates away during an API call, the response still arrives and calls `setState` on an unmounted component.

**Guideline:** Use `AbortController` in `useGroq` and pass the signal to `fetch`. Abort in the cleanup function of `useEffect` or when the component unmounts.

---

## 4. Refactoring Priority Order

Apply these in order — each step is safe to do independently and won't conflict with others.

| Priority | Action | Impact | Effort |
|---|---|---|---|
| **P0** | Fix hardcoded hex colors → CSS variables | Theme consistency | Low |
| **P0** | Remove dead code + console.logs from `useGroq.js` | Code hygiene | Low |
| **P0** | Extract `parseGroqJSON` utility | DRY, testability | Low |
| **P1** | Move API base URL to env variable | Deployment readiness | Low |
| **P1** | Add path aliases to `vite.config.js` | DX improvement | Low |
| **P1** | Clean up `tailwind.config.js` (remove unused tokens) | Clarity | Low |
| **P1** | Remove unnecessary `import React` | Noise reduction | Low |
| **P2** | Move inline keyframes to `tailwind.config.js` | Correctness | Low |
| **P2** | Add `aria-label` to icon buttons + form inputs | Accessibility | Medium |
| **P2** | Add `role="status"` to loading states | Accessibility | Low |
| **P3** | Extract hooks: `useSession`, `useFeedback` from `App.jsx` | Maintainability | Medium |
| **P3** | Move AI prompt templates to `src/prompts/` | Testability | Medium |
| **P3** | Add `React.lazy` + `Suspense` for screen components | Performance | Medium |
| **P3** | Wrap presentational components in `memo` | Performance | Medium |
| **P4** | Add error boundaries around screen sections | Resilience | Medium |
| **P4** | Add `AbortController` to `useGroq` | Correctness | Medium |
| **P4** | Refactor `App.jsx` state to `useReducer` | Scalability | High |

---

## 5. Rules for All Future Components

These apply to **every** component written or modified going forward:

1. **No raw hex** for surfaces, text, or borders — use CSS variables.
2. **One file, one concern** — if a component has both API logic and render logic, split them.
3. **Derive state** — compute from existing state before adding `useState`.
4. **Semantic HTML** — use `<button>`, `<nav>`, `<main>`, `<article>` before adding ARIA.
5. **Accessible by default** — `aria-label` on icon buttons, labels on inputs, `role="status"` on loading.
6. **No inline styles or `<style>` tags** — use Tailwind classes or extend the config.
7. **No hardcoded API URLs** — use env variables.
8. **No debug logs in committed code** — `console.log` calls should be removed before merge.
9. **Parse Groq JSON via the shared utility** — never inline the cleaning logic.
10. **Hooks ordering** — hooks first, derived values second, handlers third, JSX last.
