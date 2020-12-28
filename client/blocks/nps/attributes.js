/**
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-nps-block.php.
 */

export default {
	feedbackQuestion: {
		type: 'string',
		default: '',
	},
	hideBranding: {
		type: 'boolean',
		default: false,
	},
	ratingQuestion: {
		type: 'string',
		default: '',
	},
	surveyId: {
		type: 'string',
		default: null,
	},
	title: {
		type: 'string',
		default: '',
	},
	viewThreshold: {
		type: 'string',
		default: 3,
	},
};
