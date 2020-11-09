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

	return (
		<div className={ classes }>
			{ isPollHidden && __( 'This Poll is Hidden', 'crowdsignal-forms' ) }
			{ isPollClosed &&
				! isPollHidden &&
				__( 'This Poll is Closed', 'crowdsignal-forms' ) }
			{ hasVoted && __( 'Thanks For Voting!', 'crowdsignal-forms' ) }
		</div>
	);
};

export default ClosedBanner;
