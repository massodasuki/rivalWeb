# Rival E2E Tests (Playwright)

End-to-end tests for the Rival frontend. Tests run against a live app instance.

## Prerequisites

- Node.js 18+
- The full stack must be running (frontend + backend + DB)

## Setup

```bash
cd e2e
npm install
npx playwright install chromium   # install browser binaries
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run with visible browser
npm run test:headed

# Interactive UI mode (great for debugging)
npm run test:ui

# Debug a specific test
npm run test:debug -- tests/auth.spec.ts

# Open last HTML report
npm run test:report
```

## Target URL

By default tests hit `http://localhost:3000` (Docker / Nginx).

To test against the Vite dev server:
```bash
BASE_URL=http://localhost:5173 npm test
```

## Test User Credentials

The setup step auto-creates a test user if it doesn't exist:

| Field    | Default value       | Override via env var |
|----------|---------------------|----------------------|
| Email    | e2e@rival.test      | `TEST_EMAIL`         |
| Password | TestPass123!        | `TEST_PASSWORD`      |

## Test Structure

```
tests/
├── auth.setup.ts       # Logs in once, saves auth state for all tests
├── auth.spec.ts        # Login, signup, logout, route protection
├── dashboard.spec.ts   # Dashboard load, sidebar navigation
├── matchmaking.spec.ts # Matchmaking page
├── teams.spec.ts       # Teams page
├── community.spec.ts   # Community page
├── settings.spec.ts    # Settings page (checks for hardcoded placeholders)
└── stats.spec.ts       # Stats page
```

## Auth State Reuse

`auth.setup.ts` runs once before all tests and saves `playwright/.auth/user.json`.
All other tests load this state so they start already logged in — no repeated login overhead.
