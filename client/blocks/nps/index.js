/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NpsIcon from 'components/icon/nps';
import attributes from './attributes';
import edit from './edit';

export default {
	title: __( 'Measure NPS', 'crowdsignal-forms' ),
	description: __(
		'Calculate your Net Promoter Score! Collect feedback and track customer satisfaction over time. — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	attributes,
	supports: {
		multiple: false,
	},
	icon: <NpsIcon />,
	edit,
	keywords: [
		__( 'ask', 'crowdsignal-forms' ),
		'crowdsignal',
		__( 'CSAT', 'crowdsignal-forms' ),
		__( 'customer experience', 'crowdsignal-forms' ),
		__( 'customer satisfaction', 'crowdsignal-forms' ),
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'form', 'crowdsignal-forms' ),
		__( 'loyalty', 'crowdsignal-forms' ),
		__( 'net promoter score', 'crowdsignal-forms' ),
		__( 'nps', 'crowdsignal-forms' ),
		__( 'opinion', 'crowdsignal-forms' ),
		__( 'poll', 'crowdsignal-forms' ),
		__( 'promoter', 'crowdsignal-forms' ),
		__( 'research', 'crowdsignal-forms' ),
		__( 'rating', 'crowdsignal-forms' ),
		__( 'review', 'crowdsignal-forms' ),
		__( 'score', 'crowdsignal-forms' ),
		__( 'survey', 'crowdsignal-forms' ),
	],
	example: {
		attributes: {
			isExample: true,
			ratingQuestion: __(
				'How satisfied are you with the content of the site?',
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
