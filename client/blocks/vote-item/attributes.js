/*
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Vote_Item_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-vote-item-block.php.
 */
export default {
	answerId: {
		type: 'string',
		default: null,
	},
	type: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	backgroundColor: {
		type: 'string',
	},
	borderColor: {
		type: 'string',
	},
};
