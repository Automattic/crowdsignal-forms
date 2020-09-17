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
	keywords: [ 'crowdsignal', __( 'vote' ), __( 'thumbs' ), __( 'like' ) ],
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
