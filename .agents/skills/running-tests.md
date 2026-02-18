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
pnpm exec playwright test --config e2e/playwright.config.ts e2e/tests/plugin-activation.spec.ts

# Run in headed mode (visible browser)
pnpm exec playwright test --config e2e/playwright.config.ts --headed

# Run with debug inspector
pnpm exec playwright test --config e2e/playwright.config.ts --debug
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
