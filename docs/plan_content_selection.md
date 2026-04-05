# Fix Content Selection Data Pipeline

The content selection pipeline is broken at every junction between the user's onboarding choices and the content library. This plan fixes the plumbing so that **stage + focusAreas + context + contentLevel + "not seen"** filtering works as the SRS intends.

---

## 1. Diagnosis: Current Anti-Patterns

### Anti-Pattern 1: String Identity Crisis — No Canonical Vocabulary

The system uses three separate, incompatible string vocabularies for the same concept:

| Layer | String for "vocal skills" | String for "nervousness" | String for "clarity" |
|---|---|---|---|
| **Onboarding chips** (`StepFocusAreas.jsx`) | `"Tone & vocal variety"` | `"Handling nervousness"` | `"Clarity & conciseness"` |
| **Content tags** (`content.js`) | `"Vocal Delivery"`, `"Voice"`, `"Delivery"` | `"Anxiety Management"`, `"Arousal Reappraisal"` | `"Clarity and Simplicity"`, `"Conciseness"` |
| **Session type triggers** (`curriculum.js`) | `"tone_vocal_variety"` | `"handling_nervousness"` | *(not used)* |

**Result:** `focusAreas.includes(fa)` in `getFirstContentForStage` performs an exact string comparison. Only `"Storytelling"` matches across onboarding → content. The other 6 onboarding options **never match any content**, causing every selection to fall through to `content[0]`.

> [!CAUTION]
> This means every user, regardless of what they select during onboarding, gets the same first article ("The Sound of Writing") for every session in every stage.

---

### Anti-Pattern 2: No Seen-Content Tracking — Same Piece Every Time

`getFirstContentForStage` always returns `matches[0]`. There is no mechanism — state, ref, or storage — to track which content IDs a user has already completed. Even if the filter worked, sessions 2, 3, and 4 within the same stage would show the same piece.

---

### Anti-Pattern 3: Phantom Hooks — Empty Files in the Dependency Tree

Two hooks listed in the SRS Phase 2 implementation plan exist as empty files:

| File | SRS Purpose | Current State |
|---|---|---|
| `useContent.js` | Content selection, filtering, "seen" tracking | Empty (0 bytes) |
| `useStudyPlan.js` | Study plan lifecycle, stage transitions | Empty (0 bytes) |

Their responsibilities are currently scattered across `useSession.js` (content selection) and `OnboardingFlow.jsx` (plan generation). The empty files create false expectations for any developer reading the codebase.

---

### Anti-Pattern 4: Context Is Collected but Never Used

The user selects `"Professional"` / `"Social"` / `"Both"` during onboarding. This value is stored in `onboardingData.context` and passed to the study plan prompt. But:
- Content pieces have **no `context` field** in the data schema
- No selection function filters by context
- The value is never read after onboarding

---

### Anti-Pattern 5: contentLevel Exists but Is Never Filtered

Every content piece has `contentLevel: "beginner"`. The SRS states this field is *"used for content filtering and reviewer access gating"* (§5.1 Glossary). But `getFirstContentForStage` and `getContentForStageAndFocus` never inspect it. As the library grows to include intermediate and advanced pieces, they would be served to all users indiscriminately.

---

### Anti-Pattern 6: Content `sessionType` vs Curriculum `getSessionType` — Two Sources of Truth

Each content piece has a `sessionType` field (`"written"` or `"spoken"`). Meanwhile, `curriculum.js` independently determines session type based on focus areas. These two systems can disagree — a content piece tagged `sessionType: "spoken"` can be served during a written session, forcing the wrong practice format for its prompt.

---

### Anti-Pattern 7: Flat Data with No Indexing — O(n) Scan Every Time

`getContentForStageAndFocus` does a linear `.filter()` over the entire content array on every session start and every "Continue" press. With 18 pieces this is invisible; with 300+ pieces it becomes wasteful and also makes the selection logic harder to debug.

---

## 2. Proposed Solution Architecture

### 2.1 Single Source of Truth: Canonical Focus Area Keys

Create a **canonical mapping** in a new file `src/data/focusAreaMap.js`:

```
CANONICAL KEY (internal)        USER-FACING LABEL           CONTENT TAGS (many → one)
─────────────────────────       ─────────────────           ─────────────────────────
clarity_conciseness             "Clarity & conciseness"     "Clarity and Simplicity", "Conciseness",
                                                            "Clarity & Precision", "Conciseness & Brevity",
                                                            "Clarity", "Active Expression",
                                                            "Editing Techniques", "Sentence Structure"

active_listening                "Active listening"          "Feedback Loops", "Audience Centricity",
                                                            "Audience Awareness", "Audience"

storytelling                    "Storytelling"              "Storytelling", "Rhetorical Devices",
                                                            "Pattern Recognition", "Memorability"

handling_nervousness            "Handling nervousness"      "Anxiety Management", "Arousal Reappraisal",
                                                            "Confidence", "Preparation",
                                                            "Performance Optimization",
                                                            "Opportunity Mindset"

tone_vocal_variety              "Tone & vocal variety"      "Vocal Delivery", "Voice", "Delivery"

emotional_intelligence          "Emotional intelligence"    "Emotional Intelligence"

nonverbal_communication         "Nonverbal communication"   "Non-verbal Communication"
```

**Effect:** Onboarding stores canonical keys. Content matching maps content tags → canonical keys. Curriculum spoken triggers use the same canonical keys. One vocabulary everywhere.

---

### 2.2 Content Index — Pre-computed Lookup Map

Replace the raw array scan with a pre-built index in `content.js`:

```js
// Built once at module load
const contentIndex = {
  byStage: {          // stage → content[]
    1: [...],
    2: [...],
  },
  byCanonical: {      // canonicalKey → content[]
    clarity_conciseness: [...],
    storytelling: [...],
  },
  byStageAndCanonical: {  // `${stage}_${key}` → content[]
    '1_clarity_conciseness': [...],
    '1_storytelling': [...],
  }
};
```

**Effect:** O(1) lookup by stage, O(1) by canonical key, O(1) by both. No `.filter()` at runtime.

---

### 2.3 "Not Seen" Tracking via `useContent` Hook

Populate the currently empty `src/hooks/useContent.js`:

```
useContent({ canonicalFocusAreas, context, stage })
  ├── State: seenContentIds (Set)
  ├── getNextContent(stage, canonicalKeys)
  │     1. Get candidates from contentIndex.byStageAndCanonical
  │     2. Filter out seenContentIds
  │     3. If empty after filter → reset seenContentIds for that stage (round-robin)
  │     4. Return first unseen match
  ├── markAsSeen(contentId)
  └── resetSeen()
```

**Effect:** Each session within a stage gets a different content piece. When all pieces for a stage are exhausted, they cycle back.

---

### 2.4 Context Awareness — Two Approaches

The SRS says context shapes *"the tone and context of your lessons and practice prompts"* (StepContext.jsx subtext). Two approaches, in order of recommendation:

**Approach A (Recommended for MVP):** Context influences the **AI prompt**, not the content filter.
- Pass `context` to the lesson generation prompt so the AI frames the lesson for professional/social scenarios
- No change to content data schema needed
- This is already partially done in `buildStudyPlanPrompt` but not in `buildLessonPrompt`

**Approach B (Post-MVP):** Add a `context` field to content pieces and use it as a filter dimension—but this requires retagging all 30+ content pieces and may over-fragment an already small library.

> [!IMPORTANT]
> **Decision needed:** Should `context` filter content pieces directly (Approach B), or just influence AI lesson framing (Approach A)? Approach A is recommended because the content library is too small to segment further.

---

### 2.5 contentLevel Filtering

Add `contentLevel` as a filter dimension. For MVP, all content is `"beginner"`, so this is a no-op guard rail:

```js
// Inside getNextContent:
candidates = candidates.filter(c => c.contentLevel === 'beginner'); // MVP: always beginner
```

When intermediate/advanced content is added later, this filter prevents advanced content from being served to early-stage users.

---

### 2.6 Reconcile Content `sessionType` with Curriculum `getSessionType`

Two options:

**Option 1 (Recommended):** `getSessionType` remains the authority. Content is filtered to prefer pieces whose `sessionType` matches the curriculum's determined type, but falls back to any content if no match exists.

**Option 2:** Remove `sessionType` from content entirely and let curriculum.js be the sole decision-maker.

> [!IMPORTANT]
> **Decision needed:** Should content `sessionType` act as a preference filter (Option 1) or be removed (Option 2)?

---

## 3. Proposed Changes

### Data Layer

---

#### [NEW] `src/data/focusAreaMap.js`

The canonical vocabulary mapping. Exports:
- `CANONICAL_FOCUS_AREAS`: Object mapping canonical keys → `{ label, contentTags[], isSpoken }` 
- `contentTagToCanonical(tag)`: Maps a content tag string → canonical key
- `userLabelToCanonical(label)`: Maps a user-facing chip label → canonical key
- `SPOKEN_CANONICAL_KEYS`: Array of canonical keys that trigger spoken sessions (replaces hardcoded array in `curriculum.js`)

---

#### [MODIFY] `src/data/content.js`

- Add `canonicalFocusAreas[]` to each content piece (computed from `focusAreas` via `contentTagToCanonical`)
- Export `contentIndex` pre-computed map in addition to the raw array
- Modify `getContentForStageAndFocus` to accept canonical keys instead of raw strings
- Add `getNextUnseen(stage, canonicalKeys, seenIds)` function that filters by stage + canonical keys + not seen

---

#### [MODIFY] `src/data/curriculum.js`

- Import `SPOKEN_CANONICAL_KEYS` from `focusAreaMap.js`
- Replace hardcoded `SPOKEN_FOCUS_AREAS = ['tone_vocal_variety', 'handling_nervousness']` with the imported constant
- `getSessionType` now accepts canonical keys (which the onboarding flow will pass)

---

### Hook Layer

---

#### [MODIFY] `src/hooks/useContent.js` (currently empty → implement)

Responsibilities:
- Maintain `seenContentIds` state (Set of content IDs already shown)
- `getNextContent(stage, canonicalKeys)`: The single entry point for content selection
  - Uses `contentIndex` for lookup
  - Filters by `contentLevel`
  - Excludes `seenContentIds`
  - Prefers matching `sessionType` when available
  - Falls back gracefully: matched+unseen → matched+seen(reset) → any-in-stage → content[0]
- `markAsSeen(contentId)`: Called after a session completes
- `resetSeen()`: Called if the user starts a new goal cycle

---

#### [MODIFY] `src/hooks/useSession.js`

- Import and call `useContent` instead of calling `getFirstContentForStage` directly
- `initSession(data)` → passes canonical focus area keys to `useContent.getNextContent`
- `handleContinue()` → calls `useContent.markAsSeen(currentContentId)` before selecting next content
- Remove direct dependency on `getFirstContentForStage`

---

#### [DELETE intent] `src/hooks/useStudyPlan.js` (currently empty)

This file is empty and its SRS-defined responsibilities (study plan generation) are correctly handled in `OnboardingFlow.jsx`. Either:
- Delete it to avoid confusion, **or**
- Implement it if study plan logic needs to be reused elsewhere (not the case currently)

> [!NOTE]
> Recommendation: Delete the empty file. If study plan logic moves out of `OnboardingFlow` later, create it fresh at that point.

---

### Onboarding Layer

---

#### [MODIFY] `src/components/onboarding/StepFocusAreas.jsx`

- Import `CANONICAL_FOCUS_AREAS` from `focusAreaMap.js`
- Render chips using the `label` values from the map
- When passing `selected` to `onNext`, pass the **canonical keys** (e.g. `"clarity_conciseness"`) instead of the display labels
- The user sees `"Clarity & conciseness"`, the system stores `"clarity_conciseness"`

---

#### [MODIFY] `src/components/onboarding/OnboardingFlow.jsx`

- `handleBegin` already passes `{ focusAreas, context, ... }` to `onComplete`. The `focusAreas` array will now contain canonical keys instead of display labels. No structural change needed, just the type of strings changes.

---

## 4. Data Flow After Fix

```
User clicks "Clarity & conciseness" chip
    ↓
StepFocusAreas stores canonical key: "clarity_conciseness"
    ↓
OnboardingFlow.onComplete({ focusAreas: ["clarity_conciseness", ...], context: "Professional", ... })
    ↓
App.handleOnboardingComplete → initSession(data)
    ↓
useSession.initSession calls useContent.getNextContent(stage=1, ["clarity_conciseness"])
    ↓
useContent looks up contentIndex.byStageAndCanonical["1_clarity_conciseness"]
  → finds [content_001, content_005, content_010, content_012, content_013, content_015]
  → filters out seenContentIds (empty on first session)
  → filters by contentLevel ("beginner")
  → prefers sessionType matching getSessionType result
  → returns content_001
    ↓
Session 1 → user completes → markAsSeen("content_001")
    ↓
Session 2 → getNextContent again → content_001 excluded → returns content_005
    ↓
Session 3 → returns content_010
    ↓
Session 4 → returns content_012
    ↓
Stage 2 → getNextContent(stage=2, ["clarity_conciseness"]) → different pool
```

---

## 5. Priority Order

| Step | Action | Files | Depends On |
|---|---|---|---|
| **1** | Create `focusAreaMap.js` with canonical mapping | `[NEW] src/data/focusAreaMap.js` | Nothing |
| **2** | Update `StepFocusAreas.jsx` to emit canonical keys | `StepFocusAreas.jsx` | Step 1 |
| **3** | Update `curriculum.js` to use canonical spoken keys | `curriculum.js` | Step 1 |
| **4** | Add `canonicalFocusAreas` + index to `content.js` | `content.js` | Step 1 |
| **5** | Implement `useContent.js` hook | `useContent.js` | Steps 1, 4 |
| **6** | Rewire `useSession.js` to use `useContent` | `useSession.js` | Step 5 |
| **7** | Pass `context` to lesson prompt | `lessonPrompts.js` | Independent |
| **8** | Delete empty `useStudyPlan.js` | `useStudyPlan.js` | Independent |

---

## 6. Open Questions

> [!IMPORTANT]
> **Q1:** Should `context` (Professional/Social) filter content pieces directly, or just influence AI lesson framing? 
> Recommendation: Lesson framing only (Approach A) — the library is too small to segment.

> [!IMPORTANT]
> **Q2:** Should content `sessionType` act as a soft preference when filtering, or be removed from the data entirely?
> Recommendation: Keep as soft preference — helps when the library grows.

> [!IMPORTANT]
> **Q3:** Delete empty `useStudyPlan.js`? It creates false expectations but removing files is a one-way decision.

---

## 7. Verification Plan

### Automated
- Select each of the 7 onboarding focus areas individually → verify content is returned (not `content[0]` fallback)
- Complete 4 sessions in stage 1 → verify 4 different content pieces are shown
- Select "Tone & vocal variety" → verify `getSessionType` returns `"spoken"`
- Select "Clarity & conciseness" → verify `getSessionType` returns `"written"`

### Manual
- Full onboarding → session flow with different focus area combinations
- Verify the fallback chain works when a stage has no matching content
