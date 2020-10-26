/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import { __ } from 'lib/i18n';
import EditApplauseBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Applause' ),
	description: __(
		'Let your audience cheer with a big round of applause — powered by Crowdsignal.'
	),
	category: 'crowdsignal-forms',
	keywords: [
		'crowdsignal',
		__( 'applause' ),
		__( 'cheer' ),
		__( 'cheering' ),
		__( 'clap' ),
		__( 'feedback' ),
		__( 'kudos' ),
		__( 'like' ),
		__( 'opinion' ),
		__( 'praise' ),
		__( 'rating' ),
		__( 'upvote' ),
		__( 'upvoting' ),
		__( 'votes' ),
		__( 'voting' ),
	],
	icon: <ApplauseIcon />,
	edit: EditApplauseBlock,
	attributes,
	example: {
		attributes: {
			size: 'large',
		},
	},
};
