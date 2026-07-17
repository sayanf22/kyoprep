# KyoPrep — Master Build Plan

*Consolidates all decisions to date into one current, self-contained spec. Supersedes the earlier v1 and v2 documents — use this one.*

## Quick Reference for the Build Agent

- Backend/DB/Auth/Storage: **Supabase**. Frontend: **Next.js**.
- AWS is used for **exactly one thing**: Claude via Amazon Bedrock. No other AWS service.
- No free tier. New users get a **7-day free trial**, then must subscribe (3 tiers, pricing TBD).
- AI-drafted content is **never auto-published** — everything routes through a human review queue.
- Two separate content workstreams — don't conflate them: build-time bootstrap seeding vs. the ongoing in-product AI pipeline (Section 5).
- Bottom nav: Home, Tests, Daily Quiz, Progress, Profile. Floating button for AI doubt chat.
- Live tests are single-attempt, scheduled, batch-ranked after close, and never downloadable. Everything else downloadable gets a dynamic per-user watermark.
- Kokborok is scoped per-exam, confirmed for T-TET and Forest Dept so far, likely more — check each notification, never assume app-wide. Language availability lives per exam/paper, not as one global setting.
- PWA, not a native app — no Play Store/App Store build for now.
- Scope is Prelims/MCQ content only — no Mains or Interview prep.
- User-reported question errors route into the same review queue as AI-drafted content, not a separate system.

## 1. Vision

One platform for Tripura state-government exam prep — TPSC, JRBT (Group C & D), TRBT (T-TET), and Police-linked exams — with chapter, sectional, full-mock, PYQ, and daily-quiz tests, an AI doubt-solving chat, and support for English, Bengali, and Hindi (Kokborok as a stretch goal). Subscription-only, no ads, no permanent free tier. Differentiated on real bilingual UX (not a bolted-on PDF), transparent AI-assisted content with mandatory human review, and analytics that tell a student what to study next, not just their score.

Scope is deliberately Prelims/MCQ content only. TPSC's Mains and Interview stages are subjective and not auto-gradable — genuinely different infrastructure, not a v1 problem to solve.

## 2. Exam Taxonomy & Rollout Order

| Body | Exams / Posts | Notes |
|---|---|---|
| **JRBT** | Group C (LDC, Agriculture Assistant, Jr. Operator, etc.), Group D (MTS) | Highest applicant volume; generic syllabus — Maths, Reasoning, English, GK |
| **TPSC** | TCS/TPS Combined Competitive, Sub-Inspector, JE, Panchayat Officer, CDPO, Inspector, other Gazetted posts | Prelims (MCQ) → Mains → Interview; prelims is the addressable content. TPSC also runs many low-volume specialist posts (Assistant Professor, Principal, Programmer) — not worth dedicated content, syllabi too narrow and post-specific |
| **TRBT** | T-TET Paper I (I–V) & Paper II (VI–VIII), plus STGT/STPGT (secondary/higher-secondary teacher recruitment) | 150 MCQs, 2.5 hrs, no negative marking; annual, high repeat-attempt rate |
| **Tripura Police Dept.** | Constable, Sub-Inspector | Runs its own recruitment process day-to-day, distinct from TPSC in practice |
| **Forest Dept.** | Forest Guard, Forester | Confirmed live 2026 drive, 271 posts — Maths/English/GK(/Science) plus a separate Bengali-or-Kokborok qualifying paper. Same shape as JRBT Group D — cheap to add since it reuses content already being built |
| **TSR / Home Guard** | Rifleman and similar | 8th/10th-pass tier, general syllabus plus physical test, smaller scale |

**Lower priority — real, but don't build dedicated content yet:** Health Dept/NHM Tripura (Staff Nurse, ANM, CHO — qualification-and-interview driven, not general-aptitude MCQ, needs a different content model entirely); Anganwadi Worker/Helper (small-scale, local); TTAADC (runs its own recruitment, but recent drives have been low-volume and reportedly delayed — lower-confidence bet right now).

**Not actually Tripura state government — exclude:** Tripura Gramin Bank (hires via the national IBPS process), EMRS postings (central scheme, not state-specific despite local vacancies).

**Build order:** JRBT Group C/D + TPSC Combined first (shared core syllabus = one content sprint covers both). Forest Guard/Forester next — same content, marginal extra effort. T-TET (+ STGT/STPGT) after that. TSR/Home Guard and Police alongside, given the similar general-plus-physical pattern. Health Dept, Anganwadi, and TTAADC deliberately deferred.

## 3. User-Facing Features

**Test types:** chapter-wise, sectional, full mock (real timing/marking), PYQ (unmodified, tagged by year), daily quiz, live test (see below).

**Platform features:** auth with exam-selection onboarding, per-test timer, instant results, detailed solutions, performance analysis, leaderboard, dashboard, bookmarking, watermarked PDF download, EN/BN/HI toggle, AI doubt-solving chat, exam notification & important-dates tracker, report-a-question-error button, mobile-first responsive design.

**Onboarding** captures which exam(s) a user is targeting at signup — everything personalized (home screen, adaptive quiz, recommendations) depends on knowing this from day one, not inferring it later.

**Notifications & dates tracker** covers new vacancy alerts, application deadlines, admit card and result dates — reuses the same Track A monitoring of official sources (Section 5) rather than being a separate system, since it's watching the same sites for different information.

**Report-a-question-error** lets any user flag a question as wrong. Reports feed into the same risk-ranked review queue the reviewer already works from (Section 5) — this is the crowdsourced backstop on top of pre-publish review, not a replacement for it.

**Live tests**, modeled on the pattern Testbook/Prepp/SarkariPariksha all use: scheduled for a fixed date and time with a countdown before it opens, single attempt only (that's what regular mock tests are for), and rank/results computed in batch once the window closes so everyone's ranked against the same completed pool rather than a moving target. No PDF download on live tests specifically — that's part of what keeps them fair; regular PYQs and practice tests stay downloadable.

**PDF downloads** carry a dynamic watermark — user name/email plus download timestamp — generated at download time so it can't be stripped or reused. Applies everywhere PDF download makes sense except live tests.

## 4. Subscription Tiers

No permanent free tier. Draft feature matrix below — **pricing intentionally left blank**, adjust freely, but keep the shape: Tier 1 should roughly cover its own (low) AI/infra cost, Tier 3 is where margin lives, because AI usage — the main variable cost — concentrates there.

| Feature | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Chapter tests | Capped/month | Full access | Unlimited |
| Full mocks | 2–4/month | Capped/month | Unlimited |
| Sectional tests | ✗ | Capped | Unlimited |
| PYQ archive | Most recent year only | Full archive | Full archive |
| Live tests | View results only | Limited/month | Unlimited + early registration |
| Daily quiz | Limited | ✓ | ✓ Adaptive (AI-personalized) |
| PDF downloads | ✗ | Limited/month | Unlimited |
| Solutions | Basic | Full | Full |
| Performance analysis | Score only | Full breakdown | Full + AI study recommendations |
| Leaderboard | View only | Participate | Participate + full rankings |
| AI doubt chat | ✗ | Capped queries/day | Generous cap, not literally unlimited |
| Current affairs | Static/monthly | Weekly | Daily/live (real-time sourced) |
| Languages | EN + BN | + Hindi | + Kokborok, once ready (T-TET only) |

## 5. Content Strategy — Two Separate Workstreams

**A. Bootstrap seeding (build-time, one-time-ish).** During development, the AI coding agent itself researches official sources and populates real questions directly into Supabase — this is how the app launches with actual content instead of an empty database. Not throwaway: this becomes the real initial dataset, same schema as everything below.

**B. Production AI pipeline (ongoing, in-product).** The standing admin feature for continuous content growth after launch:

- **Track A — Official PYQs.** TPSC and TRBT both have confirmed, direct past-paper archives — extractable now. Claude's vision capability reads scanned question papers directly (no separate OCR service needed, keeping AWS usage to Bedrock only). JRBT: attempt direct extraction, but expect gaps — pursue an RTI request or manual sourcing in parallel, ongoing rather than blocking. Provisional answer keys must be re-synced against final keys after the official challenge window closes.
- **Track B — AI-drafted.** Fills volume and covers JRBT gaps, matched to official syllabus and whatever real PYQ patterns exist. Every Tripura-specific fact claim gets a live search-verification step — no GK question ships on model memory alone.
- **Review gate.** One reviewer, so the queue is risk-ranked, not first-in-first-out: new/thin-sourced facts and low-confidence translations surface first; mechanically-verifiable items (a Maths question with one checkable answer) get a lighter pass. This is the highest-leverage design decision in the entire content system.

Accuracy note: "100% accurate" isn't literally achievable by any system, but source citation + AI verification + human review is designed to get as close as realistically possible — this isn't a step to skip anywhere.

## 6. AI Usage Map

1. Content pipeline (Track A + B above)
2. Pre-review quality scoring — flags risk before it reaches the one human reviewer
3. AI doubt-solving chat — grounded in the app's own content plus live search for current affairs
4. Personalized performance insights — plain-language, not just raw percentages
5. Adaptive daily quiz — selected per-user from weak areas (Tier 3)
6. Bilingual/trilingual translation assist — always human-checked before publish
7. Auto-tagging — chapter/topic/difficulty on ingest
8. Tier-aware current affairs generation — daily/live for Tier 3, less frequent lower down

## 7. Tech Stack & Architecture

- **Frontend:** Next.js, built as a PWA (installable, home-screen icon, service worker) — no Play Store or App Store submission for now, which also makes light offline caching a natural add rather than extra work
- **Backend/DB/Auth/Storage:** Supabase (Postgres, Supabase Auth, Supabase Storage) — Row Level Security enforces tier-gated access at the data layer, not just in the UI
- **AI:** Amazon Bedrock, and nothing else from AWS. Claude Sonnet 5 for drafting, doubt-chat, and anything quality-sensitive; Claude Haiku 4.5 for high-volume/low-complexity work (tagging, translation drafts, pre-review scoring) — this split matters for stretching the AI credits
- **Web extraction:** TinyFish/AgentQL for structured pulls from official exam-board sites
- **Orchestration:** Supabase Edge Functions calling Bedrock and TinyFish for the content pipeline
- **PDF generation:** server-side (Edge Function), watermark composited at generation time — never a static pre-made file, so it can't be stripped or reused across users
- **Payments:** Razorpay, standard for an India-facing app, handling trial-to-paid conversion and the streak discount
- **Hosting:** Vercel, pairs naturally with Next.js

## 8. Data Model

`Users` (+ trial_start, trial_end, subscription_tier) · `UserExamPreferences` (from onboarding) · `Exams` · `Subjects` · `Chapters` · `Questions` (multilingual fields, source_type, status, citation) · `Tests` · `Attempts` · `Bookmarks` · `LeaderboardEntries` · `AIGenerationLog` · `QuestionReports` (user_id, question_id, reason, routed into the same review queue) · `ExamNotifications` (source, title, date, category — vacancy/deadline/admit-card/result) · `Subscriptions` (tier, status, discount_applied) · `DailyUsageLog` (user_id, date, minutes_active — powers the streak) · `TierConfig` (feature flags/caps per tier)

## 9. Admin Panel

Question bank manager (CRUD, bulk import, multilingual editor) · AI content assistant (Research + Draft modes) · risk-ranked review queue · test builder · user/role management · analytics (platform performance, most-missed questions as a content-quality signal)

## 10. Navigation & Visual Direction

**Bottom nav (5 tabs):**
- **Home** — dashboard: streak status, today's daily quiz prompt, quick stats, a notifications summary card
- **Tests** — hub for chapter, sectional, full mock, PYQ, and live tests, organized by exam
- **Daily Quiz** — the day's quiz, one tap, no digging for it
- **Progress** — performance analysis (accuracy, speed, section breakdown, weak-topic flagging), leaderboard, and streak detail
- **Profile** — account and subscription status

**Notification bell** (top app bar, persistent across every screen, unread-count badge): opens the exam notifications & dates tracker from Section 3 — vacancy alerts, deadlines, admit cards, results. Doesn't need a bottom-nav slot of its own; a bell is the pattern people already expect for this.

**Floating button:** AI doubt chat, accessible from anywhere.

**Hamburger menu:** bookmarks, language settings, subscription/billing, support, settings.

**Visual direction (detailed design system to follow later):** green and white palette, rounded corners throughout, smooth transitions, illustrations for empty states and achievements — a modern, engaging edtech feel rather than a dry government-form look.

## 11. Trial & Streak Mechanic

New users get a **7-day free trial** at a Tier-2-equivalent experience level (enough to prove real value, holding Tier 3 exclusives like live current affairs and unlimited doubt-chat in reserve as an upgrade hook even after conversion). If a user logs 30+ minutes of activity on all 7 trial days, a **70% discount** is automatically applied to their first subscription at the moment the trial ends and the paywall appears. Miss the streak, and the trial simply ends into a normal full-price choice of tier. The trial window is what makes the streak achievable without a permanent free tier.

## 12. Languages

English, Bengali, and Hindi apply across every exam and are the core v1 set — all well-supported for AI-assisted translation and easy for a single reviewer to sanity-check. Kokborok is scoped per exam, only where the real notification supports it — confirmed for T-TET's Language-II paper and for Forest Department recruitment (a separate Bengali-or-Kokborok qualifying paper, 40% minimum). It likely recurs elsewhere at this recruitment tier — check each exam's actual notification rather than assuming either way; as far as the research shows, TPSC's Combined Competitive and JRBT's core papers don't have a Kokborok option. Even where it applies, it's a stretch goal: Claude's fluency in Kokborok is materially weaker than the other three, and there's real ambiguity around script (Bengali vs. Roman) worth confirming locally before committing engineering time. Store language availability per exam/paper rather than as one global toggle — that's exactly what makes this kind of correction a data fix, not a rebuild.

## 13. Build Sequence

| Sprint | Delivers |
|---|---|
| 1 | Supabase foundation (auth, schema, storage), Next.js PWA shell with bottom nav, onboarding (exam selection), trial signup flow, Razorpay skeleton, Terms/Privacy/refund policy and non-affiliation disclaimer live before any real signups |
| 2 | Bootstrap content sprint (Section 5A) — real JRBT/TPSC questions in the database; chapter + full-mock test-taking live |
| 3 | Tiering/paywall logic, streak tracking, discount mechanic |
| 4 | Production AI pipeline (Section 5B) live as an admin feature; PYQ tests, bookmarks, performance analysis, report-a-question-error button, exam notifications & dates tracker (reuses Track A monitoring) |
| 5 | AI doubt chat, adaptive daily quiz, sectional tests, leaderboard, live tests, watermarked PDF download, Hindi pass |
| 6 | T-TET (+ STGT/STPGT) content, Forest Guard/Forester, TSR/Home Guard, remaining posts, Kokborok feasibility check |

## 14. Legal & Trust Basics

Not optional polish — needed before real signups start in Sprint 1. This document isn't legal advice and these need an actual lawyer or a proper India-focused template service, not just this list, but at minimum: Terms of Service, a Privacy Policy covering what's collected and how it's stored (relevant under India's DPDP Act), a refund/cancellation policy for the subscription, and a clear, visible disclaimer that KyoPrep is independent and not affiliated with or endorsed by TPSC, JRBT, TRBT, or the Government of Tripura.
