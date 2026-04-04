# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Frontend (React/Vite):**
```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

**Backend (FastAPI):**
```bash
# Activate the venv first
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Unix

uvicorn server.main:app --reload --port 8000
```

Both servers must be running — the frontend proxies all AI calls through the backend.

**Environment:** Create `server/.env` with `GROQ_API_KEY=<key>`.

## Project Context

Situo is a communication and public speaking learning platform built on situated learning theory. It is a refactor of an earlier project (SkillForge 1.0). The authoritative product specification is `docs/SRS.md` (v0.5). Target: 10 returning users as MVP success metric. Desktop Chrome only.

## Architecture

### Screen state machine (`src/App.jsx`)
All application state lives in `App.jsx`. The app transitions between three top-level screens via `screen` state:
- `onboarding` → `OnboardingFlow` collects focus areas, context, and baseline submission → calls `handleOnboardingComplete`
- `session` → three sub-steps controlled by `sessionState.sessionStep`: `spark` → `learn` → `practice`
- `feedback` → shown after written or spoken submission

### Onboarding flow (`src/components/onboarding/`)
5 steps (0–4) controlled by `step` state in `OnboardingFlow.jsx`:
- Step 0: `StepFocusAreas` — multi-select from 7 focus areas
- Step 1: `StepContext` — single-select professional/social/both
- Step 2: `StepBaseline` — **locked permanent prompt** (see SRS §3.1.1a); min 10 words to submit
- Step 3: `StepLoading` — shown while study plan generates (4–8s)
- Step 4: `StepComplete` — displays AI-generated 5-stage study plan; user clicks "Begin Stage 1"

Per SRS v0.5, Step 3 should also run diagnostic baseline analysis (SPF — Situated Performance Fingerprint) before study plan generation. The SPF shape is `{ strengths[], growth_areas[], patterns[], recommended_focus[] }` and should be shown to the user in a `DiagnosticResult.jsx` component (not yet built). Currently, `OnboardingFlow` only generates the study plan and skips diagnostic analysis.

### Session flow
1. **Spark** (`SparkCard`) — presents a content piece (article/video) with a hook
2. **Learn** (`LearnCard`) — AI-generated lesson + key terms, triggered by `handleSparkContinue`
3. **Practice** — either `WrittenPractice` or `AudioRecorder` depending on `sessionType`

`sessionType` is derived in `src/data/curriculum.js`: focus areas `tone_vocal_variety` and `handling_nervousness` → spoken; all others → written. Mixed focus areas alternate by stage number.

### AI integration (`src/hooks/useGroq.js`)
`useGroq` sends messages to `POST http://localhost:8000/api/chat`. When `skipHistory=true` (used for all lesson/feedback generation), the system prompt is overridden to `"You are a data API. Respond precisely and ONLY with the requested JSON format."` — all structured responses expect raw JSON, no markdown fences.

The backend (`server/main.py`) is a thin FastAPI proxy forwarding requests to Groq using `meta-llama/llama-4-scout-17b-16e-instruct`.

### Backend endpoints (current vs. planned)
| Endpoint | Status | Purpose |
|---|---|---|
| `POST /api/chat` | Implemented | Groq proxy for all AI calls |
| `POST /api/analyze-audio` | Planned | Acoustic metrics via AssemblyAI (pace, filler words, pauses) |
| `POST /api/transcribe` | Planned | Audio → transcript via Groq Whisper |

The frontend currently calls `/api/analyze-audio` in `handleSpokenSubmit` and falls back to mock data on failure.

### Spoken session rules (non-negotiable per SRS §3.1.3a)
- `DeliveryNotice` component must appear on all spoken feedback screens
- Action bar hierarchy for spoken sessions: Primary CTA = "Request Human Review" (terracotta filled), Secondary = "Continue" (ghost) — **inverse of written sessions**

### Data layer
- `src/data/curriculum.js` — 5 default stages + `getSessionType()` logic
- `src/data/content.js` — static content pieces mapped to stages/focus areas; `getFirstContentForStage(stage, focusAreas)` selects content
- `src/hooks/useContent.js`, `src/hooks/useSession.js`, `src/hooks/useStudyPlan.js` — currently empty stubs

### Theme
`src/context/ThemeContext.jsx` provides dark/light toggle persisted to `localStorage` under key `situo-theme`. The root element gets a `dark` or `light` class.

### Component structure
```
src/components/
  onboarding/   — StepFocusAreas, StepContext, StepBaseline, StepLoading, StepComplete
  session/      — SparkCard, LearnCard, WrittenPractice, AudioRecorder, SessionLayout
  feedback/     — FeedbackLayout, AcousticMetrics, ContentFeedback, OverallCard, DeliveryNotice, FeedbackActions
  reader/       — ReaderPanel (slide-over for reading source content)
  shared/       — Sidebar, TopBar, ConfidenceBadge
```

Tailwind color `bg-terracotta` (hex `#C2624A`) is the primary action color for CTA buttons throughout the app.

## What is not yet built (per SRS)
- Supabase integration (auth via magic link, all persistent data) — `localStorage` is used as a temp stand-in for transient UI state only
- `DiagnosticResult.jsx` — SPF output display during onboarding and Stage 5 re-test
- `ReviewerQueue.jsx` and human review system (Phase 4)
- `ContinuityCard.jsx`, `ShareableDashboard.jsx`, goal completion flow (Phase 5)
- Confidence score formula (40% AI / 40% human ratings / 20% consistency)
- Retry/circuit breaker logic in `server/main.py` for Groq failures
- Stage 5 re-test with the locked baseline prompt for before/after comparison
