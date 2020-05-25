/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const ClosedBanner = ( { isPollHidden } ) => (
	<div className="wp-block-crowdsignal-forms-poll__closed-banner">
		{ isPollHidden && __( 'This Poll is Hidden' ) }
		{ ! isPollHidden && __( 'This Poll is Closed' ) }
	</div>
);

export default ClosedBanner;
