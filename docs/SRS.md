# Software Requirements Specification for Situo

| Version | Date           | Author  | Change Summary |
|---------|----------------|---------|----------------|
| v0.2    | March 29, 2026 | Hassan  | Initial draft. All TBDs open. |
| v0.3    | March 31, 2026 | Hassan  | All TBDs resolved. Supabase + magic link auth added to scope. Database schema defined. Reviewer privacy enforced via RLS. |
| v0.4        | April 2, 2026 | Hassan  | Spoken sessions added to MVP scope. |
| v0.4(patch) | April 2, 2026 | Hassan  | Acoustic metrics added to spoken sessions. |

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to provide a comprehensive description of the requirements for Situo, a web-based communication and public speaking learning platform. This document serves as the authoritative source of requirements for developers, designers, and stakeholders involved in the development and testing of the product.

This SRS is intended for the development team, project stakeholders, potential collaborators, and investors. All requirements are written in plain language. Acronyms are defined. No prior knowledge of the product is assumed.

**[TBD-1 — RESOLVED]**

### 1.2 Scope
Situo is a platform that combines AI and human feedback for learning communication and public speaking skills through situated learning theory. The system includes onboarding, personalized study plans, content curation, practice sessions, AI feedback, optional human review, and progression tracking. MVP supports two practice formats: written responses (150–300 words) and spoken responses (60–90 second audio recordings). Video recording remains explicitly out of scope.

The system will include:
- User onboarding with focus areas and context selection
- Dynamic study plan generation
- Curated content library (~30 pieces)
- Practice sessions with AI feedback
- Optional human review system (two-tier reviewer model)
- Goal-based progression without level labels
- Confidence scoring and progress visualization

Out of scope for MVP:
- Mobile app
- Video recording and review
- Algorithmic content discovery
- Language learning
- Community/social features
- Monetization/payments
- XP/streaks
- Push notifications

### 1.3 Definitions, Acronyms, and Abbreviations
- SRS: Software Requirements Specification
- MVP: Minimum Viable Product
- AI: Artificial Intelligence
- API: Application Programming Interface

### 1.4 System Overview
Situo operates on a core session loop: Spark (content presentation), Learn (AI lesson), Practice (user submission), AI Feedback, and optional Human Review. Users progress through goal-based study plans without traditional levels. The platform uses React frontend, Python FastAPI backend with Groq AI integration, and Supabase (PostgreSQL) for all persistent data.

### 1.5 References
- Situated Learning theory (Jean Lave, 1988)
- Groq API documentation
- React and Vite documentation
- FastAPI documentation

## 2. Overall Description

### 2.1 Product Perspective
Situo is a standalone web application that serves as a communication skills learning platform. It integrates with the Groq API for AI functionality but does not require users to provide their own API keys. The system is built as a refactor of SkillForge 1.0, salvaging the Groq proxy and React scaffold while rebuilding other components from scratch.

The product differentiates itself by combining AI and human feedback in a situated learning context, addressing the gap where existing tools provide only one type of feedback.

### 2.2 Product Functions
- User onboarding (3 steps: Focus Areas, Context, Baseline Submission)
- Study plan generation based on user input
- Content presentation and lesson delivery
- Practice session management with submission handling
- AI feedback generation and display
- Human review request and response system
- Progress tracking and confidence scoring
- Goal completion flow with dashboard generation and next goal suggestions

### 2.3 User Characteristics
The primary user is an individual (casual or serious) seeking to improve communication and public speaking skills. They feel the need for structured, honest feedback but lack access to it. The founder is also a primary user, providing domain expertise for product decisions.

Users are expected to have basic computer literacy and internet access. No specific technical skills required beyond ability to write 150-300 word responses.

No level label is applied to users at any point. Users self-select focus areas and context during onboarding. The system infers appropriate content complexity from these selections.

### 2.4 Constraints
- Frontend: React + Vite, Tailwind CSS v3
- Backend: Python FastAPI
- AI: Groq API (llama-4-scout or equivalent)
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth — magic link email. User receives a login link via email. No password required. No OAuth for MVP.
- Storage: Supabase for all persistent data. localStorage used only for transient UI state (e.g. current session step, unsaved draft text).
- Deployment: Local for MVP, Vercel + Railway for beta
- Browser support: Desktop Google Chrome (latest version) only. Safari, Firefox, and Edge are explicitly out of scope for MVP.

**[TBD-3 — RESOLVED]**

### 2.5 Assumptions and Dependencies
- Groq API availability and reliability
- User's ability to access web application via supported browsers
- Founder-curated content library of ~30 pieces
- Human reviewers available for the two-tier system
- Supabase project configured with RLS policies before deployment

**[TBD-4 — RESOLVED]**: All persistent data stored in Supabase. localStorage retention concern is no longer applicable.

## 3. System Features and Requirements

### 3.1 Functional Requirements

#### 3.1.1 Onboarding Flow
When a new user accesses the application, the system shall present a 3-step onboarding flow.

When the user completes Step 1 (Focus Areas), the system shall allow multi-selection from: Emotional intelligence, Clarity and conciseness, Active listening, Nonverbal communication, Tone and vocal variety, Storytelling, Handling nervousness.

When the user completes Step 2 (Context), the system shall allow single selection from: Professional (presentations, meetings), Social (conversations, networking), Both.

When the user completes Step 3 (Baseline Submission), the system shall prompt for a 150-word response to a standard prompt and store it as a benchmark without evaluation. 
> The baseline prompt shall ask the user to describe a recent situation where they had to communicate something important. It shall be the same prompt for all users to enable future before/after comparison. The exact wording shall be defined by the founder before implementation of OnboardingFlow.jsx.

When onboarding is complete, the system shall generate a personalized 5-stage study plan based on Steps 1 and 2 answers.

#### 3.1.2 Study Plan Generation
When onboarding answers are received, the system shall generate a 5-stage study plan with each stage mapping to selected focus areas.

When a study plan is generated, the system shall map curated content pieces to appropriate stages using focusAreas[] and contentLevel metadata.

### Content Data Shape
Each content piece in the library shall conform to:

| Field         | Type                              | Description |
|---------------|-----------------------------------|-------------|
| id            | string                            | Unique identifier |
| title         | string                            | Content title |
| type          | article/video/podcast_clip        | Content format |
| source        | string                            | Publisher or creator |
| url           | string                            | Link to original |
| summary       | string (150 words)                | Written by founder |
| focusAreas[]  | string[]                          | Maps to onboarding options |
| contentLevel  | beginner/intermediate/advanced    | Internal use only |
| stage         | number (1-5)                      | Maps to study plan stage |
| lessonHook    | string                            | AI uses to connect content to lesson |
| practicePrompt| string                            | Writing prompt for practice step |

#### 3.1.3 Session Loop Execution
When a user starts a session, the system shall execute the SPARK step by surfacing one piece of curated content mapped to the current study plan stage.

When the SPARK step completes, the system shall execute the LEARN step by delivering a 3-5 minute AI-generated lesson connecting the content to the user's current stage concept.

When the LEARN step completes, the system shall execute the PRACTICE step by presenting a writing prompt tied to the content piece and lesson concept, accepting a 150-300 word written response.

When the session type is written, the system shall present a textarea accepting 150–300 word responses.

When the session type is spoken, the system shall present an audio recorder using the browser MediaRecorder API accepting 60–90 second recordings.

Session type is determined by the study plan based on the user's selected focus areas:
- Tone & vocal variety → spoken
- Handling nervousness → spoken
- All other focus areas → written
- Mixed focus areas → study plan alternates types by stage

#### 3.1.4 AI Feedback
When the user submits their practice response, the system shall execute the AI FEEDBACK step by evaluating clarity, structure, conciseness, and relevance, explicitly flagging unassessable elements, and suggesting human review value.

When the submission is spoken, the system shall:
1. Send audio to POST /api/transcribe (Groq Whisper)
2. Return transcript to user for reference
3. Run AI feedback on transcript content only
4. Explicitly flag all delivery elements (tone, pace, nervousness, presence) as requiring human review
5. Display a prominent notice that human review is strongly recommended for spoken sessions

When the submission is spoken, the system shall also call POST /api/analyze-audio (AssemblyAI) to retrieve objective acoustic metrics:
- Speaking pace (words per minute)
- Talk time (seconds of speech vs total duration)
- Filler word detection (word, count, position)
- Pause detection (count, duration, timestamp)

These metrics are displayed as objective measurements only. No confidence, nervousness, or emotional assessments are derived from acoustic data. All interpretation is explicitly deferred to human reviewers in the UI.

When AI feedback is delivered, the system shall allow the user to optionally request human review.

#### 3.1.5 Human Review System
When a user requests human review, the system shall queue the request for reviewer assignment.

When a reviewer (Tier 1 or 2) is assigned, the system shall provide only: the submission, lesson context, user's stated goal, and structured review form.

When a reviewer submits feedback, the system shall deliver it to the user within 48 hours expectation.

When a user reads a delivered human review, the system shall prompt them to rate the reviewer 1-5 stars. Rating shall be optional but prompted once. The prompt shall appear after the review content, not before. Reviewer average rating shall update immediately upon submission.

When a review request receives no reviewer response within 48 hours, the system shall automatically expire the request, update its status to "expired" in the database, and display an in-app notification to the learner: "No review was received in time. You may request again or continue to the next session." Email notification is deferred to post-MVP.

**[TBD-5 — RESOLVED]**

#### 3.1.6 Progression and Confidence Scoring
When sessions are completed, the system shall calculate confidence score using weighted formula: 40% AI assessment, 40% human reviewer ratings (when available), 20% consistency.

When no human reviews are received, the system shall redistribute weights to 60% AI assessment, 40% consistency.

When confidence score is calculated, the system shall display it as Low/Medium/High badge in the UI header.

When a goal is completed (Stage 5), the system shall generate a shareable dashboard with stats only (no writing samples).

When a goal is completed, the system shall invite eligible users to become Tier 1 reviewers.

When a goal is completed, the system shall present 3 AI-generated next goal suggestions with rationales.

When generating next goal suggestions, the system shall pass to the AI:
- Previous goal text
- Focus areas from completed goal
- Average AI assessment score
- Average human reviewer rating
- Common themes from human reviewer feedback
- Current stage completion count

The AI shall return exactly 3 suggestions, each with:
- goal: string (the suggested goal text)
- rationale: string (why Situo recommends it)
- focusAreas[]: string[] (focus areas for new plan)

When the user selects a next goal, the system shall show a Continuity Card summarizing previous and next goals.

When a new goal is selected, the system shall generate a new 5-stage study plan.

The shareable dashboard shall be private by default. The user must explicitly choose to generate and share the public URL. No dashboard URL shall be accessible without deliberate user action.

#### 3.1.7 Reviewer Management
When a user completes their first full goal cycle, the system shall invite them to become a Tier 1 Peer Reviewer.

When a Tier 1 reviewer maintains below 3.5 star average rating, the system shall suspend their review privileges.

When a user applies for Tier 2 Verified Reviewer, the system shall evaluate their sample review against founder quality bar.

When reviewers access submissions, the system shall ensure they see only allowed information (submission, lesson context, goal, review form) and not prohibited information (prior submissions, AI feedback, confidence score, profile).

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
When the system generates AI feedback, 90% of requests shall complete within 10 seconds. A loading indicator shall be displayed immediately upon submission. If the threshold is exceeded, the system shall handle the delay gracefully without crashing the session.

**[TBD-2 — RESOLVED]**

#### 3.2.2 Usability
The system shall provide an intuitive interface requiring no training for basic usage.

The system shall conform to WCAG 2.1 Level AA for all key screens. Requirements include:
- Minimum 4.5:1 color contrast ratio for normal text
- Semantic HTML throughout
- ARIA labels on interactive elements
- Full keyboard navigation support
- Screen reader compatibility

Pre-build action: Verify accent color #C2624A achieves 4.5:1 contrast on all background surfaces before implementation begins. Adjust shade if needed.

**[TBD-6 — RESOLVED]**

#### 3.2.3 Reliability
When the Groq API is unavailable, the system shall implement the following:

1. **Retry**: FastAPI backend retries the request up to 3 times with exponential backoff before failing.
2. **Circuit breaker**: After repeated failures, the circuit opens for 60 seconds. No further Groq calls are made during this window.
3. **Fallback**: The UI displays a friendly message: "AI feedback is temporarily unavailable. Your response has been saved — please try again shortly." The session does not crash.
4. **Recovery**: When Groq becomes available again, normal feedback resumes automatically.

Retry and circuit breaker logic lives in server/main.py (FastAPI). The React frontend receives a structured error response and renders the fallback UI. No retry logic in the frontend.

**[TBD-7 — RESOLVED]**

#### 3.2.4 Security
The system shall not store user API keys; all AI calls shall proxy through the backend.

Row Level Security (RLS) is enforced at the database level for all reviewer access to submissions. Reviewer privacy rules are enforced by Supabase SQL policy — not application code.

Policy: A reviewer may only read a submission that is linked to a review_request explicitly assigned to them with status "assigned". No application-level workaround can override this.

#### 3.2.5 Scalability
The system shall support up to 10 returning users for MVP success metric.

**[TBD-8]**: Question: How should the content mapping system work when the library grows beyond ~30 pieces? Why it matters: For MVP, filtering by focusAreas[] and contentLevel is sufficient. At 300+ pieces and 50+ goal combinations, a smarter mapping architecture is needed. Flagged now so the MVP data model is not built in a way that makes scaling harder. Status: Deferred to post-MVP. No action required now.

### 3.3 Interface Requirements

#### 3.3.1 User Interfaces
The system shall provide a web-based interface with the following components:
- OnboardingFlow.jsx (3-step onboarding)
- SparkCard.jsx (content display)
- LessonCard.jsx (AI lesson)
- SubmissionPanel.jsx (response input)
- FeedbackPanel.jsx (AI feedback + review request)
- ReviewerQueue.jsx (reviewer interface)
- Sidebar.jsx (goal history + progress)
- ConfidenceBadge.jsx (confidence display)
- ProgressBar.jsx (stage progress)
- ContinuityCard.jsx (goal transition)
- ShareableDashboard.jsx (completion stats)
- AudioRecorder.jsx (spoken practice recording)

Sidebar.jsx shall display:
- Current goal name and stage progress (1-5)
- Goal History Timeline: ordered list of completed goals with completion date and avg rating
- Confidence badge (Low/Medium/High)
- Rating trajectory across goals

#### 3.3.2 Hardware Interfaces
The system shall run on standard web browsers with internet connectivity.

#### 3.3.3 Software Interfaces
- Frontend: React + Vite, Tailwind CSS v3
- Backend: Python FastAPI with Groq API integration
- Storage: Browser localStorage
- Version Control: Git/GitHub

POST /api/transcribe — receives audio file, calls Groq Whisper, returns transcript text. Transcript is then processed by existing /api/chat feedback endpoint.

POST /api/analyze-audio — receives audio file, calls AssemblyAI transcription + audio intelligence, returns acoustic metrics JSON including pace, talk time, filler words, and pause data.

#### 3.3.4 Communication Interfaces
The system shall communicate with Groq API via HTTPS for AI functionality.

## 4. Other Requirements

### 4.1 Database Schema
The system uses Supabase (PostgreSQL). The following tables are required:

| Table               | Purpose |
|---------------------|---------|
| profiles            | User onboarding data, focus areas, context, baseline submission |
| goals               | User goals, status (active/completed) |
| study_plans         | AI-generated stage plans per goal |
| sessions            | Individual SPARK→PRACTICE loops |
| submissions         | Written practice responses + AI feedback + AI score |
| review_requests     | Human review requests with status and expiry tracking |
| reviews             | Completed human reviews + learner rating of reviewer |
| reviewer_profiles   | Tier, verified status, avg rating, suspension status |

Full schema definition is maintained separately in docs/schema.sql.

Supabase Storage bucket: audio-submissions
- RLS: users access own audio only
- Reviewers access audio linked to assigned review_request only
- Audio auto-expires after 90 days

### 4.2 Performance Requirements
The application shall load initial content within 3 seconds on standard broadband connections.

AI feedback generation shall complete within 10 seconds for 90% of requests (see Section 3.2.1).

### 4.3 Security Requirements
No user data shall be transmitted to external services except for necessary AI processing.

All API communications shall use HTTPS.

### 4.4 Usability Requirements
The system shall provide clear error messages and recovery options.

The interface shall be responsive and work on desktop screen sizes (Chrome, latest version).

### 4.5 Future Scope
The following features are explicitly out of scope for MVP but may be considered for future development:
- Mobile app
- Video recording and review
- Algorithmic content discovery
- Language learning
- Community/social features
- Monetization/payments
- XP/streaks
- Push notifications
- Email notifications
- Visual/nonverbal sessions (video recording) — requires validated human review system and is explicitly post-MVP.

### 4.6 Success Metrics
The first milestone shall be 10 users who return for a second session without being asked by the founder.

### 4.7 Implementation Phases

Phase 1 — Foundation
Rename project, delete legacy files, build data/content.js and data/curriculum.js

Phase 2 — Onboarding  
OnboardingFlow.jsx, useStudyPlan.js, useContent.js

Phase 3 — Core Session Loop
SparkCard, LessonCard, SubmissionPanel, FeedbackPanel, ConfidenceBadge

Phase 4 — Human Review
ReviewerQueue.jsx, review request flow, reviewer rating system

Phase 5 — Completion Flow
ContinuityCard, ShareableDashboard, next goal suggestion flow

## 5. Appendices

### 5.1 Glossary
- **Situated Learning**: A theory by Jean Lave (1988) that learning is most effective when embedded in authentic activity, real context, and real culture.
- **Session Loop**: The core sequence of every learning session: SPARK → LEARN → PRACTICE → AI FEEDBACK → (optional) HUMAN REVIEW.
- **Spark**: The step where the app surfaces one piece of curated content (article, video clip, podcast excerpt) mapped to the user's current study plan stage.
- **Confidence Score**: A weighted metric (40% AI assessment, 40% human ratings, 20% consistency) displayed as Low/Medium/High badge, not based on session count.
- **Baseline Submission**: The initial 150-word response written during onboarding, stored as a benchmark for future progress comparison without evaluation.
- **Tier 1 Reviewer (Peer)**: Reviewers eligible after completing one full goal cycle, can review beginner-level content submissions, rated by learners.
- **Tier 2 Reviewer (Verified)**: Application-based reviewers who can review all content levels, receive verified badge and credibility benefits.
- **Goal History**: An ordered list of completed and active goals, showing progression through goal sophistication rather than levels.
- **Continuity Card**: A screen shown after goal completion summarizing the previous goal outcome, selected next goal, rationale, and transition actions.
- **Shareable Dashboard**: A public URL generated upon goal completion displaying stats only (sessions completed, AI confidence score, human ratings, peer reviews given, goal history, verified badge).
- **contentLevel**: An internal metadata field (beginner/intermediate/advanced) used for content filtering and reviewer access gating, never displayed to users.

### 5.2 Resolved TBDs
No open TBDs remain as of v0.3. All 9 TBDs have been resolved and patched into their respective sections.

| TBD   | Topic                                      | Status   |
|-------|--------------------------------------------|----------|
| TBD-1 | SRS audience scope                         | RESOLVED |
| TBD-2 | AI feedback response time threshold        | RESOLVED |
| TBD-3 | Browser support scope                      | RESOLVED |
| TBD-4 | localStorage retention policy              | RESOLVED |
| TBD-5 | Review request 48-hour expiry behavior     | RESOLVED |
| TBD-6 | WCAG 2.1 AA accessibility compliance       | RESOLVED |
| TBD-7 | Groq API unavailability fallback behavior  | RESOLVED |
| TBD-8 | Content mapping scalability (deferred)     | RESOLVED — deferred to post-MVP, no action required |
| TBD-9 | Self-reported level selector in onboarding | RESOLVED — removed entirely |