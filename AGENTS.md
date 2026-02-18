# AGENTS.md — Crowdsignal Forms

## Project Overview

Crowdsignal Forms is a WordPress Gutenberg plugin that adds interactive blocks (polls, votes, applause, NPS, feedback) to the WordPress editor. Blocks are built with React and rendered server-side with PHP. The plugin communicates with the Crowdsignal API to store and retrieve poll data.

- **Tech stack:** React (blocks) + PHP (plugin) + SCSS (styles)
- **Node:** 18.13.0 (exact — see `.nvmrc`). MUST use `nvm use` before running commands.
- **Package manager:** pnpm 9+. MUST use pnpm. Yarn is explicitly blocked.
- **PHP:** 8.1+
- **WordPress:** 6.0+ (tested up to 6.9)

## Quick Start

```bash
make setup     # First-time: install deps + start Docker + build
make verify    # Before submitting: build + all tests + lint
```

## Directory Structure

```
client/                  React/JS source code
├── blocks/              Gutenberg block definitions (poll, vote, applause, nps, feedback, cs-embed)
│   └── [block]/
│       ├── index.js     Block registration
│       ├── attributes.js Block attribute schema
│       ├── edit.js      Editor component
│       ├── sidebar.js   Inspector controls
│       └── toolbar.js   Toolbar controls
├── components/          Shared React components
├── state/               Redux-like state (reducer, actions, action-types)
├── data/                API data fetching per block
├── hooks/               Custom React hooks
├── lib/                 Utility libraries
└── apifetch/            Custom WordPress apiFetch wrapper

includes/                PHP plugin code (PSR-4 autoloaded)
├── admin/               Admin UI, settings, setup wizard
├── auth/                Crowdsignal API authentication
├── frontend/
│   └── blocks/          PHP block renderers (one class per block)
├── gateways/            API gateway abstraction (real + canned for tests)
├── models/              Data models (Poll, Poll_Settings, etc.)
├── rest-api/
│   └── controllers/     REST API controllers (polls, nps, feedback, account)
├── synchronization/     Block <-> Crowdsignal API sync on post save
└── logging/             Webservice logger

tests/                   PHPUnit tests
├── bootstrap.php        Test environment setup
├── framework/           Base test case class
├── unit-tests/includes/ Test files mirroring includes/ structure
└── canned-data/         Mock API data for Canned_Api_Gateway

tests-js/                Jest test mocks
├── mocks/blocks.js      Mock for @wordpress/blocks
└── mocks/i18n.js        Mock for @wordpress/i18n

e2e/                     Playwright E2E tests
docker/                  Docker development environment
assets/stylesheets/      SCSS source files (one per block)
build/                   Compiled JS + CSS (generated, do not edit)
```

## Commands

| Command | Purpose |
|---------|---------|
| `make setup` | First-time setup: install + Docker + build |
| `make install` | Install Node + PHP dependencies |
| `make client` | Build all blocks + styles |
| `make verify` | Full verification: build + PHPUnit + Jest + lint + E2E |
| `make phpunit` | Run PHPUnit tests in Docker |
| `make phpunit ARGS="--filter TestName"` | Run a single PHPUnit test |
| `pnpm test` | Run Jest unit tests |
| `make e2e` | Run Playwright E2E tests |
| `pnpm lint:all` | Lint JS + SCSS |
| `make phpcs` | Lint PHP (WordPress Coding Standards) |
| `make phpcbf` | Auto-fix PHP lint issues |
| `make docker_up` | Start Docker containers |
| `make docker_down` | Stop and remove Docker containers |
| `make docker_sh` | Shell into WordPress container |

## Code Conventions

### JavaScript / React
- ESLint: `@wordpress/eslint-plugin/recommended` (see `.eslintrc.json`)
- Use `@wordpress/*` packages for WordPress integration
- i18n text domain: `crowdsignal-forms` (enforced by ESLint)
- Components importable from `components/` (webpack alias from `client/`)
- State management via custom Redux-like store in `client/state/`

### PHP
- WordPress Coding Standards (enforced by PHPCS)
- PSR-4 autoloading via `includes/class-autoloader.php`
- Namespace: `Crowdsignal_Forms\*` maps to `includes/*`
- Class names use underscores; directories use dashes

### SCSS
- One stylesheet per block in `assets/stylesheets/`
- Compiled separately: `build/poll.css`, `build/vote.css`, etc.
- Run `pnpm build:styles` after any SCSS changes

### Commits
- Short imperative subject line
- Reference PR/issue numbers when applicable

## Architecture

### Block Registration (CRITICAL — read this)

Each block exists in both JavaScript and PHP. **Attribute schemas MUST match exactly between the two.**

JavaScript definition (`client/blocks/[name]/attributes.js`):
```javascript
export default {
  pollId: { type: 'string', default: null },
  question: { type: 'string', default: '' },
  // ...
};
```

PHP definition (`includes/frontend/blocks/class-crowdsignal-forms-[name]-block.php`):
```php
public static function attributes() {
  return [
    'pollId' => [ 'type' => 'string', 'default' => null ],
    'question' => [ 'type' => 'string', 'default' => '' ],
    // ...
  ];
}
```

The comment in `client/blocks/poll/attributes.js` says it explicitly:
> "Any changes made to the attributes definition need to be duplicated in class-crowdsignal-forms-poll-block.php"

### Synchronization

`Poll_Block_Synchronizer` hooks into `save_post`. When a post containing poll blocks is saved, it:
1. Parses block content for poll blocks
2. Creates or updates poll records via the API gateway
3. Stores poll IDs in post meta

### API Gateway Pattern

Two implementations of `Api_Gateway_Interface`:
- `Api_Gateway` — real HTTP calls to Crowdsignal API
- `Canned_Api_Gateway` — reads mock data from `tests/canned-data/api-data.json` (used in tests)

### REST API

Namespace: `crowdsignal-forms/v1`
Controllers in `includes/rest-api/controllers/`:
- `Polls_Controller` — CRUD for polls
- `Nps_Controller` — NPS surveys
- `Feedback_Controller` — Feedback forms
- `Account_Controller` — Account capabilities

### Authentication

`Crowdsignal_Forms_Api_Authenticator` manages API key and user code storage as WordPress options. The auth provider is filterable via `crowdsignal_forms_get_auth_provider`.

## Common Pitfalls

1. **MUST use pnpm** — `yarn` is blocked in `package.json`. Do not use `npm` either. Always `pnpm`.
2. **Block attributes MUST be duplicated** — JS in `client/blocks/[name]/attributes.js`, PHP in `includes/frontend/blocks/class-crowdsignal-forms-[name]-block.php`. Miss one and blocks break silently.
3. **Version lives in 3 places** — update ALL three when bumping version:
   - `package.json` → `"version": "X.Y.Z"`
   - `crowdsignal-forms.php` → header comment `Version: X.Y.Z`
   - `crowdsignal-forms.php` → `define( 'CROWDSIGNAL_FORMS_VERSION', 'X.Y.Z' )`
4. **Docker requires `make docker_env` first** — creates `docker/.env` from `docker/default.env`. Without it, containers won't start.
5. **Node version is exact** — must be 18.13.0 per `.nvmrc`. Use `nvm use` before running build commands.
6. **SCSS builds are per-block** — changing one block's SCSS doesn't rebuild others. Run `pnpm build:styles` to rebuild all.
7. **Do not edit files in `build/`** — these are generated. Edit source in `client/` and `assets/stylesheets/`.
8. **PHPUnit needs Docker** — tests run inside the WordPress container against a test database. Use `make phpunit`.
9. **Frontend rendering is PHP** — blocks render server-side via PHP classes, not React save functions.
10. **Crowdsignal API key required for full functionality** — the plugin needs a Crowdsignal.com API key to create/fetch polls. Without it, the editor blocks load but can't communicate with the API. See docker-dev-environment skill for setup.

## Testing Strategy

- **PHPUnit** (`make phpunit`): PHP integration tests. Test models, gateways, synchronizers, REST controllers. Extend `Crowdsignal_Forms_Unit_Test_Case`.
- **Jest** (`pnpm test`): JS unit tests. Test React components and utilities. Mocks for `@wordpress/blocks` and `@wordpress/i18n` in `tests-js/mocks/`.
- **Playwright** (`make e2e`): E2E browser tests. Verify blocks work in the WordPress editor and frontend. Tier 1 tests run without API credentials; Tier 2 requires them.
- **ALWAYS run `make verify` before submitting changes.**

## Sandbox Environment

Docker provides a fully isolated WordPress instance. See the `docker-dev-environment` skill for detailed setup instructions. Key facts:
- WordPress: `http://localhost:8000` (admin: wordpress / wordpress)
- PHPMyAdmin: `http://localhost:5050`
- Plugin code is volume-mounted — changes appear immediately
- Database is local to the container — safe to experiment
