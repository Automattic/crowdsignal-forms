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
			{ isPollHidden && (
				<span>{ __( 'This Poll is Hidden', 'crowdsignal-forms' ) }</span>
			) }
			{ isPollClosed &&
				!isPollHidden && (
				<span>{ __( 'This Poll is Closed', 'crowdsignal-forms' ) }</span>
			) }
			{ hasVoted && (
				<span>{ __( 'Thanks For Voting!', 'crowdsignal-forms' ) }</span>
			) }
		</div>
	);
};

export default ClosedBanner;
