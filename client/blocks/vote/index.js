/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import VoteIcon from 'components/icon/vote';
import EditVoteBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote', 'crowdsignal-forms' ),
	description: __(
		'Allow your audience to rate your work or express their opinion — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [
		__( 'ballot', 'crowdsignal-forms' ),
		__( 'button', 'crowdsignal-forms' ),
		__( 'count', 'crowdsignal-forms' ),
		'crowdsignal',
		__( 'deciding', 'crowdsignal-forms' ),
		__( 'decision', 'crowdsignal-forms' ),
		__( 'elect', 'crowdsignal-forms' ),
		__( 'election', 'crowdsignal-forms' ),
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'form', 'crowdsignal-forms' ),
		__( 'like', 'crowdsignal-forms' ),
		__( 'nero', 'crowdsignal-forms' ),
		__( 'opinion', 'crowdsignal-forms' ),
		__( 'poll', 'crowdsignal-forms' ),
		__( 'polling', 'crowdsignal-forms' ),
		__( 'rate', 'crowdsignal-forms' ),
		__( 'rating', 'crowdsignal-forms' ),
		__( 'research', 'crowdsignal-forms' ),
		__( 'survey', 'crowdsignal-forms' ),
		__( 'thumb down', 'crowdsignal-forms' ),
		__( 'thumb up', 'crowdsignal-forms' ),
		__( 'thumbs', 'crowdsignal-forms' ),
		__( 'vote', 'crowdsignal-forms' ),
		__( 'voting', 'crowdsignal-forms' ),
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
