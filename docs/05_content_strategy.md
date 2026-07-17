# KyoPrep Content Strategy — Design Spec

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Sections 2, 5, 6, 12.*
*Domain: **kyoprep.in***

---

## 1. Two Workstreams — Do Not Conflate

The master plan (Section 5) defines two **completely separate** content pipelines:

| | Workstream A: Bootstrap Seeding | Workstream B: Production AI Pipeline |
|---|---|---|
| **When** | During development (build-time) | After launch (ongoing) |
| **Who** | The AI coding agent + developer | Admin panel operators |
| **Where** | Directly into Supabase via scripts/migrations | Via the admin panel UI |
| **What** | One-time population of real PYQ content | Continuous content growth — PYQ extraction + AI drafting |
| **Review** | Developer sanity check | Risk-ranked review queue with human reviewer |
| **Output** | Launch-ready question bank | Incremental question additions |

Both use the same `Questions` table schema. Workstream A content is real from day one — it's not throwaway seed data.

---

## 2. Workstream A — Bootstrap Seeding (Build-Time)

### Purpose

Ensure the app launches with actual content, not an empty database. This runs during Sprint 2 (Section 13).

### Sources

| Source | Availability | Approach |
|---|---|---|
| **TPSC past papers** | Confirmed, direct archive exists | Scrape + Claude vision extraction |
| **TRBT T-TET past papers** | Confirmed, direct archive exists | Same extraction pipeline |
| **JRBT past papers** | Partial — expect gaps | Attempt extraction; pursue RTI request in parallel |
| **Forest Guard** | Recent drive (2026) | Extract from notification + similar JRBT content reuse |

### Process

1. **Identify official sources** — TPSC website, TRBT portal, JRBT notifications.
2. **Download scanned papers** — PDF/image format.
3. **Claude vision extraction** — Run through Bedrock (Sonnet 5) to extract structured question data.
4. **Format into schema** — Map to `Questions` table fields (multilingual, tagged, cited).
5. **Developer review** — Sanity check accuracy, fix obvious OCR errors.
6. **Insert into Supabase** — Via migration scripts or seed files.
7. **Tag and organize** — Auto-tag with exam/subject/chapter via Claude Haiku 4.5.

### Bootstrap Coverage Target

| Exam | Target Questions | Notes |
|---|---|---|
| JRBT Group C | 200–400 | Core Maths, Reasoning, English, GK |
| JRBT Group D | 100–200 | Subset of Group C, simpler |
| TPSC Combined | 300–500 | Broader syllabus, multi-section |
| T-TET Paper I | 150–300 | Child Development, Language, Maths, EVS |
| T-TET Paper II | 150–300 | Subject-specific + pedagogy |

These are minimum launch targets. Quality over quantity — better to have 200 solid questions than 500 mediocre ones.

---

## 3. Workstream B — Production AI Pipeline (Post-Launch)

### Track A: Official PYQ Extraction

Ongoing extraction of new past papers as they're released:

1. **Monitor official sources** — TinyFish/AgentQL structured scraper watches TPSC, TRBT, JRBT portals.
2. **New paper detected** → admin notified via dashboard.
3. **Admin uploads paper** to the AI Content Assistant (Research Mode in admin panel).
4. **Claude Sonnet 5 vision** extracts questions → structured JSON.
5. **Auto-populated** into question editor with `status = 'ai_generated'`, `source_type = 'official_pyq'`.
6. **Risk-scored** by Claude Haiku 4.5 (typically low risk since source is official).
7. **Routes to review queue** → reviewer approves/edits.

**Provisional answer key handling**: When an exam body publishes a provisional key, questions are tagged `answer_key_status = 'provisional'`. After the official challenge window closes and the final key is published, questions are re-synced and the tag updated to `'final'`.

### Track B: AI-Drafted Content

Fills volume gaps, especially for JRBT where PYQ archives are incomplete:

1. **Admin selects** exam → subject → chapter in the AI Content Assistant (Draft Mode).
2. **Specifies** count, difficulty mix, target patterns.
3. **Claude Sonnet 5 drafts** questions matched to official syllabus.
4. **Fact verification step** — every Tripura-specific claim gets a live search:
   - "When was Tripura's statehood day?" → search official source → verify/cite.
   - Questions that can't be verified are flagged (`fact_verified = false`).
   - **No GK question ships on model memory alone** (Section 5B).
5. **Risk-scored** (typically higher than PYQs — AI-drafted content has hallucination risk).
6. **Routes to review queue** → reviewer reviews, edits, approves/rejects.

### The Review Gate (Section 5B)

**One reviewer** — so the queue must be smart:

#### Risk-Ranked Queue (NOT FIFO)

| Priority | Content Type | Typical Risk Score | Reviewer Effort |
|---|---|---|---|
| 🔴 High | Tripura GK with thin sources | 60–100 | Full verification |
| 🔴 High | User-reported errors | 50–80 (boosted +30) | Investigate and fix |
| 🟡 Medium | AI-drafted general questions | 30–55 | Moderate review |
| 🟡 Medium | Low-confidence translations | 35–60 | Language check |
| 🟢 Low | Maths/reasoning (checkable) | 5–25 | Quick verify |
| 🟢 Low | Direct PYQ extraction (official) | 0–15 | Spot check |

#### Reviewer Actions

- **Approve** — question goes live.
- **Edit & Approve** — fix and publish in one step.
- **Reject** — with reason. Question archived, not deleted.
- **Flag for Re-draft** — send back to AI with specific instructions.
- **Batch approve** — for low-risk items (risk < 15) with confirmation.

---

## 4. Language Strategy (Section 12)

### Core Languages (v1)

| Language | Scope | AI Support | Review Difficulty |
|---|---|---|---|
| **English** | All exams | Excellent | Easy |
| **Bengali** | All exams | Good | Easy (reviewer is fluent) |
| **Hindi** | All exams (Sprint 5) | Excellent | Easy |

### Stretch: Kokborok

| Aspect | Status |
|---|---|
| Scope | Per-exam only — NOT app-wide |
| Confirmed for | T-TET Language-II, Forest Dept qualifying paper |
| AI support | Materially weaker than EN/BN/HI |
| Script ambiguity | Bengali script vs. Roman — needs local confirmation |
| Storage | Per exam/paper in `exams.available_languages`, not a global toggle |
| Timeline | Sprint 6 feasibility check |

### Multilingual Content Workflow

1. **Source content** created in English (or extracted from official Bengali source).
2. **Claude Haiku 4.5** generates translation drafts (EN → BN, EN → HI).
3. **Translations tagged** with confidence score.
4. **Low-confidence translations** get higher risk_score → surface earlier in review queue.
5. **Reviewer** checks and approves all translations before publish.
6. **Never auto-publish translations** — same rule as all AI content.

---

## 5. Content Quality Signals

Beyond pre-publish review, these post-publish signals feed back into content quality:

| Signal | Source | Action |
|---|---|---|
| User error reports | "Report a question error" button | Boosts question risk_score +30, routes to review queue |
| Most-missed questions | Analytics (admin panel) | Questions with <20% accuracy flagged for review — might be bad content, not hard content |
| Outdated content | Exam notification monitoring | When syllabi change, affected questions flagged for update |

---

## 6. Content Pipeline Security

- **AI content never auto-published** — hard rule, enforced at the DB level (insert with `status = 'ai_generated'`, never `'approved'`).
- **All AI calls logged** in `ai_generation_log` with cost tracking.
- **Source citations required** for all GK/current-affairs questions.
- **Fact verification is not optional** for Tripura-specific claims — skipping it is a content pipeline failure.
- **Reviewer identity tracked** — `reviewed_by` and `reviewed_at` on every approved question for accountability.
