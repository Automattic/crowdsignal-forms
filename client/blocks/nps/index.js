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
	description: __(
		'Net Promoter Score popup — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	attributes,
	supports: {
		multiple: false,
	},
	edit,
	keywords: [
		__( 'ask', 'crowdsignal-forms' ),
		'crowdsignal',
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'form', 'crowdsignal-forms' ),
		__( 'opinion', 'crowdsignal-forms' ),
		__( 'nps', 'crowdsignal-forms' ),
		__( 'score', 'crowdsignal-forms' ),
		__( 'promoter', 'crowdsignal-forms' ),
		__( 'research', 'crowdsignal-forms' ),
		__( 'survey', 'crowdsignal-forms' ),
	],
	example: {
		attributes: {
			ratingQuestion: __(
				'How satisfied are your with the content of the site?',
				'crowdsignal-forms'
			),
			feedbackQuestion: __(
				'Any advise on how we could improve your experience?',
				'crowdsignal-forms'
			),
			lowRatingLabel: __( 'Not satisfied', 'crowdsignal-forms' ),
			highRatingLabel: __( 'Very satisfied', 'crowdsignal-forms' ),
		},
	},
};
