import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join( __dirname, '..', '.auth', 'storage-state.json' );

setup( 'authenticate as WordPress admin', async ( { page, baseURL } ) => {
	await page.goto( `${ baseURL }/wp-login.php` );

	await page.locator( '#user_login' ).fill( 'wordpress' );
	await page.locator( '#user_pass' ).fill( 'wordpress' );
	await page.locator( '#wp-submit' ).click();

	// Wait for the dashboard to confirm login succeeded.
	await expect( page.locator( '#wpadminbar' ) ).toBeVisible( {
		timeout: 15_000,
	} );

	await page.context().storageState( { path: authFile } );
} );
