/*
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Applause_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-applause-block.php.
 */

export default {
	pollId: {
		type: 'string',
		default: null,
	},
	hideBranding: {
		type: 'boolean',
		default: false,
	},
	title: {
		type: 'string',
		default: null,
	},
	answerId: {
		type: 'string',
		default: null,
	},
	size: {
		type: 'string',
		default: 'medium',
	},
};
