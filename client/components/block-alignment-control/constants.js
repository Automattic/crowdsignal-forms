/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const GRID = {
	'2x2': {
		rows: [
			{
				label: __( `Top`, 'crowdsignal-forms' ),
				value: 'top',
			},
			{
				label: __( `Bottom`, 'crowdsignal-forms' ),
				value: 'bottom',
			},
		],
		columns: [
			{
				label: __( `Left`, 'crowdsignal-forms' ),
				value: 'left',
			},
			{
				label: __( `Right`, 'crowdsignal-forms' ),
				value: 'right',
			},
		],
	},
	'2x3': {
		rows: [
			{
				label: __( `Top`, 'crowdsignal-forms' ),
				value: 'top',
			},
			{
				label: __( `Center`, 'crowdsignal-forms' ),
				value: 'center',
			},
			{
				label: __( `Bottom`, 'crowdsignal-forms' ),
				value: 'bottom',
			},
		],
		columns: [
			{
				label: __( `Left`, 'crowdsignal-forms' ),
				value: 'left',
			},
			{
				label: __( `Right`, 'crowdsignal-forms' ),
				value: 'right',
			},
		],
	},
};
