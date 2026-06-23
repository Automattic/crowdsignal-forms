import { test, expect } from '@playwright/test';

test.describe( 'Poll block in the editor', () => {
	test( 'can be found in the block inserter', async ( { page } ) => {
		// Create a new post to open the block editor.
		await page.goto( '/wp-admin/post-new.php' );

		// Dismiss the welcome modal that appears on first editor load.
		// It uses a screen overlay that blocks all pointer events.
		const modalCloseButton = page.locator(
			'.components-modal__header button[aria-label="Close"]'
		);
		if (
			await modalCloseButton
				.isVisible( { timeout: 5_000 } )
				.catch( () => false )
		) {
			await modalCloseButton.click();
		}

		// Open the block inserter via the top-bar toggle button.
		// Label changed from "Toggle block inserter" to "Block Inserter" in WP 6.5.
		const inserterToggle = page.locator(
			'button[aria-label="Toggle block inserter"], button[aria-label="Block Inserter"]'
		).first();
		await inserterToggle.click( { timeout: 10_000 } );

		// Search for the poll block.
		const searchBox = page.locator(
			'role=searchbox[name=/search/i]'
		);
		await expect( searchBox ).toBeVisible( { timeout: 10_000 } );
		await searchBox.fill( 'Crowdsignal' );

		// Verify that at least one Crowdsignal block appears in the results.
		const blockOption = page.locator(
			'.block-editor-block-types-list__item'
		).filter( { hasText: /poll/i } );

		await expect( blockOption.first() ).toBeVisible( {
			timeout: 10_000,
		} );
	} );
} );
