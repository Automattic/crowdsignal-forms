/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const PollStatus = Object.freeze( {
	OPEN: 'open',
	CLOSED: 'closed',
	CLOSED_AFTER: 'closed-after',
} );

export const DEFAULT_SIZE_CONTROLS = [
	{
		title: __( 'Small', 'crowdsignal-forms' ),
		size: 'small',
	},
	{
		title: __( 'Medium', 'crowdsignal-forms' ),
		size: 'medium',
	},
	{
		title: __( 'Large', 'crowdsignal-forms' ),
		size: 'large',
	},
];

export const POPOVER_PROPS = {
	position: 'bottom right',
	isAlternate: true,
	className: 'crowdsignal-forms-vote__size-dropdown',
};
