# KyoPrep Data Model & Security Architecture — Design Spec

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Sections 4, 7, 8, 14.*
*Domain: **kyoprep.in***

---

## 1. Tech Stack Summary (Section 7)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (PWA) | App Router, TypeScript, hosted on Vercel |
| Backend/DB | Supabase (Postgres) | RLS enforces tier-gating at the data layer |
| Auth | Supabase Auth | Email/password, HttpOnly cookies via `@supabase/ssr` |
| Storage | Supabase Storage | Question images, scanned PYQ papers, user avatars |
| AI | Amazon Bedrock (Claude) | **Only AWS service used.** Sonnet 5 for quality, Haiku 4.5 for volume |
| Web Extraction | TinyFish / AgentQL | Official exam-board sites for PYQs and notifications |
| Payments | Razorpay | Trial → paid conversion, streak discount |
| Hosting | Vercel | Pairs with Next.js, Edge Functions on Supabase side |

---

## 2. Complete Data Model (Section 8)

### 2.1 Users & Authentication

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'early_tester', 'reviewer', 'admin')),
  
  -- Trial (Section 11)
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'none'
    CHECK (subscription_tier IN ('none', 'trial', 'tier_1', 'tier_2', 'tier_3')),
  
  -- Profile
  preferred_language TEXT DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'bn', 'hi')),
  avatar_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exam preferences from onboarding (Section 3)
CREATE TABLE user_exam_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exam_id)
);
```

### 2.2 Exam Structure

```sql
-- Exams (Section 2 taxonomy)
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  body TEXT NOT NULL,              -- 'JRBT', 'TPSC', 'TRBT', 'Police', 'Forest', 'TSR'
  name TEXT NOT NULL,              -- 'Group C', 'Combined Competitive', 'T-TET Paper I', etc.
  slug TEXT NOT NULL UNIQUE,       -- URL-safe identifier
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  rollout_priority INTEGER,        -- Build order from Section 2
  
  -- Language availability (Section 12 — per-exam, NOT global)
  available_languages TEXT[] DEFAULT '{en,bn}',  -- e.g., '{en,bn,hi,kok}' for T-TET
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  name_hi TEXT,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(exam_id, slug)
);

-- Chapters
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  name_hi TEXT,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(subject_id, slug)
);
```

### 2.3 Questions (Section 5, 8)

```sql
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id),
  subject_id UUID REFERENCES subjects(id),
  chapter_id UUID REFERENCES chapters(id),
  
  -- Multilingual content (Section 12)
  question_text_en TEXT NOT NULL,
  question_text_bn TEXT NOT NULL,
  question_text_hi TEXT,
  question_text_kok TEXT,         -- Per-exam only (T-TET, Forest Dept)
  
  options_en TEXT[] NOT NULL,     -- Array of 4 options
  options_bn TEXT[] NOT NULL,
  options_hi TEXT[],
  options_kok TEXT[],
  
  correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  
  solution_en TEXT,
  solution_bn TEXT,
  solution_hi TEXT,
  
  -- Metadata
  difficulty TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source_type TEXT NOT NULL
    CHECK (source_type IN ('official_pyq', 'ai_drafted', 'manual', 'user_contributed')),
  source_year INTEGER,            -- For PYQs
  citation TEXT,                  -- URL or reference
  tags TEXT[] DEFAULT '{}',       -- AI auto-tagged (Section 6.7)
  
  -- Review pipeline (Section 5B review gate)
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ai_generated', 'pending_review', 'approved', 'rejected', 'reported')),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Image support (optional question/option images)
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_risk_score ON questions(risk_score DESC);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
```

### 2.4 Tests & Attempts

```sql
CREATE TABLE tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id),
  type TEXT NOT NULL
    CHECK (type IN ('chapter', 'sectional', 'full_mock', 'pyq', 'daily_quiz', 'live')),
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  title_hi TEXT,
  
  question_ids UUID[] NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks NUMERIC NOT NULL,
  negative_marking NUMERIC DEFAULT 0,  -- e.g., -0.25
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  is_downloadable BOOLEAN DEFAULT true,  -- FALSE for live tests (Section 3)
  
  -- Live test specific (Section 3)
  scheduled_at TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  results_published BOOLEAN DEFAULT false,
  
  -- Tier gating (Section 4)
  min_tier INTEGER DEFAULT 1 CHECK (min_tier BETWEEN 1 AND 3),
  
  -- Linkage
  chapter_id UUID REFERENCES chapters(id),  -- For chapter-wise tests
  subject_id UUID REFERENCES subjects(id),  -- For sectional tests
  source_year INTEGER,                       -- For PYQ tests
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  answers JSONB NOT NULL DEFAULT '[]',    -- [{question_id, selected_option, time_spent_seconds}]
  
  score NUMERIC,
  total_correct INTEGER,
  total_wrong INTEGER,
  total_skipped INTEGER,
  
  -- Live test ranking (computed in batch after close)
  rank INTEGER,
  percentile NUMERIC,
  
  -- Prevent multiple live test attempts
  UNIQUE(user_id, test_id) -- Enforced for live tests; regular tests allow retakes via app logic
);

CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_test ON attempts(test_id);
```

### 2.5 Bookmarks & Progress

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE leaderboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  rank INTEGER,
  computed_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.6 Subscriptions & Usage (Sections 4, 11)

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
  
  -- Razorpay
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  
  -- Discount (Section 11 streak mechanic)
  discount_applied BOOLEAN DEFAULT false,
  discount_percent INTEGER DEFAULT 0,
  discount_reason TEXT,            -- 'trial_streak_complete'
  
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_active INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tier configuration (feature flags/caps per tier, Section 4)
CREATE TABLE tier_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier INTEGER NOT NULL UNIQUE CHECK (tier BETWEEN 1 AND 3),
  
  chapter_tests_per_month INTEGER,       -- NULL = unlimited
  full_mocks_per_month INTEGER,
  sectional_tests_per_month INTEGER,     -- 0 = disabled for Tier 1
  pyq_years_available INTEGER,           -- 1 = most recent only
  live_test_access TEXT,                  -- 'view_only', 'limited', 'unlimited'
  daily_quiz_type TEXT,                   -- 'limited', 'full', 'adaptive'
  pdf_downloads_per_month INTEGER,       -- 0 = disabled
  solution_detail TEXT,                   -- 'basic', 'full'
  performance_analysis TEXT,             -- 'score_only', 'full', 'full_plus_ai'
  leaderboard_access TEXT,               -- 'view', 'participate', 'full'
  ai_chat_queries_per_day INTEGER,       -- 0 = disabled
  current_affairs_frequency TEXT,         -- 'monthly', 'weekly', 'daily'
  available_languages TEXT[],            -- '{en,bn}', '{en,bn,hi}', '{en,bn,hi,kok}'
  
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.7 AI & Content Pipeline (Section 5, 6)

```sql
CREATE TABLE ai_generation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,                   -- 'pyq_extraction', 'question_draft', 'translation', 'tagging', 'risk_scoring', 'doubt_chat'
  model TEXT NOT NULL,                    -- 'claude-sonnet-5', 'claude-haiku-4.5'
  input_summary TEXT,                     -- Brief description of input
  output_question_ids UUID[],            -- Questions created/modified
  tokens_used INTEGER,
  cost_estimate_usd NUMERIC,
  initiated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE question_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,                   -- 'wrong_answer', 'unclear_question', 'translation_error', 'outdated', 'other'
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'fixed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports route into the same review queue as AI content (Section 3, 5B)
-- When a report is created, the linked question's risk_score is boosted by +30
```

### 2.8 Exam Notifications (Section 3)

```sql
CREATE TABLE exam_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id),
  category TEXT NOT NULL
    CHECK (category IN ('vacancy', 'deadline', 'admit_card', 'result', 'other')),
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  source_url TEXT,                        -- Official source link
  event_date DATE,                        -- When this event occurs/closes
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.9 Waitlist (Pre-Launch)

```sql
CREATE TABLE waitlist_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  target_exams TEXT[] NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT true,
  signed_up_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT,                           -- SHA-256 of IP, not raw
  source TEXT DEFAULT 'landing_page'
);
```

### 2.10 Admin Audit Log

```sql
CREATE TABLE admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Row Level Security (RLS) Policies

### Principle: Deny by default, tier-gate at the data layer (Section 7).

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Example: Users can only read their own data
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Example: Questions — only approved questions visible to regular users
CREATE POLICY "questions_read_approved" ON questions
  FOR SELECT USING (
    status = 'approved'
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Example: Attempts — users can only see their own
CREATE POLICY "attempts_own" ON attempts
  FOR ALL USING (auth.uid() = user_id);

-- Example: Tier-gated PYQ access
-- (Enforced via Edge Function that checks user's subscription_tier against tier_config
-- before returning questions — RLS alone can't encode the full tier logic, but the
-- function-level check + RLS together provide defense in depth)

-- Waitlist: anonymous INSERT only, admin SELECT only
CREATE POLICY "waitlist_insert_anon" ON waitlist_signups
  FOR INSERT WITH CHECK (true);  -- Rate limiting handled at the API layer
CREATE POLICY "waitlist_read_admin" ON waitlist_signups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 4. API Security

### Input Validation

Every API endpoint uses **Zod schemas** for request validation. Reject first, process second.

```typescript
// Example: Waitlist signup schema
import { z } from 'zod';

export const WaitlistSignupSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(2).max(100).trim(),
  target_exams: z.array(z.string()).min(1),
  consent: z.literal(true),
  honeypot: z.string().max(0),  // Must be empty
});
```

### Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/waitlist` | 3 per IP | 15 min |
| `POST /auth/login` | 5 per IP | 15 min |
| `POST /auth/signup` | 3 per IP | 15 min |
| `POST /api/doubt-chat` | Per tier config | Per day |
| `GET /api/questions/*` | 60 per user | 1 min |
| Admin endpoints | 30 per user | 1 min |

### PDF Watermarking (Section 3)

```
Generation flow:
1. User requests PDF download → Edge Function
2. Function checks: user is authenticated, has sufficient tier, test is downloadable
3. Generate PDF server-side with questions + solutions
4. Composite dynamic watermark: user name, email, download timestamp (ISO 8601)
5. Return watermarked PDF — never a pre-generated static file
6. Log download in audit trail
```

---

## 5. Payments — Razorpay Integration (Section 7)

### Flow

```
1. Trial expires → paywall appears (with or without 70% streak discount)
2. User selects tier → Razorpay checkout opens
3. Payment success → webhook to /api/webhooks/razorpay
4. Webhook handler:
   a. Verify signature (Razorpay webhook secret)
   b. Create/update Subscriptions row
   c. Update Users.subscription_tier
   d. If discount applied, log in Subscriptions.discount_reason
5. Payment failure → retry logic (Razorpay handles retries)
6. Subscription renewal → same webhook flow
7. Cancellation → set Subscriptions.status = 'cancelled', downgrade access
```

### Webhook Security

- Verify Razorpay signature on every webhook call.
- Idempotency: Use `razorpay_payment_id` as dedup key.
- Webhook endpoint rate-limited but not IP-restricted (Razorpay IPs can change).

---

## 6. Legal Requirements (Section 14)

All of these must be live before any real signups:

| Document | Status | Notes |
|---|---|---|
| Terms of Service | Required Sprint 1 | Standard SaaS terms, India jurisdiction |
| Privacy Policy | Required Sprint 1 | DPDP Act compliance — what data is collected, how stored, how deleted |
| Refund/Cancellation Policy | Required Sprint 1 | Subscription cancellation, prorated refunds |
| Non-affiliation Disclaimer | Required Sprint 1 | "KyoPrep is independent and not affiliated with or endorsed by TPSC, JRBT, TRBT, or the Government of Tripura." Visible on landing page footer and signup flow |

---

## 7. Security Checklist

### Authentication
- [x] Supabase Auth (bcrypt password hashing)
- [x] Email verification required
- [x] HttpOnly + SameSite=Strict cookies
- [x] Brute-force rate limiting (5 login attempts / 15 min)
- [x] Password reset via Supabase's time-limited token flow

### Data Access
- [x] RLS on every table — deny by default
- [x] Tier-gating enforced at data layer + API layer (defense in depth)
- [x] Admin routes protected by role check in middleware + RLS
- [x] Audit log for all admin actions

### Input Security
- [x] Zod validation on every API endpoint
- [x] Honeypot on public forms (waitlist)
- [x] Rate limiting on all public endpoints
- [x] File upload validation (type, size) for question images

### AI Pipeline
- [x] Bedrock-only AWS (no other AWS services)
- [x] AI content never auto-published — always routes through review queue
- [x] AI generation logged in `ai_generation_log` (cost tracking, audit)
- [x] Fact verification step for Tripura-specific claims

### Infrastructure
- [x] HTTPS everywhere (Vercel + Supabase enforce this)
- [x] Environment variables for all secrets (never committed to repo)
- [x] Supabase service role key used only server-side, never exposed to client
- [x] PDF watermarks generated server-side, never client-side
