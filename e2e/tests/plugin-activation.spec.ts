import { test, expect } from '@playwright/test';

test.describe( 'Crowdsignal Forms plugin', () => {
	test( 'is listed as active on the Plugins page', async ( { page } ) => {
		await page.goto( '/wp-admin/plugins.php' );

		// WordPress marks active plugins with the "active" class on the row.
		const pluginRow = page.locator(
			'tr[data-slug="crowdsignal-forms"]'
		);
		await expect( pluginRow ).toBeVisible();
		await expect( pluginRow ).toHaveClass( /active/ );
	} );

	test( 'settings page loads without errors', async ( { page } ) => {
		await page.goto(
			'/wp-admin/admin.php?page=crowdsignal-forms-setup'
		);

		// The page should render without a WordPress fatal/error notice.
		await expect(
			page.locator( '#wpbody-content' )
		).toBeVisible();

		// Confirm we're on the right page by checking for the settings form
		// or heading.  The exact text depends on API-key state, so just
		// verify no "error" PHP notice is present.
		await expect(
			page.locator( '.php-error, .error-message' )
		).toHaveCount( 0 );
	} );
} );
