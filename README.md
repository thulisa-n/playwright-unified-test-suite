# Playwright Test Framework: SauceDemo + Mock API

A portfolio-grade end-to-end and API test framework built with Playwright and
TypeScript. It covers a full e-commerce flow against SauceDemo plus a bundled
mock API, and runs in GitHub Actions CI.

## What it is

This project demonstrates how I design and maintain automated test frameworks:
readable page objects, web-first assertions, custom fixtures, external test
data, visual regression checks, and deterministic API testing.

## Test coverage

- UI tests: 88
  - Login: 14
  - Products: 24
  - Cart: 23
  - Checkout: 27
- API tests: 15 (bundled zero-dependency Node mock API on port 3100)
- Visual tests: 2 (login and inventory baselines with masking)
- Accessibility tests: 3 (login, inventory, checkout)
- Total: 108

## Tech stack

- Playwright + TypeScript
- `@axe-core/playwright` for accessibility scanning
- Page Object Model (`LoginPage`, `InventoryPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`)
- Custom fixtures and external test data files
- Bundled Node mock API started automatically via Playwright `webServer`
- GitHub Actions CI on Node 20

## Prerequisites

- Node.js 20+
- npm

## How to run

```bash
npm install
npx playwright install --with-deps
npm test
```

Open the HTML report after a run:

```bash
npm run report
```

## Visual regression workflow

Run visual tests:

```bash
npm run test:visual
```

Create or intentionally refresh snapshots:

```bash
npm run test:visual:update
```

For CI-stable Linux baselines, generate snapshots in the Playwright Docker image:

```bash
docker run --rm -v "$(pwd):/work" -w /work \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  npx playwright test --project=visual --update-snapshots
```

Snapshots are stored next to the spec in:
- `tests/visual/visual.spec.ts-snapshots/`

## Accessibility workflow

Run accessibility tests:

```bash
npm run test:a11y
```

The suite uses axe with WCAG 2 A/AA tags and fails only on serious/critical
violations:

- `tests/a11y/accessibility.spec.ts`
- pages scanned: login, inventory, checkout

## Framework decisions and tradeoffs

- **Custom fixture for reusable login setup**  
  `loggedInPage` removes repeated login code from post-login suites, keeps tests
  focused on behavior, and improves readability.

- **Login suite intentionally does not use `loggedInPage`**  
  `tests/ui/login.spec.ts` validates the login flow itself, so auto-login would
  bypass what those tests are meant to verify.

- **Visual baselines are OS-specific**  
  Local macOS baselines (`-darwin`) are useful for local feedback, but Linux
  baselines (`-linux`) are committed as CI source of truth because GitHub Actions
  runs on Ubuntu.

- **Accessibility gate is severity-based, not perfection-based**  
  CI blocks on serious/critical findings so the signal stays actionable while
  still surfacing lower-severity issues for follow-up.

- **Scoped a11y suppression is explicit and documented**  
  Inventory scan disables only axe `select-name` because SauceDemo's sort select
  is third-party markup without an accessible name; we cannot change it in this
  repo, so the suppression is narrow and explained in code.

## CI

GitHub Actions runs the full suite on pushes and pull requests:

- checkout
- setup-node (Node 20)
- `npm ci`
- `npx playwright install --with-deps`
- test run
- HTML report upload as an artifact

## Project structure

- `page-objects/` - reusable page object classes
- `fixtures/` - custom Playwright fixtures
- `tests/ui/` - UI functional test suites
- `tests/api/` - API suite against the bundled mock server
- `tests/visual/visual.spec.ts` - visual regression spec
- `tests/a11y/accessibility.spec.ts` - accessibility scan suite
- `mock-api/server.mjs` - local mock REST API
- `data/` - external test data

## Notes and tradeoffs

- UI tests run against a public demo app, so visual tests rely on controlled
  baselines, masking, and a small tolerance.
- Linux-generated snapshots are the source of truth for CI.
- This framework prioritizes clarity, maintainability, and interview/demo value
  over production-scale complexity.
