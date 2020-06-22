/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const ClosedBanner = ( { hasVoted, isPollClosed, isPollHidden } ) => (
	<div className="wp-block-crowdsignal-forms-poll__closed-banner">
		{ isPollHidden && __( 'This Poll is Hidden' ) }
		{ isPollClosed && ! isPollHidden && __( 'This Poll is Closed' ) }
		{ hasVoted && __( 'Thanks For Voting!' ) }
	</div>
);

export default ClosedBanner;
