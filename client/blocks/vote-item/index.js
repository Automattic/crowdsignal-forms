/**
 * Internal dependencies
 */
// import PollIcon from 'components/icon/poll';
import { __ } from 'lib/i18n';
// import './store';
import EditVoteItemBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote Item' ),
	description: __( 'Vote Item — powered by Crowdsignal.' ),
	category: __( 'widgets' ),
	parent: [ 'crowdsignal-forms/vote' ],
	// icon: <PollIcon />,
	edit: EditVoteItemBlock,
	attributes,
};
