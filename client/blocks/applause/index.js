/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import EditApplauseBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Applause', 'crowdsignal-forms' ),
	description: __(
		'Let your audience cheer with a big round of applause — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [
		'crowdsignal',
		__( 'applause', 'crowdsignal-forms' ),
		__( 'cheer', 'crowdsignal-forms' ),
		__( 'cheering', 'crowdsignal-forms' ),
		__( 'clap', 'crowdsignal-forms' ),
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'kudos', 'crowdsignal-forms' ),
		__( 'like', 'crowdsignal-forms' ),
		__( 'opinion', 'crowdsignal-forms' ),
		__( 'praise', 'crowdsignal-forms' ),
		__( 'rating', 'crowdsignal-forms' ),
		__( 'upvote', 'crowdsignal-forms' ),
		__( 'upvoting', 'crowdsignal-forms' ),
		__( 'votes', 'crowdsignal-forms' ),
		__( 'voting', 'crowdsignal-forms' ),
	],
	icon: <ApplauseIcon />,
	edit: EditApplauseBlock,
	attributes,
	usesContext: [ 'postId', 'queryId' ],
	example: {
		attributes: {
			size: 'large',
		},
	},
};
