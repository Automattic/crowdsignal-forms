/**
 * Internal dependencies
 */
import PollIcon from 'components/icon/poll';
import { __ } from 'lib/i18n';
import EditPollBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Poll' ),
	description: __(
		'Create polls and get your audience’s opinion — powered by Crowdsignal.'
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
