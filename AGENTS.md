# AGENTS.md — Crowdsignal Forms

WordPress Gutenberg plugin for interactive blocks (polls, votes, applause, NPS, feedback). React blocks rendered server-side by PHP. Communicates with the Crowdsignal API.

- **PHP:** 8.1+
- **WordPress:** 6.0+ (tested up to 6.9)
- **Package manager:** pnpm. Do not use npm or yarn (yarn is blocked; npm creates competing lockfiles).
- MUST run `nvm use` before any build/test commands.
- ALWAYS run `make verify` before submitting changes.

## Key Commands

| Command | Purpose |
|---------|---------|
| `make setup` | First-time setup: install deps + start Docker + build |
| `make verify` | Full verification: build + Jest + PHPUnit + E2E (lint excluded) |
| `make client` | Build all blocks + styles |
| `make phpunit` | Run PHPUnit tests in Docker |
| `make phpunit-studio` | Run PHPUnit locally via WordPress Studio (SQLite, no Docker) |
| `make phpunit ARGS="--filter TestName"` | Run a single PHPUnit test (also works with `phpunit-studio`) |
| `pnpm test` | Run Jest unit tests |
| `make e2e` | Run Playwright E2E tests |

## Common Pitfalls

1. **Block attributes MUST be duplicated** in both JS (`client/blocks/[name]/attributes.js`) and PHP (`includes/frontend/blocks/class-crowdsignal-forms-[name]-block.php`). A mismatch breaks blocks silently.
2. **Version lives in 3 places** — update ALL three when bumping:
   - `package.json` → `"version"`
   - `crowdsignal-forms.php` → header comment `Version:`
   - `crowdsignal-forms.php` → `CROWDSIGNAL_FORMS_VERSION` constant
3. **Frontend rendering is PHP** — blocks render server-side via PHP classes in `includes/frontend/blocks/`, not React save functions. The JS `save()` returns null or minimal markup.
4. **SCSS builds are per-block** — changing one block's SCSS doesn't rebuild others. Run `pnpm build:styles` to rebuild all.
5. **Crowdsignal API key required** — the plugin needs a Crowdsignal.com API key to create/fetch polls. Without it, editor blocks load but can't communicate with the API.
6. **E2E test tiers** — Tier 1 Playwright tests run without API credentials; Tier 2 requires them.

## Commits

- Short imperative subject line
- Reference PR/issue numbers when applicable
