# KyoPrep Landing Page & Waitlist — Design Spec

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Sections 1, 3, 10, 11, 14.*
*Domain: **kyoprep.in***

---

## 1. Purpose

Pre-launch landing page for **kyoprep.in** — a Tripura state-government exam prep platform. Since we are not launching from day one, the landing page serves exactly two goals:

1. **Communicate** what KyoPrep is and who it's for (Section 1 positioning).
2. **Collect waitlist signups** with target-exam data so we have a qualified user list on launch day.

There is no app access, no login, and no paywall on this page. The `/login` and `/signup` routes are not publicly linked yet (see [02_auth_and_trial_flow.md](file:///d:/Projects%20with%20IDE/kyoprep/docs/02_auth_and_trial_flow.md)).

---

## 2. Visual Direction

Follows Section 10 of the master plan:

- **Palette**: Green (#16A34A / #22C55E mint) and white (#FFFFFF) primary. Dark accents (#0F172A slate) for text contrast. Subtle green gradients for backgrounds.
- **Typography**: *Outfit* for headings, *Inter* for body text (Google Fonts).
- **Shape language**: Rounded corners throughout (border-radius: 12–16px on cards, 8px on buttons).
- **Animations**: Smooth transitions (300ms ease), hover lifts on cards/buttons, fade-in on scroll for sections.
- **Illustrations**: Custom or Undraw-style for empty states and hero visual — a modern, engaging edtech feel, NOT a dry government-form look.
- **Mobile-first**: Responsive design, single-column on mobile, max-width container on desktop.

---

## 3. Page Structure

### 3.1 Top Bar / Navigation

| Element | Details |
|---|---|
| Logo | KyoPrep wordmark (left-aligned) |
| Live notification banner | Optional — e.g. "🔥 Tripura Forest Guard 2026 — 271 posts, apply by [date]" — sourced from real exam notifications |
| CTA button | "Join Waitlist" (right-aligned, scrolls to waitlist section) |

No hamburger menu, no login link visible on this page (pre-launch).

### 3.2 Hero Section

- **Headline**: "Tripura's Own Exam Prep Platform" or equivalent — positions KyoPrep as purpose-built for Tripura state exams, not a generic national platform.
- **Sub-headline**: Mentions TPSC, JRBT, T-TET, Forest Guard, Police — the specific exams from Section 2 rollout order.
- **Primary CTA**: High-contrast green "Join the Waitlist" button → smooth-scrolls to waitlist form.
- **Hero visual**: Illustration or stylized mockup showing the app's mobile UI (bottom nav with 5 tabs, a sample question card).

### 3.3 7-Day Trial & Streak Notice (The Incentive Card)

A clean, non-interactive visual notice panel showcasing the 7-day trial and streak discount incentive (Section 11):

- **Visual structure**: Displays a representation of a 7-day progress tracker (7 nodes with checkmarks for completed days).
- **Copy**: Highlights that new users receive a 7-day free trial, and completing 30+ minutes of activity on all 7 days automatically unlocks a 70% discount voucher at checkout.
- **Goal**: Functions as a promotional highlight of the platform's high-value incentive mechanics rather than an interactive game.


### 3.4 Features Grid

Cards highlighting key platform features (derived from Section 3):

| Card | Icon | Copy |
|---|---|---|
| Bilingual Questions | 🌐 | "Every question in English & Bengali. Hindi coming soon." |
| Real PYQs | 📄 | "Official past papers from TPSC & TRBT, digitized and tagged." |
| AI Doubt Chat | 🤖 | "Stuck on a question? Get instant, grounded explanations." |
| Smart Analytics | 📊 | "Know exactly what to study next — not just your score." |
| Daily Quizzes | ⚡ | "One quiz every day. Build streaks. Earn discounts." |
| Exam Alerts | 🔔 | "Vacancy postings, deadlines, admit cards — all in one place." |

### 3.5 Exam Coverage Section

Visual representation of the exam taxonomy from Section 2:

- Grouped by recruiting body: JRBT, TPSC, TRBT, Police, Forest Dept.
- Each group shows specific post names.
- "Coming soon" badge on later-phase exams (TSR, Home Guard).

### 3.6 Waitlist Registration Form

**This is the primary conversion point.**

#### Fields

| Field | Type | Validation | Required |
|---|---|---|---|
| `email` | text input | RFC 5322 format, max 254 chars, Zod validated | ✓ |
| `name` | text input | 2–100 chars, trimmed | ✓ |
| `target_exams` | multi-select checkboxes | At least one selected. Options match Section 2 exam taxonomy: JRBT Group C, JRBT Group D, TPSC Combined, T-TET, Forest Guard, Tripura Police, Other | ✓ |
| `consent` | single checkbox | Must be checked: "I agree to receive updates about KyoPrep launch" | ✓ |
| `honeypot` | hidden text input | Must be empty — filled = bot, silently reject | Hidden |

#### Behavior

1. **Client-side validation** via Zod schema before submission.
2. **POST to `/api/waitlist`** (Next.js API route → Supabase Edge Function).
3. **Loading state**: Button shows spinner, inputs disabled.
4. **Success state**: Confetti animation (canvas-confetti), shows "You're in! Position #[N]" with the user's queue position.
5. **Error state**: Inline error message below the form, retry enabled.
6. **Duplicate handling**: If email already exists, return success-like message: "You're already on the list!"

#### Backend: `POST /api/waitlist`

```
Request body (Zod validated):
{
  email: string (email format),
  name: string (2-100 chars),
  target_exams: string[] (min 1),
  consent: boolean (must be true),
  honeypot: string (must be empty)
}

Response:
{ success: true, position: number }
or
{ success: false, error: string }
```

**Security:**
- Zod schema validation (reject malformed input)
- Honeypot check (reject if filled)
- Rate limiting: 3 signups per IP per 15 minutes
- Supabase RLS on `waitlist_signups` table (insert-only for anonymous, read for admin)
- Email stored as-is (not encrypted at rest for now — it's a waitlist, not a payment system)

#### Supabase Table: `waitlist_signups`

```sql
CREATE TABLE waitlist_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  target_exams TEXT[] NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT true,
  signed_up_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT, -- SHA-256 of IP, not raw IP
  source TEXT DEFAULT 'landing_page'
);

-- RLS: anonymous can INSERT, only authenticated admin can SELECT
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
```

### 3.7 Footer

- **Non-affiliation disclaimer** (Section 14, mandatory): *"KyoPrep is an independent platform and is not affiliated with, endorsed by, or connected to TPSC, JRBT, TRBT, or the Government of Tripura."*
- Links to (placeholder pages for now): Terms of Service, Privacy Policy, Refund Policy.
- Contact email.
- © 2026 KyoPrep. All rights reserved.

---

## 4. SEO & Meta

```html
<title>KyoPrep — Tripura Exam Prep | TPSC, JRBT, T-TET, Forest Guard</title>
<meta name="description" content="Prepare for Tripura state government exams — TPSC Combined, JRBT Group C & D, T-TET, Forest Guard, Police. Bilingual questions, real PYQs, AI-powered study tools. Join the waitlist." />
<meta name="keywords" content="Tripura exam prep, TPSC preparation, JRBT Group C, JRBT Group D, T-TET, Tripura Forest Guard, Tripura Police exam, Bengali exam prep, kyoprep" />
```

- Canonical URL: `https://kyoprep.in`
- Open Graph tags for social sharing (title, description, image).
- Single `<h1>` per page (the hero headline).

---

## 5. Accessibility & Performance

- All images have descriptive `alt` text.
- Form inputs have proper `<label>` associations.
- Focus states visible on all interactive elements.
- Color contrast meets WCAG AA.
- Confetti animation respects `prefers-reduced-motion`.
- Page should score 90+ on Lighthouse (performance, accessibility, SEO).
