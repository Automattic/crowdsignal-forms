/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const ClosedBanner = ( {
	hasVoted,
	isPollClosed,
	isPollHidden,
	showSubmitMessage,
} ) => {
	const classes = classNames(
		{
			'is-transparent': showSubmitMessage,
		},
		'crowdsignal-forms-poll__closed-banner'
	);

	return (
		<div className={ classes }>
			{ isPollHidden && __( 'This Poll is Hidden' ) }
			{ isPollClosed && ! isPollHidden && __( 'This Poll is Closed' ) }
			{ hasVoted && __( 'Thanks For Voting!' ) }
		</div>
	);
};

export default ClosedBanner;
