/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PollIcon from 'components/icon/poll';
import './store';
import EditPollBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Poll', 'crowdsignal-forms' ),
	description: __(
		'Create polls and get your audience’s opinion — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [
		__( 'ask', 'crowdsignal-forms' ),
		'crowdsignal',
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'form', 'crowdsignal-forms' ),
		__( 'opinion', 'crowdsignal-forms' ),
		__( 'poll', 'crowdsignal-forms' ),
		__( 'pop', 'crowdsignal-forms' ),
		__( 'question', 'crowdsignal-forms' ),
		__( 'quiz', 'crowdsignal-forms' ),
		__( 'research', 'crowdsignal-forms' ),
		__( 'survey', 'crowdsignal-forms' ),
		__( 'vote', 'crowdsignal-forms' ),
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
			question: __( 'How did you hear about us?', 'crowdsignal-forms' ),
			answers: [
				{
					text: __( 'Search', 'crowdsignal-forms' ),
				},
				{
					text: __( 'Friend', 'crowdsignal-forms' ),
				},
				{
					text: __( 'Email', 'crowdsignal-forms' ),
				},
			],
		},
	},
	styles: [
		{
			name: 'buttons',
			label: __( 'Buttons', 'crowdsignal-forms' ),
			isDefault: true,
		},
	],
};
