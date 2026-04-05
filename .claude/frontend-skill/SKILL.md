---
name: situo-frontend
description: >
  Expert React + Vite + Tailwind CSS v3 frontend development skill for the Situo project.
  Use this skill whenever the user asks to build, refactor, optimize, or review any
  frontend code in the Situo project. Triggers on: component creation, hook design,
  performance optimization, state management, accessibility, testing, build config,
  styling patterns, or any React/Vite/Tailwind question. Also triggers when the user
  shares a component and asks "is this good?", "how do I improve this?", "why is this
  slow?", or "how should I structure this?". Use proactively even for general frontend
  questions — this skill has the right context for Situo's stack and architecture.
---

# Situo Frontend Development Skill

React 18 + Vite 5 + Tailwind CSS v3. Warm dark design system. Chrome desktop only for MVP.

---

## Project Context

**Stack**: React 18, Vite 5, Tailwind CSS v3, FastAPI backend, Supabase (PostgreSQL + Auth + Storage), Groq (llama-4-scout), AssemblyAI.

**Design tokens** (always use these, never raw hex except terracotta/amber):
```css
--bg: #110D0B       --s1: #1C1410      --s2: #241912
--border: #2A1E16   --border2: #3D2820
--t1: #EDE6DC       --t2: #A89880      --t3: #8C7060  --t4: #7A6252
/* Fixed regardless of theme: */
terracotta: #C2624A    amber: #C9912A
```

**Fonts**: Lora/Newsreader (serif) for prompts, headings, italic accents. DM Sans/Manrope (sans) for all UI chrome.

**Component tree**:
```
App → OnboardingFlow (4 steps) | SessionLayout → SparkCard / LearnCard / WrittenPractice / AudioRecorder | FeedbackLayout → ContentFeedback / AcousticMetrics / DeliveryNotice / OverallCard
```

---

## Core Principles (apply to every response)

1. **One concern per component** — if a component does two things, split it
2. **Derive, don't duplicate state** — compute from existing state before adding new state
3. **Colocate state** — state lives at the lowest common ancestor that needs it
4. **CSS variables for theming** — never hard-code surface/text colors; use `var(--bg)` etc.
5. **Semantic HTML first** — use `<button>`, `<nav>`, `<main>`, `<article>` before adding ARIA
6. **No inline functions in JSX** if they cause re-renders — extract or memoize

---

## Component Patterns

### Functional component template
```jsx
// ✅ Correct pattern for Situo components
import { memo } from 'react'

const ComponentName = memo(function ComponentName({ prop1, prop2, onAction }) {
  // hooks first
  // derived values second
  // handlers third
  // return JSX last
  return (...)
})

export default ComponentName
```

### When to use memo
- Wrap with `memo` when: parent re-renders frequently AND component is pure AND props are stable
- Skip `memo` on: simple presentational components, components that always re-render anyway
- Never memo: components that receive new object/array props on every render (defeats the purpose)

### Custom hooks pattern
```jsx
// Extract stateful logic into hooks when:
// 1. Same logic used in 2+ components
// 2. Component file exceeds ~150 lines
// 3. Side effects need cleanup

function useGroqFeedback(submission, prompt) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const result = await postToGroq(submission, prompt)
      setData(result)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [submission, prompt])

  return { data, loading, error, fetchFeedback }
}
```

### Controlled vs Uncontrolled inputs
- **Controlled** (useState): use for practice textareas, form fields where you need validation or word count
- **Uncontrolled** (useRef): use for file inputs, MediaRecorder integration (AudioRecorder.jsx)

---

## State Management

### Decision tree
```
Is the state used by only one component?
  → useState inside that component

Is the state shared between 2–3 sibling components?
  → Lift to nearest common ancestor

Is the state needed across the whole app (theme, auth, onboarding data)?
  → Context API (already using ThemeContext pattern)

Is the state server-derived (Groq responses, Supabase data)?
  → Keep in component or custom hook, not global context
```

### Context API — avoid re-render traps
```jsx
// ❌ Bad — whole app re-renders when theme changes
const AppContext = createContext()
// value={{ theme, user, session, feedback }} ← too many concerns

// ✅ Good — split by update frequency
const ThemeContext = createContext()   // changes rarely
const SessionContext = createContext() // changes per session
// Each consumer only re-renders when its context changes
```

### Derived state pattern
```jsx
// ❌ Don't sync state to state
const [text, setText] = useState('')
const [wordCount, setWordCount] = useState(0)
useEffect(() => setWordCount(text.split(' ').length), [text]) // wasteful

// ✅ Derive it
const [text, setText] = useState('')
const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
```

---

## Performance

### useMemo — use sparingly
```jsx
// ✅ Worth memoizing: expensive computation, stable deps
const filteredContent = useMemo(
  () => contentLibrary.filter(c => 
    c.focusAreas.some(f => userFocusAreas.includes(f)) && 
    c.stage === currentStage
  ),
  [userFocusAreas, currentStage] // only recalculates when these change
)

// ❌ Not worth memoizing: cheap operations
const label = useMemo(() => `Stage ${stage}`, [stage]) // pointless
```

### useCallback — for stable function references
```jsx
// ✅ Use when passing callbacks to memoized children
const handleSubmit = useCallback(async (text) => {
  await postFeedback(text)
}, []) // empty deps = stable reference

// ❌ Skip when child isn't memoized anyway
```

### Code splitting by route/screen
```jsx
// In App.jsx — lazy load heavy screens
const FeedbackLayout = lazy(() => import('./components/feedback/FeedbackLayout'))
const ReaderPanel = lazy(() => import('./components/reader/ReaderPanel'))

// Wrap in Suspense with lightweight fallback
<Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
  <FeedbackLayout {...props} />
</Suspense>
```

### List rendering — stable keys
```jsx
// ✅ Use stable IDs from data
{stages.map(stage => <StageRow key={stage.id} {...stage} />)}

// ❌ Never use index as key when list can reorder
{stages.map((stage, i) => <StageRow key={i} {...stage} />)}
```

### Avoid inline functions in JSX
```jsx
// ❌ Creates new function on every render
<button onClick={() => handleSelect(area)}>

// ✅ Extract handler or use data attribute
const handleSelectArea = useCallback((e) => {
  handleSelect(e.currentTarget.dataset.area)
}, [handleSelect])
<button data-area={area} onClick={handleSelectArea}>
```

---

## Tailwind CSS v3 Patterns

### Theme-aware classes (always use CSS variables)
```jsx
// ❌ Hard-coded — breaks in light theme
<div className="bg-[#110D0B] text-[#EDE6DC]">

// ✅ CSS variable — switches with theme
<div className="bg-[var(--bg)] text-[var(--t1)]">
```

### Component variant pattern
```jsx
// Use cn() or template literals for conditional classes
const chipClass = selected
  ? 'bg-terracotta text-white border-terracotta'
  : 'border-[var(--border2)] text-[var(--t3)] hover:border-terracotta hover:text-[var(--t1)]'

<button className={`px-6 py-3 rounded-full border font-sans text-sm 
  transition-all duration-200 ${chipClass}`}>
```

### Responsive — desktop-first for MVP
```jsx
// Chrome desktop only for MVP — no mobile breakpoints needed
// Use max-w containers instead of responsive breakpoints
<div className="max-w-3xl mx-auto px-6">

// Only add md: or lg: prefixes when content genuinely needs it
```

### Animation utilities
```jsx
// Pulse for loading states
<div className="animate-pulse bg-[var(--s2)] rounded-xl h-4 w-32" />

// Bounce for loading dots
<div className="w-1 h-1 bg-terracotta/40 rounded-full animate-bounce 
  [animation-delay:-0.3s]" />

// Custom keyframes go in tailwind.config.js extend.keyframes
```

---

## Vite Configuration

### Environment variables
```js
// .env.local (never commit)
VITE_GROQ_API_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ASSEMBLYAI_KEY=...

// Access in code
const url = import.meta.env.VITE_SUPABASE_URL
```

### Path aliases (add to vite.config.js)
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@data': path.resolve(__dirname, './src/data'),
    }
  }
})
```

### Production build
```bash
npm run build       # outputs to dist/
npm run preview     # preview production build locally
```
Vite handles tree shaking, minification, and chunk splitting automatically. No manual webpack config needed.

---

## Accessibility (a11y)

### Minimum requirements for Situo
```jsx
// Interactive elements
<button aria-label="Stop recording" onClick={stopRecording}>
  <span className="material-symbols-outlined">stop</span>
</button>

// Form inputs
<textarea
  id="practice-response"
  aria-label="Your practice response"
  aria-describedby="word-count-hint"
/>
<span id="word-count-hint" className="sr-only">
  Write between 150 and 300 words
</span>

// Loading states
<div role="status" aria-live="polite" aria-label="Building your plan">
  {/* loading animation */}
</div>

// Focus management after screen transitions
useEffect(() => {
  headingRef.current?.focus()
}, [currentStep])
```

### WCAG 2.1 AA — contrast check
- Terracotta `#C2624A` on dark `#110D0B` → passes AA for large text, check for small text
- Always test body text and labels with a contrast checker before shipping
- `text-[var(--t3)]` (`#8C7060`) on `var(--bg)` is borderline — use `var(--t2)` for important labels

---

## Error Handling

### API call pattern with error boundary
```jsx
// Wrap async Groq calls consistently
async function callGroq(prompt) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s TBD-2
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
      signal: controller.signal
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return await res.json()
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out')
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}

// In component — always handle loading, error, success
const [state, setState] = useState({ 
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  data: null, 
  error: null 
})
```

### JSON parse safety (Groq responses)
```jsx
// Groq sometimes wraps JSON in markdown — always strip
function parseGroqJSON(text) {
  const clean = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
  try {
    return JSON.parse(clean)
  } catch {
    console.error('Failed to parse Groq JSON:', text)
    return null
  }
}
```

---

## AudioRecorder specifics

```jsx
// MediaRecorder API pattern for AudioRecorder.jsx
const startRecording = useCallback(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
  const chunks = []
  
  recorder.ondataavailable = (e) => chunks.push(e.data)
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' })
    setAudioBlob(blob)
    setRecorderState('playback')
    stream.getTracks().forEach(t => t.stop()) // release mic
  }
  
  recorder.start()
  mediaRecorderRef.current = recorder
  setRecorderState('recording')
}, [])

// Always release the mic on component unmount
useEffect(() => {
  return () => {
    mediaRecorderRef.current?.stop()
  }
}, [])
```

---

## File naming conventions
```
Components:     PascalCase.jsx     → SparkCard.jsx
Hooks:          camelCase.js       → useGroq.js
Data files:     camelCase.js       → content.js
Context:        PascalCase.jsx     → ThemeContext.jsx
Utilities:      camelCase.js       → parseGroqJSON.js
```

---

## Reference files

For deeper guidance on specific topics, read:
- `references/patterns.md` — extended component patterns and anti-patterns
- `references/tailwind.md` — Tailwind v3 Situo-specific class reference
- `references/testing.md` — Jest + React Testing Library setup for this project

Read a reference file only when the user's question goes deeper than what's covered above.