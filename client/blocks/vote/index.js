/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import VoteIcon from 'components/icon/vote';
import { __ } from 'lib/i18n';
// import './store';
import EditVoteBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote' ),
	description: __(
		'Allow your audience to rate your work or express their opinion — powered by Crowdsignal.'
	),
	category: 'crowdsignal-forms',
	keywords: [
		__( 'ballot' ),
		__( 'button' ),
		__( 'count' ),
		'crowdsignal',
		__( 'deciding' ),
		__( 'decision' ),
		__( 'elect' ),
		__( 'election' ),
		__( 'feedback' ),
		__( 'form' ),
		__( 'like' ),
		__( 'nero' ),
		__( 'opinion' ),
		__( 'poll' ),
		__( 'polling' ),
		__( 'rate' ),
		__( 'rating' ),
		__( 'research' ),
		__( 'survey' ),
		__( 'thumb down' ),
		__( 'thumb up' ),
		__( 'thumbs' ),
		__( 'vote' ),
		__( 'voting' ),
	],
	icon: <VoteIcon />,
	edit: EditVoteBlock,
	save: () => <InnerBlocks.Content />,
	attributes,
	example: {
		attributes: {
			className: 'crowdsignal-forms-vote__example',
			size: 'large',
		},
	},
};
