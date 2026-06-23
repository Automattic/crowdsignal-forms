# Agent Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable any AI coding agent to work in crowdsignal-forms autonomously — understand the project, build it, run tests, verify changes, and experiment in a sandbox.

**Architecture:** Root AGENTS.md (~300 lines) for core knowledge, thin CLAUDE.md referencing it, three agent skills in `.agents/skills/` for multi-step procedures, Playwright E2E tests with two-tier approach (no-API and with-API), and new Makefile targets for agent-friendly workflows.

**Tech Stack:** WordPress Gutenberg plugin, React, PHP 8.1+, Node 18.13.0, pnpm, Playwright, Docker

---

### Task 1: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create the thin CLAUDE.md file**

```markdown
@AGENTS.md
```

That's the entire file. One line. This tells Claude Code to read AGENTS.md as its instructions.

**Step 2: Verify**

Confirm the file exists and contains only `@AGENTS.md`.

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Add CLAUDE.md referencing AGENTS.md for agent compatibility"
```

---

### Task 2: Create AGENTS.md

**Files:**
- Create: `AGENTS.md`

**Step 1: Write the AGENTS.md file**

```markdown
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
```

**Step 2: Verify the file reads well**

Read through it, check for accuracy against the actual codebase.

**Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "Add AGENTS.md with comprehensive project documentation for AI agents"
```

---

### Task 3: Create `.agents/skills/` directory and docker-dev-environment skill

**Files:**
- Create: `.agents/skills/docker-dev-environment.md`

**Step 1: Create the directory**

```bash
mkdir -p .agents/skills
```

**Step 2: Write the docker-dev-environment skill**

```markdown
# Docker Development Environment

## Prerequisites

- Docker Desktop installed and running
- Node 18.13.0 (`nvm use`)
- pnpm 9+ (`npm install -g pnpm` if needed)
- Composer (`brew install composer` on macOS)

## First-Time Setup

Run the all-in-one setup command:

```bash
make setup
```

This runs: `make install` → `make docker_env` → `make docker_build` → `make docker_up` → `make docker_install` → `make client`

If you prefer to run steps individually:

```bash
# 1. Install dependencies
make install

# 2. Create Docker env file
make docker_env

# 3. Build and start containers
make docker_build
make docker_up

# 4. Install WordPress
make docker_install

# 5. Build the plugin
make client
```

## Accessing the Environment

| Service | URL | Credentials |
|---------|-----|-------------|
| WordPress | http://localhost:8000 | wordpress / wordpress |
| WordPress Admin | http://localhost:8000/wp-admin | wordpress / wordpress |
| PHPMyAdmin | http://localhost:5050 | root / somewordpress |

## Crowdsignal API Credentials

The plugin requires a Crowdsignal API key for full functionality (creating polls, fetching results). Without it, blocks load in the editor but can't communicate with the API.

To configure:

1. Get an API key from https://app.crowdsignal.com/account/api
2. Edit `docker/.env` and set:
   ```
   CROWDSIGNAL_FORMS_API_PARTNER_GUID='your-partner-guid'
   CROWDSIGNAL_FORMS_API_USER_CODE='your-user-code'
   ```
3. Restart containers: `make docker_down && make docker_up`

Alternatively, configure via the WordPress admin: go to http://localhost:8000/wp-admin/admin.php?page=crowdsignal-forms-setup and follow the setup wizard.

## Connecting to Crowdsignal Sandbox

To point the Docker WordPress at a Crowdsignal sandbox instead of production:

```bash
# In docker/.env, set:
CS_SANDBOX_IP='<sandbox-ip-address>'
```

This overrides DNS for `api.crowdsignal.com`, `app.crowdsignal.com`, and `api.polldaddy.com` via Docker's `extra_hosts`.

## Xdebug

Xdebug is pre-configured in the Docker image. To use it:

1. Set your IDE's Xdebug server name to `Test` (matches `PHP_IDE_CONFIG=serverName=Test` in env)
2. Configure path mappings:
   - `/var/www/html/wp-content/plugins/crowdsignal-forms` → project root
3. Start listening for Xdebug connections in your IDE

## Container Management

```bash
make docker_up       # Start containers (detached)
make docker_stop     # Stop containers (preserve data)
make docker_down     # Stop and remove containers (preserve volumes)
make docker_sh       # Shell into WordPress container
make docker_sh_db    # Shell into MySQL container
```

## Troubleshooting

### Containers won't start
- Check Docker Desktop is running: `docker info`
- Check port conflicts: `lsof -i :8000` and `lsof -i :5050`
- Recreate env: `rm docker/.env && make docker_env`

### Plugin not appearing in WordPress
- Check volume mount: `make docker_sh` then `ls /var/www/html/wp-content/plugins/crowdsignal-forms/`
- Activate manually: `make docker_sh` then `wp --allow-root plugin activate crowdsignal-forms`

### Database connection issues
- Check MySQL is running: `docker-compose -f docker/docker-compose.yml ps`
- Wait for MySQL startup (can take 30s on first run)
- Check logs: `docker-compose -f docker/docker-compose.yml logs db`

### Test database not set up
- PHPUnit tests need the WordPress test framework. It's auto-mounted at `/tmp/wordpress-develop`.
- If tests fail with "WordPress not found", try: `make docker_down && make docker_build && make docker_up`

### Full reset
```bash
make docker_down
rm -rf docker/data docker/wordpress docker/.env
make docker_env && make docker_build && make docker_up && make docker_install
```
```

**Step 3: Commit**

```bash
git add .agents/skills/docker-dev-environment.md
git commit -m "Add docker-dev-environment agent skill"
```

---

### Task 4: Create running-tests skill

**Files:**
- Create: `.agents/skills/running-tests.md`

**Step 1: Write the running-tests skill**

```markdown
# Running Tests

## Quick Reference

```bash
make verify                              # FULL verification (build + all tests + lint)
make phpunit                             # PHP integration tests
make phpunit ARGS="--filter TestName"    # Single PHP test
pnpm test                                # Jest JS unit tests
make e2e                                 # Playwright E2E tests
pnpm lint:all                            # JS + SCSS lint
make phpcs                               # PHP lint
```

**ALWAYS run `make verify` before submitting any changes.**

## PHPUnit (PHP Tests)

Tests run inside the Docker WordPress container against a test database.

**Prerequisites:** Docker containers must be running (`make docker_up`).

```bash
# Run all PHP tests
make phpunit

# Run a specific test class
make phpunit ARGS="--filter Crowdsignal_Forms_Poll_Test"

# Run a specific test method
make phpunit ARGS="--filter test_create_poll"

# Run with coverage
make phpunit ARGS="--coverage-text"
```

**Adding a new PHPUnit test:**

1. Create file in `tests/unit-tests/includes/` mirroring the source structure
2. Extend `Crowdsignal_Forms_Unit_Test_Case` (from `tests/framework/`)
3. Name the file `class-test-[name].php`
4. Name the class `Crowdsignal_Forms_[Name]_Test`

Example:
```php
<?php
namespace Crowdsignal_Forms\Tests;

class Crowdsignal_Forms_My_Feature_Test extends Crowdsignal_Forms_Unit_Test_Case {
    public function test_my_feature_works() {
        // Arrange
        $instance = new \Crowdsignal_Forms\My_Feature();

        // Act
        $result = $instance->do_something();

        // Assert
        $this->assertEquals( 'expected', $result );
    }
}
```

## Jest (JavaScript Tests)

```bash
# Run all JS tests
pnpm test

# Run in watch mode
pnpm test -- --watch

# Run a specific test file
pnpm test -- --testPathPattern="poll"
```

**Adding a new Jest test:**

1. Create `__tests__/` directory next to the file being tested, or create a `.test.js` file
2. WordPress modules are mocked in `tests-js/mocks/` — check if your imports need mocks
3. The `client/` directory is in `modulePaths`, so you can import from `components/`, `state/`, etc. directly

Example:
```javascript
import { myFunction } from '../my-module';

describe( 'myFunction', () => {
    test( 'returns expected value', () => {
        expect( myFunction( 'input' ) ).toBe( 'output' );
    } );
} );
```

## Playwright E2E Tests

E2E tests verify that blocks work in a real WordPress environment.

**Prerequisites:** Docker containers running with WordPress installed (`make docker_up`).

```bash
# Run all E2E tests
make e2e

# Run a specific test file
pnpm exec playwright test e2e/tests/plugin-activation.spec.ts

# Run in headed mode (visible browser)
pnpm exec playwright test --headed

# Run with debug inspector
pnpm exec playwright test --debug
```

### Two-Tier Test Structure

**Tier 1 (always runs):** Plugin activation, block insertion in editor, admin page loads, static markup.

**Tier 2 (requires API credentials):** Full poll lifecycle, API integration. These tests check for `CROWDSIGNAL_FORMS_API_PARTNER_GUID` in `docker/.env` and skip if not set.

## Linting

```bash
# All linting (JS + SCSS + PHP)
pnpm lint:all && make phpcs

# Auto-fix
pnpm format:js          # Fix JS formatting
make phpcbf              # Fix PHP formatting
```

## Interpreting Failures

| Failure | Likely Cause |
|---------|-------------|
| PHPUnit "WordPress not found" | Docker not running or test framework not mounted |
| Jest module not found | Missing mock in `tests-js/mocks/` or wrong import path |
| E2E timeout | Docker WordPress not responding on localhost:8000 |
| PHPCS errors | WordPress coding standards violation — run `make phpcbf` to auto-fix |
| ESLint i18n-text-domain | Used wrong text domain — must be `crowdsignal-forms` |
```

**Step 2: Commit**

```bash
git add .agents/skills/running-tests.md
git commit -m "Add running-tests agent skill"
```

---

### Task 5: Create release-process skill

**Files:**
- Create: `.agents/skills/release-process.md`

**Step 1: Write the release-process skill**

```markdown
# Release Process

## Version Bump

Update the version in ALL THREE places:

1. **`package.json`** — `"version": "X.Y.Z"`
2. **`crowdsignal-forms.php`** — header comment: `Version: X.Y.Z`
3. **`crowdsignal-forms.php`** — constant: `define( 'CROWDSIGNAL_FORMS_VERSION', 'X.Y.Z' )`

Also update `includes/admin/class-crowdsignal-forms-setup.php` if the admin CSS version is hardcoded (check the `admin_enqueue_scripts` method).

## Build and Package

```bash
# Full verification first
make verify

# Generate translation file
make pot

# Build and package for release
make release
```

This runs:
1. `make clean-release` — removes old build + release dirs
2. `make client` — rebuilds all JS + CSS
3. `make pot` — generates `.pot` translation file via `scripts/makepot.sh`
4. `scripts/package-for-release.sh` — creates the release ZIP

The output ZIP is in the `release/` directory.

## GitHub Nightly Build

The repo has a manual GitHub Actions workflow (`.github/workflows/nightly-build.yml`) that:
1. Accepts `buildBranch` and `releaseName` inputs
2. Sets up PHP 8.1, Node 18.13.0, pnpm 9
3. Runs `make client`
4. Packages with `scripts/package-for-release.sh`
5. Creates a GitHub pre-release with the ZIP

Trigger it from GitHub Actions → "Nightly Build" → "Run workflow".

## Checklist

- [ ] Version bumped in all 3 places
- [ ] `make verify` passes (build + tests + lint)
- [ ] `make pot` generated fresh translation file
- [ ] `make release` produces clean ZIP
- [ ] Changelog updated (if applicable)
```

**Step 2: Commit**

```bash
git add .agents/skills/release-process.md
git commit -m "Add release-process agent skill"
```

---

### Task 6: Add Playwright E2E infrastructure

**Files:**
- Create: `e2e/playwright.config.ts`
- Create: `e2e/tests/plugin-activation.spec.ts`
- Create: `e2e/tests/poll-block.spec.ts`
- Modify: `package.json` (add devDependencies)

**Step 1: Install Playwright dependencies**

```bash
pnpm add -D @playwright/test @wordpress/e2e-test-utils-playwright
pnpm exec playwright install chromium
```

**Step 2: Create Playwright config**

Create `e2e/playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig( {
	testDir: './tests',
	fullyParallel: false,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: process.env.WP_BASE_URL || 'http://localhost:8000',
		storageState: './e2e/.auth/storage-state.json',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/,
			use: { storageState: undefined },
		},
		{
			name: 'e2e',
			dependencies: [ 'setup' ],
		},
	],
} );
```

**Step 3: Create auth setup file**

Create `e2e/tests/auth.setup.ts`:

```typescript
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join( __dirname, '../.auth/storage-state.json' );

setup( 'authenticate', async ( { page } ) => {
	await page.goto( '/wp-login.php' );
	await page.fill( '#user_login', 'wordpress' );
	await page.fill( '#user_pass', 'wordpress' );
	await page.click( '#wp-submit' );
	await page.waitForURL( /wp-admin/ );
	await expect( page.locator( '#wpadminbar' ) ).toBeVisible();
	await page.context().storageState( { path: authFile } );
} );
```

**Step 4: Create .gitignore for auth state**

Create `e2e/.auth/.gitignore`:

```
storage-state.json
```

**Step 5: Create Tier 1 test — plugin activation**

Create `e2e/tests/plugin-activation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe( 'Plugin Activation', () => {
	test( 'Crowdsignal Forms plugin is active', async ( { page } ) => {
		await page.goto( '/wp-admin/plugins.php' );
		const pluginRow = page.locator( '[data-slug="crowdsignal-forms"]' );
		await expect( pluginRow ).toBeVisible();
		await expect( pluginRow.locator( '.deactivate' ) ).toBeVisible();
	} );

	test( 'Crowdsignal Forms settings page loads', async ( { page } ) => {
		await page.goto(
			'/wp-admin/admin.php?page=crowdsignal-forms-setup'
		);
		await expect( page ).not.toHaveTitle( /Error/ );
		await expect( page.locator( '#wpadminbar' ) ).toBeVisible();
	} );
} );
```

**Step 6: Create Tier 1 test — poll block in editor**

Create `e2e/tests/poll-block.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe( 'Poll Block', () => {
	test( 'can insert poll block in editor', async ( { page } ) => {
		// Create a new post
		await page.goto( '/wp-admin/post-new.php' );

		// Wait for the editor to load
		await page.waitForSelector( '.edit-post-layout' );

		// Close any welcome modals
		const welcomeModal = page.locator(
			'role=dialog[name="Welcome to the block editor"]'
		);
		if ( await welcomeModal.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await page.keyboard.press( 'Escape' );
		}

		// Open the inserter
		await page.click(
			'role=button[name="Toggle block inserter"]'
		);

		// Search for crowdsignal poll
		await page.fill(
			'role=searchbox[name="Search"]',
			'Crowdsignal Poll'
		);

		// Click the poll block option
		const pollBlock = page.locator(
			'role=option[name=/Poll/i]'
		).first();
		await expect( pollBlock ).toBeVisible( { timeout: 5000 } );
	} );
} );
```

**Step 7: Verify tests run**

```bash
make docker_up
pnpm exec playwright test --config e2e/playwright.config.ts
```

Expected: auth setup passes, plugin-activation tests pass, poll-block test passes (block should be insertable even without API key).

**Step 8: Commit**

```bash
git add e2e/ package.json pnpm-lock.yaml
git commit -m "Add Playwright E2E test infrastructure with Tier 1 smoke tests"
```

---

### Task 7: Add new Makefile targets

**Files:**
- Modify: `Makefile`

**Step 1: Add `e2e` target**

Add after the `phpcs` / `phpcbf` targets:

```makefile
e2e:
	pnpm exec playwright test --config e2e/playwright.config.ts
```

**Step 2: Add `verify` target**

```makefile
verify: client
	pnpm test
	pnpm lint:all
	$(MAKE) phpcs
	$(MAKE) phpunit
	$(MAKE) e2e
```

**Step 3: Add `setup` target**

```makefile
setup: install docker_env docker_build docker_up
	sleep 10
	$(MAKE) docker_install
	$(MAKE) client
```

The `sleep 10` gives MySQL time to initialize on first run.

**Step 4: Update `.PHONY`**

Add `e2e verify setup` to the `.PHONY` line.

**Step 5: Run `make help` or verify targets exist**

```bash
make -n verify
make -n setup
make -n e2e
```

Expected: each prints the commands it would run without executing them.

**Step 6: Commit**

```bash
git add Makefile
git commit -m "Add make targets: setup, verify, and e2e"
```

---

### Task 8: Verify everything works end-to-end

**Step 1: Run `make verify` from a clean state**

```bash
make docker_up
make verify
```

Expected: build succeeds, Jest passes, PHPUnit passes (Docker must be running), lint passes, E2E passes.

**Step 2: Test the AGENTS.md is readable**

Open a fresh Claude Code session in the repo and ask it to explain the project. It should pick up AGENTS.md via the CLAUDE.md reference.

**Step 3: Test the skills are discoverable**

Ask Claude Code to "set up the Docker development environment" — it should invoke the docker-dev-environment skill.

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "Fix issues found during end-to-end verification"
```

---

## Summary of Deliverables

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Thin reference: `@AGENTS.md` |
| `AGENTS.md` | Core project knowledge for agents (~300 lines) |
| `.agents/skills/docker-dev-environment.md` | Docker setup & troubleshooting skill |
| `.agents/skills/running-tests.md` | Test execution & authoring skill |
| `.agents/skills/release-process.md` | Release packaging skill |
| `e2e/playwright.config.ts` | Playwright configuration |
| `e2e/tests/auth.setup.ts` | WordPress login for E2E |
| `e2e/tests/plugin-activation.spec.ts` | Tier 1: plugin activation test |
| `e2e/tests/poll-block.spec.ts` | Tier 1: poll block editor test |
| `Makefile` (modified) | New targets: `setup`, `verify`, `e2e` |
