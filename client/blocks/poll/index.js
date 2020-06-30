/**
 * Internal dependencies
 */
import PollIcon from 'components/icon/poll';
import { __ } from 'lib/i18n';
import EditPollBlock from './edit';
import attributes from './attributes';
import { startSubscriptions } from './subscriptions';

startSubscriptions();

export default {
	title: __( 'Poll' ),
	description: __(
		'Ask a question and offer answer options | powered by Crowdsignal'
	),
	category: 'widgets',
	icon: <PollIcon />,
	edit: EditPollBlock,
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
	},
	getEditWrapperProps: ( { align } ) => ( {
		'data-align': align,
	} ),
};
