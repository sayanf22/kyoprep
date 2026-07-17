# KyoPrep Admin Panel — Design Spec

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Sections 5, 6, 9.*
*Domain: **kyoprep.in***

---

## 1. Purpose

Internal-only admin panel for managing KyoPrep's content, users, and platform operations. Accessible at `/admin` (protected by role-based middleware — only `admin` and `reviewer` roles). Not exposed to regular users.

This panel is the **single interface** for both human-created and AI-pipeline content. There is no separate "AI dashboard" — everything flows through the same review queue.

---

## 2. Navigation & Layout

### Sidebar Navigation

| Nav Item | Icon | Access |
|---|---|---|
| Dashboard | 📊 | Admin, Reviewer |
| Question Bank | 📝 | Admin, Reviewer |
| Review Queue | ✅ | Admin, Reviewer |
| Test Builder | 🧪 | Admin |
| AI Content Assistant | 🤖 | Admin |
| User Management | 👥 | Admin only |
| Exam Notifications | 🔔 | Admin |
| Analytics | 📈 | Admin |
| Settings | ⚙️ | Admin only |

### Layout

- **Desktop-only** (admin panel doesn't need mobile responsiveness — it's an internal tool).
- Fixed sidebar (240px) + scrollable main content area.
- Same green/white theme as the public site, but with a light gray (#F8FAFC) background for the workspace to visually distinguish admin from user-facing pages.
- Breadcrumb navigation at top of main content.

---

## 3. Module Specifications

### 3.1 Dashboard

Overview metrics for at-a-glance platform health:

| Metric Card | Data Source |
|---|---|
| Total Users | `Users` table count |
| Active Trials | `Users` where `trial_end > now()` |
| Paid Subscribers | `Subscriptions` where `status = 'active'` |
| Questions in Bank | `Questions` table count |
| Pending Reviews | `Questions` where `status = 'pending_review'` |
| User Reports | `QuestionReports` where `status = 'open'` |
| Waitlist Signups | `waitlist_signups` table count |

Charts:
- Signups over time (line chart, 30-day default).
- Subscription tier distribution (donut chart).
- Daily active users (line chart).
- Content creation velocity (questions published per week).

### 3.2 Question Bank Manager

CRUD interface for the `Questions` table. This is the core content management tool.

#### Question Schema (aligned with Section 8 data model)

```typescript
interface Question {
  id: string;                    // UUID
  exam_id: string;               // FK → Exams
  subject_id: string;            // FK → Subjects
  chapter_id: string;            // FK → Chapters
  
  // Multilingual content (Section 12)
  question_text_en: string;
  question_text_bn: string;
  question_text_hi?: string;     // Hindi — v1 stretch
  question_text_kok?: string;    // Kokborok — per-exam only
  
  options_en: string[];          // 4 options
  options_bn: string[];
  options_hi?: string[];
  options_kok?: string[];
  
  correct_option: number;        // 0-indexed
  
  solution_en: string;
  solution_bn: string;
  solution_hi?: string;
  
  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  source_type: 'official_pyq' | 'ai_drafted' | 'manual' | 'user_contributed';
  source_year?: number;          // For PYQs
  citation?: string;             // Source URL or reference
  tags: string[];                // Auto-tagged by AI (Section 6.7)
  
  // Review pipeline
  status: 'draft' | 'ai_generated' | 'pending_review' | 'approved' | 'rejected' | 'reported';
  risk_score?: number;           // 0-100, AI-assigned (Section 5B review gate)
  reviewer_notes?: string;
  reviewed_by?: string;          // FK → Users (reviewer)
  reviewed_at?: string;
  
  created_at: string;
  updated_at: string;
}
```

#### UI Features

- **List view**: Filterable by exam, subject, chapter, status, source_type, difficulty. Sortable by date, risk_score.
- **Bulk import**: CSV/JSON upload with schema validation. Maps columns to question fields.
- **Multilingual editor**: Side-by-side panels showing EN / BN / HI for the same question. Markdown support for formatting.
- **Preview mode**: Shows the question exactly as a student would see it (with option buttons, timer placeholder, solution drawer).
- **Status badges**: Color-coded — green (approved), amber (pending_review), red (rejected/reported), blue (draft), purple (ai_generated).

### 3.3 Risk-Ranked Review Queue

**The highest-leverage design decision in the entire content system** (Section 5B).

This is NOT a simple FIFO list. Items are sorted by `risk_score` (highest first) so the one human reviewer spends time where it matters most.

#### Risk Scoring Logic (AI-assigned via Claude Haiku 4.5)

| Factor | Risk Weight | Rationale |
|---|---|---|
| Tripura-specific fact claim (GK) | +40 | Can't be verified mechanically |
| Low-confidence translation | +25 | Bengali/Hindi fluency varies |
| New/thin source | +20 | No citation or weak reference |
| AI-drafted (no PYQ source) | +15 | Model hallucination risk |
| User-reported error | +30 | Crowdsourced signal — users found a real issue |
| Maths/reasoning (checkable answer) | −20 | Mechanically verifiable |
| Direct PYQ extraction (OCR) | −10 | Copied from official source |

#### Queue UI

- Sorted by risk_score descending (highest risk first).
- Each item shows: question preview, risk_score badge (red/amber/green), source_type, flags.
- **User reports** (from the "report-a-question-error" button, Section 3) appear in this SAME queue with their risk boosted by +30 — they are NOT a separate system.
- Reviewer actions: **Approve**, **Edit & Approve**, **Reject** (with reason), **Flag for Re-draft**.
- Batch actions for low-risk items: "Approve all items with risk_score < 15" (with confirmation).

### 3.4 Test Builder

Create tests from the question bank:

| Test Type | Configuration |
|---|---|
| Chapter-wise | Select exam → subject → chapter. Auto-populate from approved questions. Set question count, time limit. |
| Sectional | Select exam → subject. Pull from multiple chapters. |
| Full Mock | Match real exam pattern (question count, sections, timing, negative marking rules). |
| PYQ | Select exam + year. Auto-populated from `source_type = 'official_pyq'`. |
| Daily Quiz | Configure question count (typically 10), difficulty mix, topic rotation. Can be auto-generated. |
| Live Test | Schedule date/time, set registration window, configure single-attempt + batch-ranking rules. |

#### Test Schema

```typescript
interface Test {
  id: string;
  exam_id: string;
  type: 'chapter' | 'sectional' | 'full_mock' | 'pyq' | 'daily_quiz' | 'live';
  title_en: string;
  title_bn: string;
  question_ids: string[];
  duration_minutes: number;
  total_marks: number;
  negative_marking: number;       // e.g., -0.25 per wrong answer
  is_published: boolean;
  
  // Live test specific
  scheduled_at?: string;          // ISO datetime
  registration_deadline?: string;
  is_downloadable: boolean;       // false for live tests, true for others
  
  // Tier gating (Section 4)
  min_tier: 1 | 2 | 3;
  
  created_by: string;
  created_at: string;
}
```

### 3.5 AI Content Assistant

Two modes, both calling Claude via Amazon Bedrock (Section 6, 7):

#### Research Mode (Track A — PYQ Extraction)

1. **Input**: Upload scanned question paper (PDF/image).
2. **Processing**: Claude vision reads the paper → extracts questions, options, answers into structured JSON.
3. **Output**: Extracted questions pre-filled in the question editor, status = `ai_generated`, auto-tagged with exam/year/subject.
4. **Review**: All extracted items route to the review queue. Provisional answer keys flagged for re-sync once final keys are published.

#### Draft Mode (Track B — AI-Generated Content)

1. **Input**: Select exam → subject → chapter. Specify count and difficulty mix.
2. **Processing**: Claude Sonnet 5 drafts questions matched to official syllabus patterns.
3. **Fact verification**: Every Tripura-specific claim gets a live search step (TinyFish/AgentQL for official sources). Questions that can't be verified are flagged.
4. **Output**: Generated questions with risk_scores pre-assigned, routed to review queue.

#### Model Selection (Section 7)

| Task | Model | Rationale |
|---|---|---|
| Question drafting | Claude Sonnet 5 | Quality-sensitive |
| PYQ extraction (vision) | Claude Sonnet 5 | Accuracy on scanned docs |
| Risk scoring | Claude Haiku 4.5 | High-volume, low-complexity |
| Auto-tagging | Claude Haiku 4.5 | High-volume |
| Translation drafts | Claude Haiku 4.5 | Initial pass, human-reviewed |

### 3.6 User Management

| Feature | Details |
|---|---|
| User list | Searchable/filterable by name, email, role, subscription tier, trial status |
| Role assignment | Dropdown: user, early_tester, reviewer, admin |
| Subscription management | View/modify tier, apply manual discounts, extend trial |
| User detail | Exam preferences, attempt history, streak status, subscription history |

### 3.7 Exam Notifications Manager

Manage the `ExamNotifications` table (Section 3):

- **CRUD** for notifications: title, source URL, dates, category (vacancy/deadline/admit-card/result).
- **Auto-import**: Track A monitoring pulls from official sites → creates draft notifications → admin reviews and publishes.
- Categories: Vacancy Alert, Application Deadline, Admit Card, Result, Other.

### 3.8 Analytics

Platform-level metrics (not per-user — that's the student-facing Progress tab):

| Metric | Purpose |
|---|---|
| Most-missed questions | Content quality signal — if everyone gets it wrong, the question might be bad |
| Completion rates by test type | Are full mocks too long? Are daily quizzes engaging? |
| Subject-wise accuracy distribution | Identifies content gaps |
| Subscription conversion rates | Trial → paid, tier upgrades |
| Streak completion rate | Is the 70% discount mechanic working? |
| AI content pipeline throughput | Questions generated vs. approved vs. rejected |
| Revenue metrics | MRR, churn, ARPU by tier |

---

## 4. Security & Access Control

### Route Protection

```typescript
// middleware.ts (admin routes)
if (path.startsWith('/admin')) {
  if (!session) → redirect to login
  if (user.role !== 'admin' && user.role !== 'reviewer') → 403 Forbidden
  if (user.role === 'reviewer' && restrictedAdminRoute(path)) → 403 Forbidden
}
```

### RLS Policies (Supabase)

- `Questions`: Admins/reviewers can read all. Only admins can insert/update/delete. Status transitions enforced at the function level.
- `Tests`: Admins can CRUD. Reviewers can read.
- `Users`: Admins can read/update roles. Reviewers cannot access.
- `waitlist_signups`: Admins can read. No one can delete (append-only).

### Audit Trail

Every admin action (question edit, status change, test publish, role change) writes to an `AdminAuditLog` table:

```sql
CREATE TABLE admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,          -- e.g., 'question.approve', 'test.publish', 'user.role_change'
  target_type TEXT NOT NULL,     -- e.g., 'question', 'test', 'user'
  target_id UUID NOT NULL,
  details JSONB,                 -- Before/after state, notes
  created_at TIMESTAMPTZ DEFAULT now()
);
```
