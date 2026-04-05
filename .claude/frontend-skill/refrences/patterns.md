# Extended Patterns Reference

## Atomic Design for Situo

```
Atoms:      ConfidenceBadge, TopBar, pip dots, chip buttons
Molecules:  SparkCard, LearnCard, DeliveryNotice, OverallCard
Organisms:  FeedbackLayout, SessionLayout, OnboardingFlow
Templates:  The 2-panel layout (Sidebar + main)
Pages:      App.jsx orchestrates which template renders
```

Keep atoms and molecules pure (no API calls, no global state).
Organisms can have side effects and context access.

---

## Separation of concerns

```
UI layer:     JSX + Tailwind classes only. No business logic.
Hook layer:   State, effects, API calls. No JSX.
Data layer:   content.js, curriculum.js. Pure data.
API layer:    server/main.py. No frontend concerns.
```

**Signal you've violated this**: a component file has both a complex
API call AND conditional JSX render logic → extract the API call
into a custom hook.

---

## Avoid unnecessary state

Ask before adding useState:
1. Can this be derived from existing state? → derive it
2. Can this come from props? → use props
3. Does it need to survive re-renders? → if not, use useRef
4. Is it truly UI state that changes over time? → then useState

```jsx
// ❌ Unnecessary state
const [isDisabled, setIsDisabled] = useState(true)
useEffect(() => setIsDisabled(wordCount < 10), [wordCount])

// ✅ Derived
const isDisabled = wordCount < 10
```

---

## Pagination / progressive loading for content

When the content library grows beyond 30 pieces, filter
client-side using useMemo — no pagination needed at this scale.
If it exceeds 200 pieces, move filtering to a Supabase query.

```jsx
const matchedContent = useMemo(() =>
  contentLibrary
    .filter(c => c.stage === currentStage)
    .filter(c => c.focusAreas.some(f => userFocusAreas.includes(f)))
    .sort((a, b) => a.id.localeCompare(b.id)),
  [currentStage, userFocusAreas]
)
```

---

## Debouncing — word count updates

```jsx
// Debounce expensive operations on text input
function useWordCount(text, delay = 150) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay])
  
  return count
}
```

---

## Error Boundaries

```jsx
// Wrap heavy async components with error boundaries
class FeedbackErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center 
          min-h-[300px] gap-4">
          <p className="text-[var(--t3)] text-sm">
            Something went wrong loading feedback.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="text-terracotta text-sm underline"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

---

## Stable component composition for ReaderPanel

The ReaderPanel slides in over the session. Keep it mounted (not
conditionally rendered) to avoid losing scroll position:

```jsx
// ✅ Always mounted, controlled by CSS transform
<ReaderPanel
  isOpen={isReaderOpen}
  {...readerProps}
/>

// ❌ Conditionally rendered — loses scroll on close
{isReaderOpen && <ReaderPanel {...readerProps} />}
```

The `isOpen` prop controls `transform: translateX(0/100%)` via
Tailwind transition classes. The panel is always in the DOM.