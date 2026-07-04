# Agent Documentation Design

## Goal

Enable any AI coding agent to work in the crowdsignal-forms repo autonomously: understand the project, build it, run tests, verify changes work, and experiment safely in a sandbox.

## Approach

**AGENTS.md + Agent Skills (Approach B)**

Root `AGENTS.md` (~300 lines) for core project knowledge. Thin `CLAUDE.md` referencing it. Three agent skills in `.agents/skills/` for complex multi-step procedures.

## File Structure

```
crowdsignal-forms/
├── AGENTS.md                          # Source of truth (~300 lines)
├── CLAUDE.md                          # Contains: @AGENTS.md
├── .agents/
│   └── skills/
│       ├── docker-dev-environment.md  # Docker setup & troubleshooting
│       ├── running-tests.md           # Full test workflow
│       └── release-process.md         # Build + package + release
├── e2e/                               # Playwright E2E tests (NEW)
│   ├── playwright.config.ts
│   └── tests/
│       ├── plugin-activation.spec.ts
│       ├── poll-block.spec.ts
│       └── ...
```

## AGENTS.md Content

Covers:
- Project overview & tech stack (Node 18.13.0, PHP 8.1+, pnpm 9+, React + WordPress)
- Directory structure (client/, includes/, tests/, docker/, e2e/)
- Quick-start commands (make install, make client, make verify)
- Code conventions (WordPress ESLint, WPCS for PHP, i18n domain)
- Architecture: block registration, PHP/JS attribute sync, API gateway pattern, synchronization
- Common pitfalls: pnpm not yarn, attributes duplicated in PHP+JS, version in 3 places, docker_env required first
- Testing overview and when to write which kind of test

## Agent Skills

### docker-dev-environment
**Trigger:** Setting up or troubleshooting the Docker development environment.

Covers: prerequisites, first-time setup (`make setup`), WordPress/PHPMyAdmin access, Crowdsignal API credentials in `docker/.env`, sandbox IP, Xdebug, troubleshooting, reset.

### running-tests
**Trigger:** Running tests or adding new tests.

Covers: `make verify` for full check, PHPUnit (`make phpunit`), Jest (`pnpm test`), E2E (`make e2e`), linting, how to add new tests of each type.

### release-process
**Trigger:** Preparing a release.

Covers: version update in 3 places, `make release`, translation generation, nightly build GitHub Action.

## Playwright E2E Tests

### Two-Tier Approach

**Tier 1 — No API key needed (always runs):**
- Plugin activation
- Block insertion in editor
- Admin settings page loads
- Static block markup renders

**Tier 2 — Requires API credentials (skips when absent):**
- Full poll creation lifecycle
- API connection verification
- Poll results fetching

Credentials: `CROWDSIGNAL_FORMS_API_PARTNER_GUID` and `CROWDSIGNAL_FORMS_API_USER_CODE` in `docker/.env`. Tests skip gracefully when not set.

### Tech
- `@playwright/test` + `@wordpress/e2e-test-utils-playwright`
- Tests run against existing Docker WordPress (localhost:8000)

## Makefile Changes

New targets:
- `make e2e` — Run Playwright E2E tests
- `make verify` — Full verification: build + PHPUnit + Jest + lint + E2E
- `make setup` — One-command first-time setup: install + docker + build

## Decisions

| Decision | Rationale |
|----------|-----------|
| AGENTS.md + thin CLAUDE.md | Cross-agent compatibility; CLAUDE.md just references AGENTS.md |
| Skills for procedures, not knowledge | AGENTS.md has better recall; skills for multi-step workflows |
| Two-tier E2E | Agents can verify without API creds; full integration when available |
| Docker as sandbox | Already exists, well-configured, safe for experimentation |
| `make verify` single command | One command for agents to validate all changes |
| No CI changes | Local verification sufficient per requirements |
