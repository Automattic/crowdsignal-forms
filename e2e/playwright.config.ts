import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.WP_BASE_URL || 'http://localhost:8000';

export default defineConfig( {
	testDir: './tests',

	/* Fail the build on CI if test.only was left in source */
	forbidOnly: !! process.env.CI,

	/* No retries by default; enable on CI if needed */
	retries: process.env.CI ? 1 : 0,

	/* WordPress doesn't handle parallel requests well */
	workers: 1,

	/* Generous timeout for a local Docker WordPress instance */
	timeout: 60_000,
	expect: { timeout: 10_000 },

	reporter: process.env.CI ? 'github' : 'list',

	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'auth-setup',
			testMatch: /auth\.setup\.ts/,
		},
		{
			name: 'chromium',
			use: {
				...devices[ 'Desktop Chrome' ],
				storageState: 'e2e/.auth/storage-state.json',
			},
			dependencies: [ 'auth-setup' ],
		},
	],
} );
