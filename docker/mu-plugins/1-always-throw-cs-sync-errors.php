<?php

/**
 * Always throw on sync errors when developing locally.
 */
add_action( 'crowdsignal_forms_poll_sync_exception', function ( $sync_exception, $poll_syncer ) {
	throw $sync_exception;
}, 10, 2 );
