/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';

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

	let message = '';
	if ( isPollHidden ) {
		message = __( 'This Poll is Hidden', 'crowdsignal-forms' );
	} else if ( isPollClosed ) {
		message = __( 'This Poll is Closed', 'crowdsignal-forms' );
	} else if ( hasVoted ) {
		message = __( 'Thanks For Voting!', 'crowdsignal-forms' );
	}

	return (
		<div className={ classes }>
			{ message }
		</div>
	);
};

export default ClosedBanner;
