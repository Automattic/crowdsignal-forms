/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import attributes from './attributes';
import edit from './edit';

export default {
	title: __( 'NPS', 'crowdsignal-forms' ),
	description: __( 'Net Promoter Score', 'crowdsignal-forms' ),
	category: 'crowdsignal-forms',
	attributes,
	edit,
};
