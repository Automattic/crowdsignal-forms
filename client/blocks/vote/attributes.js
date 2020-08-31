/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

/*
 * Note: Any changes made to the attributes definition need to be duplicated in
 *       Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Vote_Block::attributes()
 *       inside includes/frontend/blocks/class-crowdsignal-forms-vote-block.php.
 */
export default {
	pollId: {
		type: 'string',
		default: null,
	},
	title: {
		type: 'string',
		default: __( 'Untitled Vote' ),
	},
};
