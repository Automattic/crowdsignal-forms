/**
 * Internal dependencies
 */
import PollIcon from 'components/icon/poll';
import { __ } from 'lib/i18n';
import './store';
import EditPollBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Poll' ),
	description: __(
		'Create polls and get your audience’s opinion — powered by Crowdsignal.'
	),
	category: 'widgets',
	keywords: [
		__( 'ask' ),
		'crowdsignal',
		__( 'feedback' ),
		__( 'poll' ),
		__( 'pop' ),
		__( 'question' ),
		__( 'quiz' ),
		__( 'research' ),
		__( 'survey' ),
		__( 'vote' ),
	],
	icon: <PollIcon />,
	edit: EditPollBlock,
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
	},
	getEditWrapperProps: ( { align } ) => ( {
		'data-align': align,
	} ),
	example: {
		attributes: {
			question: __( 'How did you hear about us?' ),
			answers: [
				{
					text: __( 'Search' ),
				},
				{
					text: __( 'Friend' ),
				},
				{
					text: __( 'Email' ),
				},
			],
		},
	},
};
