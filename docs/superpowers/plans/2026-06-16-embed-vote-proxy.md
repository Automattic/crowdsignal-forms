# Embed Vote Proxy Implementation Plan (plugin)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make embedded classic-poll votes survive tracker-blockers and third-party-cookie loss by serving render + vote first-party through the host WordPress site.

**Architecture:** A `wp_embed_register_handler` intercepts pasted classic-poll URLs; the handler fetches the poll's embed script server-side, inlines it from the host origin, and repoints its vote target to a host REST relay. The relay forwards the vote to Crowdsignal server-side, authenticated with the account's existing API credentials and including the visitor's IP. A first-party `voter_id` replaces the lost third-party repeat-vote cookie. Use plain `wp_remote_*` for the outbound calls — **not** the plugin's `Api_Gateway` (which injects the API key and hardcodes `api.crowdsignal.com`); send the credentials explicitly.

**Tech Stack:** PHP (WordPress, WordPress-Extra standards, tabs), `wp_remote_*`, WP REST (`crowdsignal-forms/v1`), PHPUnit (`WP_UnitTestCase`), Jest. Run from the plugin's Docker env (`make phpunit`).

**Source spec:** `docs/superpowers/specs/2026-06-16-embed-vote-proxy-design.md`

**Scope note:** This plan is plugin-only. The Crowdsignal service accepts the authenticated, IP-forwarding vote already; that behaviour is documented and tracked separately and is **not** part of this plan.

---

## File Structure

New files under `includes/legacy-poll-proxy/` (one responsibility each), plus one controller:

- `class-legacy-poll-gateway.php` — server-to-server HTTP (fetch embed script; forward vote with credentials + voter IP).
- `class-loader-rewriter.php` — pure string transform of the embed script (repoint vote target).
- `class-voter-identity.php` — resolve/issue the first-party `voter_id`.
- `class-vote-dedup-store.php` — persistent `(poll_id, voter_id)` dedup.
- `includes/rest-api/controllers/class-legacy-poll-vote-controller.php` — the relay route.
- `class-legacy-poll-embed-handler.php` — registers the embed handler, renders inlined + rewritten markup, wires `voter_id`.

Credentials: read the stored partner GUID + user code via the existing authenticator (`Crowdsignal_Forms::instance()->get_api_authenticator()->get_api_key()` / `->get_user_code()`).

---

## Task 1: Legacy poll gateway (server-to-server HTTP)

**Files:**
- Create: `includes/legacy-poll-proxy/class-legacy-poll-gateway.php`
- Test: `tests/unit-tests/includes/legacy-poll-proxy/test-class.legacy-poll-gateway.php`

- [ ] **Step 1: Write the failing test** (mock HTTP via `pre_http_request` so no network is hit)

```php
<?php
use Crowdsignal_Forms\Legacy_Poll_Proxy\Legacy_Poll_Gateway;

class Legacy_Poll_Gateway_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function tear_down() {
		remove_all_filters( 'pre_http_request' );
		parent::tear_down();
	}

	public function test_cast_vote_sends_credentials_and_voter_ip() {
		$captured = array();
		add_filter(
			'pre_http_request',
			function ( $pre, $args, $url ) use ( &$captured ) {
				$captured['url']     = $url;
				$captured['headers'] = $args['headers'];
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => wp_json_encode(
						array( 'data' => array( 'result' => 'registered' ), 'status' => 'success' )
					),
				);
			},
			10,
			3
		);

		$gateway = new Legacy_Poll_Gateway( 'PARTNER-GUID', 'USER-CODE' );
		$result  = $gateway->cast_vote( 17014142, '123', '203.0.113.7', 'UA/1.0' );

		$this->assertStringContainsString( 'p=17014142', $captured['url'] );
		$this->assertStringContainsString( 'a=123', $captured['url'] );
		$this->assertSame( 'PARTNER-GUID', $captured['headers']['X-API-Partner-Guid'] );
		$this->assertSame( 'USER-CODE', $captured['headers']['X-API-User-Code'] );
		$this->assertSame( '203.0.113.7', $captured['headers']['X-IP-TRAIL'] );
		$this->assertArrayNotHasKey( 'x-api-partner-guid', array_change_key_case( $captured['headers'] ) + array() );
		$this->assertSame( 'registered', $result['data']['result'] );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Legacy_Poll_Gateway_Test"`
Expected: FAIL — class `Legacy_Poll_Gateway` not found.

- [ ] **Step 3: Write minimal implementation**

```php
<?php
namespace Crowdsignal_Forms\Legacy_Poll_Proxy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Server-to-server HTTP for the classic poll proxy. Uses plain wp_remote_* with
 * explicit headers — deliberately NOT the CS Api_Gateway, so the credentials are
 * sent only on the calls that need them and nothing leaks to other hosts.
 */
class Legacy_Poll_Gateway {

	const EMBED_URL = 'https://secure.polldaddy.com/p/%d.js';
	const VOTE_URL  = 'https://polls.polldaddy.com/vote-js.php';

	private $partner_guid;
	private $user_code;

	public function __construct( $partner_guid, $user_code ) {
		$this->partner_guid = $partner_guid;
		$this->user_code    = $user_code;
	}

	/**
	 * Fetch the poll's embed script. Returns string body or WP_Error.
	 */
	public function fetch_embed_script( $poll_id ) {
		$response = wp_remote_get( sprintf( self::EMBED_URL, absint( $poll_id ) ), array( 'timeout' => 5 ) );
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		return wp_remote_retrieve_body( $response );
	}

	/**
	 * Forward a vote server-side, authenticated, attributing the visitor IP.
	 *
	 * @return array|\WP_Error Decoded JSON, or WP_Error on transport failure.
	 */
	public function cast_vote( $poll_id, $answer_ids, $voter_ip, $voter_ua ) {
		$url = add_query_arg(
			array(
				'p'      => absint( $poll_id ),
				'a'      => rawurlencode( $answer_ids ),
				'format' => 'json',
			),
			self::VOTE_URL
		);

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 5,
				'headers' => array(
					'X-API-Partner-Guid' => $this->partner_guid,
					'X-API-User-Code'    => $this->user_code,
					'X-IP-TRAIL'         => $voter_ip,
					'User-Agent'         => $voter_ua,
				),
			)
		);
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		return json_decode( wp_remote_retrieve_body( $response ), true );
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Legacy_Poll_Gateway_Test"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/legacy-poll-proxy/class-legacy-poll-gateway.php tests/unit-tests/includes/legacy-poll-proxy/test-class.legacy-poll-gateway.php
git commit -m "feat: add legacy poll gateway for first-party vote relay"
```

---

## Task 2: Voter identity

**Files:**
- Create: `includes/legacy-poll-proxy/class-voter-identity.php`
- Test: `tests/unit-tests/includes/legacy-poll-proxy/test-class.voter-identity.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
use Crowdsignal_Forms\Legacy_Poll_Proxy\Voter_Identity;

class Voter_Identity_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function test_logged_in_id_is_stable_and_opaque() {
		wp_set_current_user( $this->get_user_by_role( 'subscriber' ) );
		$a = ( new Voter_Identity() )->resolve( null );
		$b = ( new Voter_Identity() )->resolve( null );
		$this->assertSame( $a, $b );
		$this->assertSame( 32, strlen( $a ) );
	}

	public function test_anonymous_uses_supplied_cookie_token() {
		wp_set_current_user( 0 );
		$this->assertSame( 'abc-anon', ( new Voter_Identity() )->resolve( 'abc-anon' ) );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Voter_Identity_Test"`
Expected: FAIL — class not found.

- [ ] **Step 3: Write minimal implementation**

```php
<?php
namespace Crowdsignal_Forms\Legacy_Poll_Proxy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stable first-party voter id for dedup. Logged-in users get a salted hash of
 * their WP user id; anonymous visitors use the cookie token the front end supplies.
 */
class Voter_Identity {

	public function resolve( $anon_token ) {
		$user_id = get_current_user_id();
		if ( $user_id > 0 ) {
			return hash_hmac( 'md5', 'cs-voter-' . $user_id, wp_salt( 'auth' ) );
		}
		return sanitize_text_field( (string) $anon_token );
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Voter_Identity_Test"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/legacy-poll-proxy/class-voter-identity.php tests/unit-tests/includes/legacy-poll-proxy/test-class.voter-identity.php
git commit -m "feat: add first-party voter identity resolver"
```

---

## Task 3: Vote dedup store

**Files:**
- Create: `includes/legacy-poll-proxy/class-vote-dedup-store.php`
- Test: `tests/unit-tests/includes/legacy-poll-proxy/test-class.vote-dedup-store.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
use Crowdsignal_Forms\Legacy_Poll_Proxy\Vote_Dedup_Store;

class Vote_Dedup_Store_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function test_first_vote_allowed_then_blocked() {
		$store = new Vote_Dedup_Store();
		$this->assertFalse( $store->has_voted( 17014142, 'voter-A' ) );
		$store->record( 17014142, 'voter-A' );
		$this->assertTrue( $store->has_voted( 17014142, 'voter-A' ) );
		$this->assertFalse( $store->has_voted( 17014142, 'voter-B' ) );
		$this->assertFalse( $store->has_voted( 999, 'voter-A' ) );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Vote_Dedup_Store_Test"`
Expected: FAIL — class not found.

- [ ] **Step 3: Write minimal implementation**

```php
<?php
namespace Crowdsignal_Forms\Legacy_Poll_Proxy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Persistent (poll_id, voter_id) dedup, transient-backed. Replaces the lost
 * third-party repeat-vote cookie.
 */
class Vote_Dedup_Store {

	const TTL = 2592000; // 30 days.

	private function key( $poll_id, $voter_id ) {
		return 'cs_lpv_' . absint( $poll_id ) . '_' . md5( (string) $voter_id );
	}

	public function has_voted( $poll_id, $voter_id ) {
		return false !== get_transient( $this->key( $poll_id, $voter_id ) );
	}

	public function record( $poll_id, $voter_id ) {
		set_transient( $this->key( $poll_id, $voter_id ), 1, self::TTL );
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Vote_Dedup_Store_Test"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/legacy-poll-proxy/class-vote-dedup-store.php tests/unit-tests/includes/legacy-poll-proxy/test-class.vote-dedup-store.php
git commit -m "feat: add persistent vote dedup store"
```

---

## Task 4: REST relay controller

**Files:**
- Create: `includes/rest-api/controllers/class-legacy-poll-vote-controller.php`
- Modify: `includes/class-crowdsignal-forms.php` (register on `rest_api_init`, mirroring existing controllers)
- Test: `tests/unit-tests/includes/rest-api/controllers/test-class.legacy-poll-vote-controller.php`

The route path must satisfy the inlined embed's vote-URL construction (the rewriter, Task 5, sets the embed's vote base to this route). Register it so its full path ends in `/vote-js.php`.

- [ ] **Step 1: Write the failing test** (inject a fake gateway; assert dedup + IP forwarding)

```php
<?php
use Crowdsignal_Forms\Rest_Api\Controllers\Legacy_Poll_Vote_Controller;
use Crowdsignal_Forms\Legacy_Poll_Proxy\Vote_Dedup_Store;

class Legacy_Poll_Vote_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function test_relays_vote_and_records_dedup() {
		$fake = new class() {
			public $voted_ip = null;
			public function cast_vote( $poll_id, $a, $ip, $ua ) {
				$this->voted_ip = $ip;
				return array( 'data' => array( 'result' => 'registered' ), 'status' => 'success' );
			}
		};
		$_SERVER['REMOTE_ADDR'] = '203.0.113.9';

		$controller = new Legacy_Poll_Vote_Controller( $fake, new Vote_Dedup_Store() );
		$req        = new \WP_REST_Request( 'POST', '/crowdsignal-forms/v1/legacy-poll-vote/vote-js.php' );
		$req->set_param( 'p', 17014142 );
		$req->set_param( 'a', '123' );
		$req->set_param( 'voter_id', 'voter-X' );

		$res = $controller->vote( $req );
		$this->assertSame( 200, $res->get_status() );
		$this->assertSame( '203.0.113.9', $fake->voted_ip );

		$res2 = $controller->vote( $req );
		$this->assertSame( 'already-registered', $res2->get_data()['data']['result'] );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Legacy_Poll_Vote_Controller_Test"`
Expected: FAIL — class not found.

- [ ] **Step 3: Write minimal implementation**

```php
<?php
namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Legacy_Poll_Proxy\Legacy_Poll_Gateway;
use Crowdsignal_Forms\Legacy_Poll_Proxy\Vote_Dedup_Store;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Poll_Vote_Controller {

	protected $namespace = 'crowdsignal-forms/v1';
	protected $rest_base = 'legacy-poll-vote';
	private $gateway;
	private $dedup;

	public function __construct( $gateway = null, $dedup = null ) {
		if ( $gateway ) {
			$this->gateway = $gateway;
		} else {
			$auth          = Crowdsignal_Forms::instance()->get_api_authenticator();
			$this->gateway = new Legacy_Poll_Gateway( $auth->get_api_key(), $auth->get_user_code() );
		}
		$this->dedup = $dedup ? $dedup : new Vote_Dedup_Store();
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/vote-js.php',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'vote' ),
					'permission_callback' => '__return_true',
					'args'                => array(
						'p'        => array( 'required' => true, 'sanitize_callback' => 'absint' ),
						'a'        => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
						'voter_id' => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
					),
				),
			)
		);
	}

	public function vote( $request ) {
		$poll_id  = absint( $request->get_param( 'p' ) );
		$answers  = $request->get_param( 'a' );
		$voter_id = $request->get_param( 'voter_id' );

		if ( $this->dedup->has_voted( $poll_id, $voter_id ) ) {
			return new \WP_REST_Response(
				array( 'data' => array( 'result' => 'already-registered' ), 'status' => 'success' ),
				200
			);
		}

		$result = $this->gateway->cast_vote( $poll_id, $answers, $this->voter_ip(), $this->voter_ua() );
		if ( is_wp_error( $result ) ) {
			return new \WP_REST_Response( array( 'error' => 'relay', 'status' => 'error' ), 502 );
		}
		if ( isset( $result['status'] ) && 'success' === $result['status'] ) {
			$this->dedup->record( $poll_id, $voter_id );
		}
		return new \WP_REST_Response( $result, 200 );
	}

	/**
	 * The visitor hit the relay first-party, so REMOTE_ADDR is the visitor
	 * (filterable for sites behind a CDN).
	 */
	private function voter_ip() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		return apply_filters( 'crowdsignal_forms_legacy_vote_voter_ip', $ip );
	}

	private function voter_ua() {
		return isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
	}
}
```

Wire it in `includes/class-crowdsignal-forms.php` where existing controllers register on `rest_api_init`:
`( new \Crowdsignal_Forms\Rest_Api\Controllers\Legacy_Poll_Vote_Controller() )->register_routes();`

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Legacy_Poll_Vote_Controller_Test"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/rest-api/controllers/class-legacy-poll-vote-controller.php includes/class-crowdsignal-forms.php tests/unit-tests/includes/rest-api/controllers/test-class.legacy-poll-vote-controller.php
git commit -m "feat: add REST relay controller for classic poll votes"
```

---

## Task 5: Loader rewriter + embed handler

**Files:**
- Create: `includes/legacy-poll-proxy/class-loader-rewriter.php`
- Create: `includes/legacy-poll-proxy/class-legacy-poll-embed-handler.php`
- Modify: `includes/class-crowdsignal-forms.php` (register the embed handler behind the flag)
- Test: `tests/unit-tests/includes/legacy-poll-proxy/test-class.loader-rewriter.php`

- [ ] **Step 1: Write the failing test for the pure rewrite**

```php
<?php
use Crowdsignal_Forms\Legacy_Poll_Proxy\Loader_Rewriter;

class Loader_Rewriter_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function test_repoints_vote_target() {
		$script = 'var PDV_server17014142="https://polls.polldaddy.com";';
		$out    = ( new Loader_Rewriter() )->rewrite(
			$script,
			17014142,
			'https://host.example/wp-json/crowdsignal-forms/v1/legacy-poll-vote'
		);
		$this->assertStringContainsString(
			'PDV_server17014142="https://host.example/wp-json/crowdsignal-forms/v1/legacy-poll-vote"',
			$out
		);
		$this->assertStringNotContainsString( 'polls.polldaddy.com', $out );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Loader_Rewriter_Test"`
Expected: FAIL — class not found.

- [ ] **Step 3: Write minimal implementation** (token confirmed in spec Open Question 1)

```php
<?php
namespace Crowdsignal_Forms\Legacy_Poll_Proxy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pure string transform of the embed script: repoint the vote target to the host
 * relay so the browser votes first-party.
 */
class Loader_Rewriter {

	public function rewrite( $script, $poll_id, $relay_base ) {
		$id = absint( $poll_id );
		return preg_replace(
			'#PDV_server' . $id . '="https://polls\.polldaddy\.com"#',
			'PDV_server' . $id . '="' . esc_js( $relay_base ) . '"',
			$script
		);
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Loader_Rewriter_Test"`
Expected: PASS.

- [ ] **Step 5: Write the embed handler** (fetch → rewrite → inline → `voter_id` bridge) with a test that a matched URL yields rewritten markup (mock the gateway's `fetch_embed_script`)

```php
<?php
namespace Crowdsignal_Forms\Legacy_Poll_Proxy;

use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Poll_Embed_Handler {

	const URL_REGEX = '#https?://(?:www\.)?(?:poll\.fm|polldaddy\.com/p)/(\d+)#i';

	private $gateway;
	private $rewriter;

	public function __construct( $gateway = null, $rewriter = null ) {
		if ( $gateway ) {
			$this->gateway = $gateway;
		} else {
			$auth          = Crowdsignal_Forms::instance()->get_api_authenticator();
			$this->gateway = new Legacy_Poll_Gateway( $auth->get_api_key(), $auth->get_user_code() );
		}
		$this->rewriter = $rewriter ? $rewriter : new Loader_Rewriter();
	}

	public function register() {
		wp_embed_register_handler( 'crowdsignal-classic-poll', self::URL_REGEX, array( $this, 'handle' ) );
	}

	/**
	 * @param array $matches $matches[1] is the poll id.
	 * @return string Inlined, rewritten markup, or '' to fall back to oEmbed.
	 */
	public function handle( $matches ) {
		$poll_id = absint( $matches[1] );
		$script  = $this->gateway->fetch_embed_script( $poll_id );
		if ( is_wp_error( $script ) || '' === trim( (string) $script ) ) {
			return '';
		}

		$relay_base = esc_url_raw( rest_url( 'crowdsignal-forms/v1/legacy-poll-vote' ) );
		$rewritten  = $this->rewriter->rewrite( $script, $poll_id, $relay_base );
		$voter_id   = ( new Voter_Identity() )->resolve( $this->anon_token() );

		$bridge = sprintf( 'window.PDV_voter_id%d=%s;', $poll_id, wp_json_encode( $voter_id ) );

		return '<div class="cs-legacy-poll" data-poll-id="' . esc_attr( $poll_id ) . '">'
			. '<script>' . $bridge . '</script>'
			. '<script>' . $rewritten . '</script>'
			. '</div>';
	}

	private function anon_token() {
		$cookie = 'cs_voter';
		if ( empty( $_COOKIE[ $cookie ] ) ) {
			return wp_generate_uuid4();
		}
		return sanitize_text_field( wp_unslash( $_COOKIE[ $cookie ] ) );
	}
}
```

Wire it in `includes/class-crowdsignal-forms.php` behind the flag (Task 6):
```php
if ( apply_filters( 'crowdsignal_forms_enable_legacy_vote_proxy', false ) ) {
	add_action( 'init', function () {
		( new \Crowdsignal_Forms\Legacy_Poll_Proxy\Legacy_Poll_Embed_Handler() )->register();
	} );
}
```

> The rewritten embed must append `&voter_id=` (from `window.PDV_voter_id{id}`) to its vote call. Confirm the exact submit token in spec Open Question 1 and, if needed, add a replacement in `Loader_Rewriter` that injects it; assert it in `Loader_Rewriter_Test` first.

- [ ] **Step 6: Run tests to verify they pass**

Run: `make phpunit ARGS="--filter Loader_Rewriter_Test"` and the new `--filter Legacy_Poll_Embed_Handler_Test`.
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add includes/legacy-poll-proxy/class-loader-rewriter.php includes/legacy-poll-proxy/class-legacy-poll-embed-handler.php includes/class-crowdsignal-forms.php tests/unit-tests/includes/legacy-poll-proxy/
git commit -m "feat: intercept classic poll embeds and render first-party"
```

---

## Task 6: Feature flag + settings toggle

**Files:**
- Modify: `includes/class-crowdsignal-forms.php` (bind option → filter)
- Modify: `includes/admin/views/html-admin-settings.php` (checkbox)
- Test: `tests/unit-tests/includes/admin/test-class.settings-vote-proxy.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
class Settings_Vote_Proxy_Test extends Crowdsignal_Forms_Unit_Test_Case {

	public function test_filter_follows_option() {
		delete_option( 'crowdsignal_forms_legacy_vote_proxy' );
		$this->assertFalse( apply_filters( 'crowdsignal_forms_enable_legacy_vote_proxy', false ) );
		update_option( 'crowdsignal_forms_legacy_vote_proxy', '1' );
		$this->assertTrue( apply_filters( 'crowdsignal_forms_enable_legacy_vote_proxy', false ) );
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `make phpunit ARGS="--filter Settings_Vote_Proxy_Test"`
Expected: FAIL — no filter binds the option yet.

- [ ] **Step 3: Write minimal implementation** (in `setup_hooks()`)

```php
add_filter(
	'crowdsignal_forms_enable_legacy_vote_proxy',
	function ( $enabled ) {
		return $enabled || '1' === get_option( 'crowdsignal_forms_legacy_vote_proxy', '0' );
	}
);
```
Add the checkbox to the settings view saving option `crowdsignal_forms_legacy_vote_proxy`.

- [ ] **Step 4: Run test to verify it passes**

Run: `make phpunit ARGS="--filter Settings_Vote_Proxy_Test"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add includes/class-crowdsignal-forms.php includes/admin/
git commit -m "feat: gate classic poll vote proxy behind a settings toggle"
```

---

## Task 7: Lint, full suite, manual smoke

- [ ] **Step 1: Lint** — `make phpcs` (fix with `make phpcbf`); no new violations in the new files.
- [ ] **Step 2: Full suite** — `make phpunit` green (pre-existing unrelated skips acceptable).
- [ ] **Step 3: Manual smoke** — with the toggle on, load a post embedding `poll.fm/{id}`; confirm in DevTools that (a) the browser makes no cross-site request to a `polldaddy.com`/`poll.fm` domain, (b) the vote POST goes to `/wp-json/crowdsignal-forms/v1/legacy-poll-vote/vote-js.php`, (c) result bars render, (d) a second vote in the same browser is reported already-voted.
- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "chore: lint and smoke fixes for classic poll vote proxy"
```

---

## Self-review notes

- **Spec coverage:** intercept (Task 5) · render fetch-and-rewrite (Tasks 1,5) · authenticated relay forwarding the visitor IP (Tasks 1,4) · first-party `voter_id` + dedup (Tasks 2,3) · feature flag (Task 6) · no API-key leak to other hosts (Task 1, plain `wp_remote_*`).
- **Out of scope:** the Crowdsignal service behaviour (private, separate); raw non-plugin embeds.
