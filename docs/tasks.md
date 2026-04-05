# Content Selection Fix Tasks

Below are the markdown prompts for the AI coding agent to execute the content selection refactor plan, in priority order.

---

## [Task 1] Create Canonical Mapping Base
**Prompt for Agent:**
Please create a new file `src/data/focusAreaMap.js`. This file will serve as the single source of truth for focus areas.
It should export the following:
1. `CANONICAL_FOCUS_AREAS`: A map where canonical keys point to an object with a label, content tags, and whether it triggers spoken practice (e.g., `clarity_conciseness: { label: "Clarity & conciseness", contentTags: ["Clarity and Simplicity", "Conciseness", "Clarity & Precision", "Conciseness & Brevity", "Clarity", "Active Expression", "Editing Techniques", "Sentence Structure"] }`).
    - Use the mappings listed below:
      - `clarity_conciseness`: Label "Clarity & conciseness". Tags: "Clarity and Simplicity", "Conciseness", "Clarity & Precision", "Conciseness & Brevity", "Clarity", "Active Expression", "Editing Techniques", "Sentence Structure".
      - `active_listening`: Label "Active listening". Tags: "Feedback Loops", "Audience Centricity", "Audience Awareness", "Audience".
      - `storytelling`: Label "Storytelling". Tags: "Storytelling", "Rhetorical Devices", "Pattern Recognition", "Memorability".
      - `handling_nervousness`: Label "Handling nervousness". Tags: "Anxiety Management", "Arousal Reappraisal", "Confidence", "Preparation", "Performance Optimization", "Opportunity Mindset".
      - `tone_vocal_variety`: Label "Tone & vocal variety". Tags: "Vocal Delivery", "Voice", "Delivery".
      - `emotional_intelligence`: Label "Emotional intelligence". Tags: "Emotional Intelligence".
      - `nonverbal_communication`: Label "Nonverbal communication". Tags: "Non-verbal Communication".
2. `contentTagToCanonical(tag)`: A function that returns the canonical key for a given content tag from the library.
3. `userLabelToCanonical(label)`: A function that returns the canonical key for a user-facing label (used in onboarding).
4. `SPOKEN_CANONICAL_KEYS`: An exported array of the canonical keys that should trigger spoken sessions (which should be `['tone_vocal_variety', 'handling_nervousness']`).

---

## [Task 2] Update Onboarding UI
**Prompt for Agent:**
Update `src/components/onboarding/StepFocusAreas.jsx` to emit the canonical keys to the parent.
1. Import `CANONICAL_FOCUS_AREAS` from `src/data/focusAreaMap.js`.
2. Map over the Object entries of `CANONICAL_FOCUS_AREAS` or recreate the list based on it to render the chips using the user-facing `label`.
3. The component's local `selected` state should store the canonical keys (e.g. `'clarity_conciseness'`) instead of the labels.
4. When `onNext` is called, it should pass the array of canonical keys so that the rest of the app stores and uses the canonical format.

---

## [Task 3] Update Curriculum Logic
**Prompt for Agent:**
Update `src/data/curriculum.js` to rely on the canonical keys.
1. Import `SPOKEN_CANONICAL_KEYS` from `src/data/focusAreaMap.js`.
2. Remove the hardcoded `SPOKEN_FOCUS_AREAS` array.
3. Update `getSessionType` so that it uses the imported `SPOKEN_CANONICAL_KEYS` to determine if a focus area triggers a spoken session. Assume the input `focusAreas` are now canonical keys.

---

## [Task 4] Update Content Logic and Create Index
**Prompt for Agent:**
Update `src/data/content.js` to correctly map focus areas and use a pre-computed index for O(1) lookups.
1. Import `contentTagToCanonical` from `focusAreaMap.js`. Add a `canonicalFocusAreas` array property to each content piece by mapping its existing `focusAreas` array through this function.
2. Build and export a pre-computed `contentIndex` map. It should group content pieces:
    - By stage (`byStage`)
    - By canonical key (`byCanonical`)
    - By stage AND canonical key (`byStageAndCanonical`, e.g. `'1_clarity_conciseness'`)
3. Update `getContentForStageAndFocus` or provide a new function to use these canonical keys for filtering.
4. Add a new function `getNextUnseen(stage, canonicalKeys, seenIds, targetSessionType)` that uses the index to quickly lookup pieces for the given stage and canonical keys. It should:
    - Filter out IDs that exist in the `seenIds` Set.
    - Prefer content pieces where `contentLevel` is `'beginner'`.
    - Act as a soft preference towards the `targetSessionType`. If matches align with the type, prefer them; otherwise fallback to other types.
    - Handle fallback gracefully (if all matched pieces are seen, ignore seenIds. If no matched pieces, fallback to any in stage).
    - Return the first valid content piece object.

---

## [Task 5] Implement useContent Hook
**Prompt for Agent:**
Implement the currently empty `src/hooks/useContent.js` to manage seen content logic.
1. Maintain local state `seenContentIds` (preferably as a React state Set or stored in a ref).
2. Create and return a `getNextContent(stage, canonicalKeys, targetSessionType)` function that internally calls the logic implemented in component.js step 4, passing the current `seenContentIds`.
3. Create and return a `markAsSeen(contentId)` function to add an ID to the set.
4. Create and return a `resetSeen()` function to clear the set when a user restarts or enters a new stage loop.

---

## [Task 6] Rewire useSession
**Prompt for Agent:**
Update `src/hooks/useSession.js` to remove direct dependence on raw content fetching and instead use the stateful `useContent` hook.
1. Import and utilize `useContent` inside `useSession`.
2. In `initSession(data)`, calculate `targetSessionType` (via `getSessionType`) and use `getNextContent` to get the first content piece securely, which will now use canonical keys.
3. In `handleContinue()`, invoke `markAsSeen(currentContentId)` so the piece just completed won't show again. Then call `getNextContent` to fetch the next unseen piece. Let `getSessionType` decide the practice type, and pass it as a soft preference.

---

## [Task 7] Update Lesson Prompts using Context
**Prompt for Agent:**
Update the AI lesson generation to use the context dimension (Professional vs. Social vs. Both).
1. In `src/prompts/lessonPrompts.js`, update `buildLessonPrompt` to accept a new `context` argument.
2. If `context` is provided, include it in the prompt instructions to frame the lesson for that particular environment (e.g. framing communication lessons specifically for "Professional" settings).
3. Ensure that wherever `buildLessonPrompt` is called in the application (like in `useSession.js`), the `state.onboardingData.context` is passed through.

---

## [Task 8] Delete Empty Hook
**Prompt for Agent:**
The `useStudyPlan` hook is empty and its functionality is currently handled safely inside `OnboardingFlow.jsx`.
Please explicitly delete the `src/hooks/useStudyPlan.js` file to prevent future developer confusion.
