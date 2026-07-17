# KyoPrep Build Sequence — Sprint Plan

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Section 13.*
*Domain: **kyoprep.in***

---

## Overview

Six sprints from foundation to full feature set. Each sprint builds on the previous — no sprint ships in isolation.

**Current phase**: Pre-launch (landing page + waitlist). Sprint 1 work has begun with the Next.js shell.

---

## Sprint 0 — Pre-Launch (Current)

**Goal**: Landing page live at kyoprep.in, collecting waitlist signups.

| Deliverable | Spec | Status |
|---|---|---|
| Next.js project scaffolding (App Router, TypeScript, PWA-ready) | [keyoprep_plan.md §7](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | ✅ Done |
| Landing page with hero, features, exam coverage | [01_landing_page_waitlist.md](file:///d:/Projects%20with%20IDE/kyoprep/docs/01_landing_page_waitlist.md) | 🔨 In progress |
| Waitlist registration form + API route | [01_landing_page_waitlist.md §3.6](file:///d:/Projects%20with%20IDE/kyoprep/docs/01_landing_page_waitlist.md) | 🔨 In progress |
| Interactive streak quiz teaser | [01_landing_page_waitlist.md §3.3](file:///d:/Projects%20with%20IDE/kyoprep/docs/01_landing_page_waitlist.md) | 🔨 In progress |
| Early-gate route (`/early-gate`) for internal testing | [02_auth_and_trial_flow.md §3](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | ⬜ Not started |
| SEO meta tags, non-affiliation disclaimer | [01_landing_page_waitlist.md §3.7, §4](file:///d:/Projects%20with%20IDE/kyoprep/docs/01_landing_page_waitlist.md) | ⬜ Not started |

---

## Sprint 1 — Foundation

**Goal**: Supabase backend live. Auth working. Legal pages done. Users can sign up (internally) and see an app shell.

| Deliverable | Spec | Details |
|---|---|---|
| Supabase project setup | [04_data_model_and_security.md](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Create project, enable auth, configure RLS |
| Database schema (full migration) | [04_data_model_and_security.md §2](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | All tables from Section 8 |
| Supabase Auth integration | [02_auth_and_trial_flow.md](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | Email/password, `@supabase/ssr` |
| Onboarding flow (exam selection) | [02_auth_and_trial_flow.md §4.2](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | Write to `UserExamPreferences` |
| Trial signup flow | [02_auth_and_trial_flow.md §4.3](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | 7-day trial activation on signup |
| Next.js PWA shell with bottom nav | [keyoprep_plan.md §10](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Home, Tests, Daily Quiz, Progress, Profile |
| Razorpay skeleton | [04_data_model_and_security.md §5](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Checkout flow, webhook handler (not connected to real payments yet) |
| Terms of Service page | [04_data_model_and_security.md §6](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Static page, placeholder content (needs lawyer review) |
| Privacy Policy page | [04_data_model_and_security.md §6](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | DPDP Act basics |
| Refund/Cancellation Policy page | [04_data_model_and_security.md §6](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Subscription terms |
| Non-affiliation disclaimer | [keyoprep_plan.md §14](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Footer on every page |
| Middleware routing (pre/post launch) | [02_auth_and_trial_flow.md §2](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | `IS_OFFICIAL_LAUNCH` env var |

### Sprint 1 Acceptance Criteria
- [ ] User can sign up via `/early-gate`, complete exam selection onboarding
- [ ] 7-day trial auto-activates
- [ ] Bottom nav shell renders with all 5 tabs (content is placeholder)
- [ ] Legal pages are accessible and linked in footer
- [ ] RLS policies active on all tables
- [ ] No public access to `/login` or `/signup` (redirects to landing page)

---

## Sprint 2 — Bootstrap Content

**Goal**: Real questions in the database. Users can take chapter tests and full mocks.

| Deliverable | Spec | Details |
|---|---|---|
| Bootstrap seeding scripts | [05_content_strategy.md §2](file:///d:/Projects%20with%20IDE/kyoprep/docs/05_content_strategy.md) | TPSC + JRBT PYQ extraction via Claude vision |
| Exam + Subject + Chapter structure | [04_data_model_and_security.md §2.2](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Seed `exams`, `subjects`, `chapters` tables |
| Question ingestion pipeline | [05_content_strategy.md §2](file:///d:/Projects%20with%20IDE/kyoprep/docs/05_content_strategy.md) | Extract → format → insert → tag |
| Chapter-wise test taking | [03_admin_panel.md §3.4](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Select chapter → take test → instant results |
| Full mock test taking | [03_admin_panel.md §3.4](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Real timing, negative marking, full results |
| Test-taking UI | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Timer, question navigation, bilingual toggle, solution drawer |
| Results screen | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Score, correct/wrong/skipped, time per question |

### Sprint 2 Acceptance Criteria
- [ ] 200+ real questions in database (JRBT + TPSC combined)
- [ ] User can take a chapter-wise test and see results
- [ ] User can take a full mock with real timing and see detailed results
- [ ] EN/BN toggle works on questions
- [ ] Solutions display correctly

---

## Sprint 3 — Tiering & Streak

**Goal**: Subscription paywall works. Streak tracking live. Discount mechanic functional.

| Deliverable | Spec | Details |
|---|---|---|
| Tier-gated access enforcement | [04_data_model_and_security.md §2.6](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | RLS + API checks against `tier_config` |
| `TierConfig` seeded | [04_data_model_and_security.md §2.6](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Feature matrix from Section 4 |
| Subscription paywall UI | [02_auth_and_trial_flow.md §7](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | Appears on trial expiry |
| Razorpay checkout flow | [04_data_model_and_security.md §5](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Select tier → pay → activate |
| Streak tracking | [02_auth_and_trial_flow.md §7](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | `DailyUsageLog` + client heartbeat |
| Streak UI on Home tab | [02_auth_and_trial_flow.md §7](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | 7 circles, progress bar, 30-min goal |
| 70% discount auto-application | [02_auth_and_trial_flow.md §7](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md) | Applied at paywall if streak complete |

### Sprint 3 Acceptance Criteria
- [ ] Trial user sees content caps based on Tier 2 equivalent
- [ ] After 7 days, paywall blocks access
- [ ] Streak tracker shows daily progress toward 30 minutes
- [ ] Completing all 7 days auto-applies 70% discount on paywall
- [ ] Razorpay payment creates active subscription
- [ ] Tier upgrade immediately unlocks features

---

## Sprint 4 — AI Pipeline & Community Features

**Goal**: Admin can generate content via AI. Users can report errors, bookmark questions, see analytics, and get exam notifications.

| Deliverable | Spec | Details |
|---|---|---|
| Admin panel shell | [03_admin_panel.md](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Dashboard, sidebar nav, role-gated access |
| AI Content Assistant (Research mode) | [03_admin_panel.md §3.5](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Upload scanned paper → Claude vision extraction |
| AI Content Assistant (Draft mode) | [03_admin_panel.md §3.5](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Select topic → generate questions with fact verification |
| Risk-ranked review queue | [03_admin_panel.md §3.3](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Risk-scored, reviewer actions |
| PYQ test type | [03_admin_panel.md §3.4](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Unmodified official papers, tagged by year |
| Bookmarks | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Save/unsave questions |
| Performance analysis | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Accuracy, speed, section breakdown, weak topics |
| Report-a-question-error | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Routes into review queue (+30 risk boost) |
| Exam notifications tracker | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Bell icon, vacancy/deadline/admit-card/result alerts |

### Sprint 4 Acceptance Criteria
- [ ] Admin can upload a PYQ paper and get extracted questions
- [ ] Admin can generate AI-drafted questions with fact verification
- [ ] Review queue sorts by risk score (highest first)
- [ ] User reports appear in the same queue
- [ ] Bookmarks persist across sessions
- [ ] Performance analysis shows per-subject accuracy breakdown
- [ ] Notification bell shows exam alerts

---

## Sprint 5 — Premium Features

**Goal**: AI doubt chat live. Adaptive quizzes. Leaderboard. Live tests. Hindi support. PDF downloads.

| Deliverable | Spec | Details |
|---|---|---|
| AI doubt chat | [keyoprep_plan.md §6.3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Floating button, grounded in app content + live search |
| Adaptive daily quiz (Tier 3) | [keyoprep_plan.md §6.5](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | AI-selected from weak areas |
| Sectional tests | [03_admin_panel.md §3.4](file:///d:/Projects%20with%20IDE/kyoprep/docs/03_admin_panel.md) | Multi-chapter tests |
| Leaderboard | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Tier-gated participation |
| Live tests | [keyoprep_plan.md §3](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Scheduled, single-attempt, batch-ranked |
| Watermarked PDF download | [04_data_model_and_security.md §4](file:///d:/Projects%20with%20IDE/kyoprep/docs/04_data_model_and_security.md) | Server-side generation, dynamic watermark |
| Hindi language pass | [05_content_strategy.md §4](file:///d:/Projects%20with%20IDE/kyoprep/docs/05_content_strategy.md) | AI translation + human review |

### Sprint 5 Acceptance Criteria
- [ ] AI doubt chat returns grounded answers with citations
- [ ] Tier 3 users get personalized daily quizzes
- [ ] Live test flow: registration → countdown → single attempt → batch results
- [ ] PDF downloads carry user-specific watermark
- [ ] Hindi translations available for core content

---

## Sprint 6 — Content Expansion

**Goal**: Coverage for remaining exams. Kokborok feasibility.

| Deliverable | Spec | Details |
|---|---|---|
| T-TET content (Paper I + II) | [05_content_strategy.md §2](file:///d:/Projects%20with%20IDE/kyoprep/docs/05_content_strategy.md) | Child Dev, Language, Maths, EVS, Subject-specific |
| STGT/STPGT content | [keyoprep_plan.md §2](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Secondary/higher-secondary teacher |
| Forest Guard/Forester | [keyoprep_plan.md §2](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Reuses JRBT content + Bengali/Kokborok qualifying |
| TSR/Home Guard | [keyoprep_plan.md §2](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | 8th/10th tier content |
| Police (Constable/SI) | [keyoprep_plan.md §2](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) | Own recruitment pattern |
| Kokborok feasibility check | [05_content_strategy.md §4](file:///d:/Projects%20with%20IDE/kyoprep/docs/05_content_strategy.md) | Script confirmation, AI fluency assessment |

### Sprint 6 Acceptance Criteria
- [ ] T-TET Paper I + II content live
- [ ] Forest Guard content reuses JRBT base with exam-specific additions
- [ ] Kokborok feasibility report with recommendation (go/no-go)

---

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| JRBT PYQ archives incomplete | RTI request in parallel; AI-drafted content fills gaps |
| Kokborok AI fluency insufficient | Defer to manual translation or exclude |
| Single reviewer bottleneck | Risk-ranked queue ensures time spent where it matters; batch-approve low-risk items |
| Razorpay integration delays | Skeleton in Sprint 1, connect live in Sprint 3 |
| Supabase free tier limits | Monitor usage; upgrade plan when needed |
| Legal documents not ready | Use reputable template service; flag for lawyer review before public launch |
