import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join( __dirname, '..', '.auth', 'storage-state.json' );

setup( 'authenticate as WordPress admin', async ( { page } ) => {
	await page.goto( '/wp-login.php' );

	// If we hit the WordPress install/language screen instead of the login
	// form, WordPress hasn't been installed yet.
	const isInstallPage = await page
		.locator( 'body.wp-core-ui.install' )
		.or( page.locator( 'body.language-chooser' ) )
		.isVisible( { timeout: 5_000 } )
		.catch( () => false );

	if ( isInstallPage ) {
		throw new Error(
			'WordPress is not installed. Run "make docker_install" first, then re-run the tests.'
		);
	}

	await page.locator( '#user_login' ).fill( 'wordpress' );
	await page.locator( '#user_pass' ).fill( 'wordpress' );
	await page.locator( '#wp-submit' ).click();

	// Wait for the dashboard to confirm login succeeded.
	await expect( page.locator( '#wpadminbar' ) ).toBeVisible( {
		timeout: 15_000,
	} );

	await page.context().storageState( { path: authFile } );
} );
