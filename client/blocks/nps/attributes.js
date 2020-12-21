/**
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-nps-block.php.
 */

export default {
	hideBranding: {
		type: 'boolean',
		default: false,
	},
	surveyId: {
		type: 'string',
		default: null,
	},
	viewThreshold: {
		type: 'string',
		default: 3,
	},
};
