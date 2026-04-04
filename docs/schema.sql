-- =============================================================
-- Situo — Supabase PostgreSQL Schema
-- Version: v0.5 | April 5, 2026
-- Maintained by: Hassan
-- =============================================================
-- Enable UUID generation extension (already on in Supabase)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLE: profiles
-- Stores user onboarding data. One row per authenticated user.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_areas     TEXT[] NOT NULL DEFAULT '{}',   -- e.g. ['Storytelling', 'Clarity and conciseness']
  context         TEXT NOT NULL,                  -- 'Professional' | 'Social' | 'Both'
  baseline_text   TEXT NOT NULL,                  -- 150-word baseline submission (no evaluation)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ─────────────────────────────────────────────────────────────
-- TABLE: goals
-- Tracks the user's learning goals, one active at a time.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_text       TEXT NOT NULL,
  focus_areas     TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user_id   ON goals(user_id);
CREATE INDEX idx_goals_status    ON goals(status);

-- ─────────────────────────────────────────────────────────────
-- TABLE: study_plans
-- AI-generated 5-stage plan per goal. Each row = one stage.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE study_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id         UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage           INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
  focus_area      TEXT NOT NULL,
  content_id      TEXT NOT NULL,   -- references id in data/content.js (no DB table for content in MVP)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (goal_id, stage)
);

CREATE INDEX idx_study_plans_goal_id ON study_plans(goal_id);
CREATE INDEX idx_study_plans_user_id ON study_plans(user_id);

-- ─────────────────────────────────────────────────────────────
-- TABLE: sessions
-- One row per SPARK→PRACTICE loop the user completes.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id         UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  stage           INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
  content_id      TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_goal_id ON sessions(goal_id);

-- ─────────────────────────────────────────────────────────────
-- TABLE: submissions
-- Written practice responses + AI feedback stored per session.
-- RLS is enforced on this table (see policies below).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id         UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  response_text   TEXT NOT NULL,                  -- 150-300 word practice response
  ai_feedback     JSONB,                          -- structured AI feedback object
  ai_score        NUMERIC(4,2),                   -- 0.00-100.00 AI assessment score
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_user_id    ON submissions(user_id);
CREATE INDEX idx_submissions_goal_id    ON submissions(goal_id);
CREATE INDEX idx_submissions_session_id ON submissions(session_id);

-- RLS on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: owners can read and insert their own submissions
CREATE POLICY submissions_owner_read
  ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY submissions_owner_insert
  ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: reviewers may only read a submission that is linked to a
-- review_request explicitly assigned to them with status 'assigned'.
-- No application-level workaround can override this.
CREATE POLICY submissions_reviewer_read
  ON submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM   review_requests rr
      WHERE  rr.submission_id  = submissions.id
        AND  rr.reviewer_id    = auth.uid()
        AND  rr.status         = 'assigned'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- TABLE: review_requests
-- Tracks human review requests, assignment, expiry, and status.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE review_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id     UUID REFERENCES auth.users(id),          -- NULL until assigned
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'assigned', 'completed', 'expired')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_requests_user_id      ON review_requests(user_id);
CREATE INDEX idx_review_requests_reviewer_id  ON review_requests(reviewer_id);
CREATE INDEX idx_review_requests_submission_id ON review_requests(submission_id);
CREATE INDEX idx_review_requests_status       ON review_requests(status);

-- ─────────────────────────────────────────────────────────────
-- TABLE: reviews
-- Stores completed human reviews and the learner's rating.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_request_id   UUID NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
  submission_id       UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_text         TEXT NOT NULL,
  strengths           TEXT,
  improvements        TEXT,
  learner_rating      INTEGER CHECK (learner_rating BETWEEN 1 AND 5),  -- optional, prompted once
  rating_submitted_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_reviewer_id        ON reviews(reviewer_id);
CREATE INDEX idx_reviews_learner_id         ON reviews(learner_id);
CREATE INDEX idx_reviews_review_request_id  ON reviews(review_request_id);

-- ─────────────────────────────────────────────────────────────
-- TABLE: reviewer_profiles
-- One row per user who has accepted a reviewer role.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE reviewer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                INTEGER NOT NULL DEFAULT 1 CHECK (tier IN (1, 2)),
  is_verified         BOOLEAN NOT NULL DEFAULT false,   -- true = Tier 2 verified badge
  is_suspended        BOOLEAN NOT NULL DEFAULT false,   -- suspended when avg rating < 3.5
  avg_rating          NUMERIC(3,2),                     -- recalculated on each new review
  total_reviews       INTEGER NOT NULL DEFAULT 0,
  invited_at          TIMESTAMPTZ,
  verified_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- ─────────────────────────────────────────────────────────────
-- TABLE: diagnostics
-- One row per diagnostic submission (baseline and re-test).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  submission_text TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  growth_areas TEXT[] NOT NULL DEFAULT '{}',
  patterns TEXT[] NOT NULL DEFAULT '{}',
  recommended_focus TEXT[] NOT NULL DEFAULT '{}',
  submission_type TEXT NOT NULL 
    CHECK (submission_type IN ('baseline', 'retest')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diagnostics"
  ON diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics"
  ON diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET: audio-submissions
-- Auto-expire: 90 days
-- Access: private (RLS enforced)
-- File naming: {user_id}/{session_id}.webm
-- ─────────────────────────────────────────────────────────────


CREATE INDEX idx_reviewer_profiles_user_id ON reviewer_profiles(user_id);
CREATE INDEX idx_reviewer_profiles_tier    ON reviewer_profiles(tier);