/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import VoteIcon from 'components/icon/vote';
import EditVoteItemBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote Item', 'crowdsignal-forms' ),
	description: __(
		'Allow your audience to rate your work or express their opinion — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	parent: [ 'crowdsignal-forms/vote' ],
	icon: <VoteIcon />,
	edit: EditVoteItemBlock,
	attributes,
};
