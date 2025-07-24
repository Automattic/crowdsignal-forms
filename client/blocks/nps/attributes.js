/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { NpsStatus } from './constants';
/**
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-nps-block.php.
 */

export default {
	backgroundColor: {
		type: 'string',
	},
	buttonColor: {
		type: 'string',
	},
	buttonTextColor: {
		type: 'string',
	},
	feedbackPlaceholder: {
		type: 'string',
		default: __(
			'Please help us understand your rating',
			'crowdsignal-forms'
		),
	},
	feedbackQuestion: {
		type: 'string',
		default: __(
			'Thanks so much for your response! How could we do better?',
			'crowdsignal-forms'
		),
	},
	hideBranding: {
		type: 'boolean',
		default: false,
	},
	highRatingLabel: {
		type: 'string',
		default: __( 'Extremely likely', 'crowdsignal-forms' ),
	},
	lowRatingLabel: {
		type: 'string',
		default: __( 'Not likely at all', 'crowdsignal-forms' ),
	},
	ratingQuestion: {
		type: 'string',
		default: __(
			'How likely is it that you would recommend this project to a friend or colleague?',
			'crowdsignal-forms'
		),
	},
	submitButtonLabel: {
		type: 'string',
		default: __( 'Submit', 'crowdsignal-forms' ),
	},
	surveyId: {
		type: 'number',
		default: null,
	},
	clientId: {
		type: 'string',
		default: null,
	},
	textColor: {
		type: 'string',
	},
	title: {
		type: 'string',
		default: '',
	},
	viewThreshold: {
		type: 'string',
		default: 2,
	},
	status: {
		type: 'string',
		default: NpsStatus.OPEN,
	},
	closedAfterDateTime: {
		type: 'string',
		default: null,
	},
	isExample: {
		type: 'boolean',
		default: false,
	},
};
