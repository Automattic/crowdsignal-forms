/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Feedback_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-feedback-block.php.
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
	emailPlaceholder: {
		type: 'string',
		default: __( 'Your email (optional)', 'crowdsignal-forms' ),
	},
	feedbackPlaceholder: {
		type: 'string',
		default: __(
			'Please let us know how we can do better…',
			'crowdsignal-forms'
		),
	},
	header: {
		type: 'string',
		default: __( 'Hello there!', 'crowdsignal-forms' ),
	},
	hideBranding: {
		type: 'boolean',
		default: false,
	},
	submitButtonLabel: {
		type: 'string',
		default: __( 'Submit', 'crowdsignal-forms' ),
	},
	submitText: {
		type: 'string',
		default: __( 'Thanks for letting us know!', 'crowdsignal-forms' ),
	},
	surveyId: {
		type: 'number',
		default: null,
	},
	textColor: {
		type: 'string',
	},
	triggerBackgroundImageId: {
		type: 'number',
		default: 0,
	},
	triggerBackgroundImage: {
		type: 'string',
		default: '',
	},
	triggerShadow: {
		type: 'boolean',
		default: true,
	},
	title: {
		type: 'string',
		default: '',
	},
	x: {
		type: 'string',
		default: 'right',
	},
	y: {
		type: 'string',
		default: 'bottom',
	},
};
