# KyoPrep Authentication & Trial Flow — Design Spec

*Source of truth: [keyoprep_plan.md](file:///d:/Projects%20with%20IDE/kyoprep/keyoprep_plan.md) Sections 3, 7, 11, 14.*
*Domain: **kyoprep.in***

---

## 1. Overview

KyoPrep uses **Supabase Auth** for all authentication. There is no custom JWT infrastructure, no separate auth service, and no social login at v1 (email/password only — social can be added later via Supabase's built-in providers).

### Pre-Launch vs. Post-Launch Routing

The app has two authentication states controlled by a single environment variable:

```env
NEXT_PUBLIC_IS_OFFICIAL_LAUNCH=false  # Pre-launch default
```

| Route | Pre-Launch (`false`) | Post-Launch (`true`) |
|---|---|---|
| `/login` | Redirects to landing page (kyoprep.in) | Standard login form |
| `/signup` | Redirects to landing page | Standard signup + onboarding |
| `/early-gate` | Hidden portal for internal testers | Redirects to `/login` |
| `/` (root) | Landing page + waitlist | Redirects to `/dashboard` if authenticated, landing page if not |

**The key design decision**: Build `/login` and `/signup` as the real, permanent routes from day one. The pre-launch behavior is just a redirect guard — when `IS_OFFICIAL_LAUNCH` flips to `true`, these routes simply start working. No code rewrite needed.

---

## 2. Route Architecture

### 2.1 Pre-Launch Routes (current phase)

```
kyoprep.in/                → Landing page + waitlist (public)
kyoprep.in/early-gate      → Internal tester login (hidden, not linked anywhere)
kyoprep.in/login            → Redirect → / (landing page)
kyoprep.in/signup           → Redirect → / (landing page)
```

### 2.2 Post-Launch Routes (after IS_OFFICIAL_LAUNCH=true)

```
kyoprep.in/                → Landing page (unauthenticated) OR redirect to /dashboard (authenticated)
kyoprep.in/login            → Login form
kyoprep.in/signup           → Signup + onboarding form
kyoprep.in/early-gate       → Redirect → /login
kyoprep.in/dashboard        → Protected app shell (requires auth)
kyoprep.in/forgot-password  → Password reset flow
```

### 2.3 Implementation

Use Next.js middleware to handle the routing logic:

```typescript
// middleware.ts (pseudocode)
if (!IS_OFFICIAL_LAUNCH) {
  if (path === '/login' || path === '/signup') → redirect to '/'
  if (path === '/early-gate') → allow through
} else {
  if (path === '/early-gate') → redirect to '/login'
  if (path === '/login' || path === '/signup') → allow through
}

// Protected routes (always active)
if (path.startsWith('/dashboard') && !session) → redirect to login route
```

---

## 3. Early Gate (`/early-gate`)

Purpose: Allow the team and select early testers to access the app before public launch.

### UI

- Minimal, clean page matching the green/white theme.
- KyoPrep logo.
- Email + password form.
- No "Sign up" link — accounts created manually in Supabase dashboard or via admin invite.
- No "Forgot password" — handled manually for now (small user count).

### Security

- Route is not linked from any public page or navigation.
- No SEO indexing: `<meta name="robots" content="noindex, nofollow" />`
- Failed login attempts: Rate-limited to 5 per IP per 15 minutes (Supabase Auth config).
- All early-gate users are pre-created with a specific role flag (`is_early_tester: true`) in the `Users` table.

---

## 4. Signup Flow (Post-Launch)

### Step 1: Account Creation

| Field | Type | Validation |
|---|---|---|
| `email` | text input | RFC 5322, unique, max 254 chars |
| `password` | password input | Min 8 chars, at least 1 letter + 1 number |
| `name` | text input | 2–100 chars |

- Submit → Supabase `auth.signUp()`.
- Email verification sent automatically by Supabase.
- User lands on "Check your email" interstitial.

### Step 2: Onboarding — Exam Selection

After email verification and first login, the user is routed to an onboarding screen (Section 3 of master plan):

**"Which exams are you preparing for?"** — multi-select with the same options from Section 2:

- [ ] JRBT Group C (LDC, Agriculture Assistant, etc.)
- [ ] JRBT Group D (MTS)
- [ ] TPSC Combined Competitive
- [ ] T-TET Paper I (Classes I–V)
- [ ] T-TET Paper II (Classes VI–VIII)
- [ ] Tripura Forest Guard / Forester
- [ ] Tripura Police (Constable / SI)
- [ ] TSR / Home Guard
- [ ] Other

At least one must be selected. This writes to the `UserExamPreferences` table:

```sql
CREATE TABLE user_exam_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id),
  selected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exam_id)
);
```

### Step 3: Trial Activation

On completing onboarding, the trial is activated automatically:

```sql
UPDATE users
SET trial_start = now(),
    trial_end = now() + INTERVAL '7 days',
    subscription_tier = 'trial'  -- Tier-2-equivalent access
WHERE id = <user_id>;
```

User is redirected to `/dashboard` (the Home tab).

---

## 5. Login Flow (Post-Launch)

Standard Supabase email/password login:

| Field | Validation |
|---|---|
| `email` | Required, email format |
| `password` | Required |

- Submit → Supabase `auth.signInWithPassword()`.
- On success → redirect to `/dashboard`.
- On failure → inline error: "Invalid email or password."
- "Forgot password?" link → `/forgot-password` → Supabase `auth.resetPasswordForEmail()`.

---

## 6. Session Management

| Setting | Value | Rationale |
|---|---|---|
| Session storage | HttpOnly cookie via Supabase SSR helpers | Prevents XSS token theft |
| SameSite | `Strict` | CSRF protection |
| Secure | `true` (production only) | HTTPS enforcement |
| Session duration | 1 hour access token, 7-day refresh | Balance security/UX |
| Concurrent sessions | Allowed (multi-device) | Users study on phone + laptop |

### Auth State in Next.js

Use `@supabase/ssr` package for server-side session handling:

- **Server Components**: Read session from cookies via `createServerClient()`.
- **Client Components**: Use `createBrowserClient()` for auth state.
- **Middleware**: Refresh session on every request via `updateSession()`.

---

## 7. Trial & Streak Mechanic (Section 11)

### Trial Rules

- **Duration**: 7 calendar days from signup (not 7 active days).
- **Access level**: Tier-2-equivalent (full chapter tests, capped mocks, full PYQ archive, full solutions, full analytics — but NO AI doubt chat, NO adaptive quiz, NO live current affairs).
- **Expiry**: After 7 days, access is fully blocked behind the subscription paywall.

### Streak Tracking

The `DailyUsageLog` table tracks daily activity:

```sql
CREATE TABLE daily_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_active INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
```

**Activity tracking**: Client-side heartbeat (every 60 seconds while the user is actively interacting) → increments `minutes_active` for today's row via a debounced API call.

### Discount Logic

On trial expiry (when the paywall appears):

```typescript
// Pseudocode
const trialDays = await getTrialDays(userId); // 7 rows from daily_usage_log
const streakComplete = trialDays.length === 7 && trialDays.every(d => d.minutes_active >= 30);

if (streakComplete) {
  // Auto-apply 70% discount to first subscription
  applyDiscount(userId, { percent: 70, reason: 'trial_streak_complete' });
  showPaywall({ discountApplied: true, discountPercent: 70 });
} else {
  showPaywall({ discountApplied: false });
}
```

### Streak UI

- Visible on the Home dashboard tab throughout the trial.
- 7 circles (one per day), filled green when 30+ minutes logged, amber when partially done, empty for future days.
- Current day shows a progress bar toward 30 minutes.
- Clear copy: "Complete 30 minutes on all 7 days to unlock 70% off your first subscription."

---

## 8. Role Model

| Role | Scope | Created via |
|---|---|---|
| `user` | Standard subscriber / trial user | Self-signup |
| `early_tester` | Pre-launch internal tester | Manual Supabase insert |
| `reviewer` | Content reviewer (admin panel access) | Manual assignment |
| `admin` | Full admin panel + user management | Manual assignment |

Roles stored in `Users` table as `role TEXT DEFAULT 'user'`. Enforced at both the API layer (middleware checks) and the data layer (Supabase RLS policies).

---

## 9. Security Checklist

- [x] Supabase Auth handles password hashing (bcrypt), not custom code
- [x] Email verification required before app access
- [x] HttpOnly + SameSite=Strict cookies
- [x] Rate-limited login: 5 attempts per IP per 15 min
- [x] Rate-limited signup: 3 per IP per 15 min
- [x] No password requirements displayed as hints (prevents enumeration)
- [x] Forgot-password uses Supabase's built-in flow (time-limited token)
- [x] Early-gate route not indexed, not linked
- [x] Role checks at middleware AND RLS level (defense in depth)
- [x] Audit log: auth events (login, signup, password reset) logged via Supabase's built-in audit
