/**
 * Internal dependencies
 */
import VoteIcon from 'components/icon/vote';
import { __ } from 'lib/i18n';
// import './store';
import EditVoteItemBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote Item' ),
	description: __(
		'Allow your audience to rate your work or express their opinion — powered by Crowdsignal.'
	),
	category: 'crowdsignal-forms',
	parent: [ 'crowdsignal-forms/vote' ],
	icon: <VoteIcon />,
	edit: EditVoteItemBlock,
	attributes,
};
