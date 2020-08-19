/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
// import PollIcon from 'components/icon/poll';
import { __ } from 'lib/i18n';
// import './store';
import EditVoteBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Vote' ),
	description: __(
		'<NEED A PROPER DESCRIPTION HERE> — powered by Crowdsignal.'
	),
	category: 'widgets',
	keywords: [ 'crowdsignal', __( 'vote' ), __( 'thumbs' ), __( 'like' ) ],
	// icon: <PollIcon />,
	edit: EditVoteBlock,
	save: () => <InnerBlocks.Content />,
	attributes,
	example: {
		attributes: {},
	},
};
