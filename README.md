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
- Total: 105

## Tech stack

- Playwright + TypeScript
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
  mcr.microsoft.com/playwright:v1.59.1-noble \
  npx playwright test --project=visual --update-snapshots
```

Snapshots are stored next to the spec in:
- `tests/visual/visual.spec.ts-snapshots/`

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
- `mock-api/server.mjs` - local mock REST API
- `data/` - external test data

## Notes and tradeoffs

- UI tests run against a public demo app, so visual tests rely on controlled
  baselines, masking, and a small tolerance.
- Linux-generated snapshots are the source of truth for CI.
- This framework prioritizes clarity, maintainability, and interview/demo value
  over production-scale complexity.
