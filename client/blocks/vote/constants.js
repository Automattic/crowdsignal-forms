/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const PollStatus = Object.freeze( {
	OPEN: 'open',
	CLOSED: 'closed',
	CLOSED_AFTER: 'closed-after',
} );

export const ConnectedAccountState = Object.freeze( {
	CONNECTED: 'connected',
	NOT_CONNECTED: 'not-connected',
	NOT_VERIFIED: 'not-verified',
} );

export const DEFAULT_SIZE_CONTROLS = [
	{
		title: __( 'Small' ),
		size: 'small',
	},
	{
		title: __( 'Medium' ),
		size: 'medium',
	},
	{
		title: __( 'Large' ),
		size: 'large',
	},
];

export const POPOVER_PROPS = {
	position: 'bottom right',
	isAlternate: true,
};
