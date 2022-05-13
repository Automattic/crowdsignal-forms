/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SurveyIcon from '../../components/icon/poll';
import EditEmbedBlock from './edit';
import SaveEmbedBlock from './save';
import attributes from './attributes';

export default {
	title: __( 'Survey', 'crowdsignal-forms' ),
	description: __(
		'Create and embad a survey — powered by Crowdsignal.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [ __( 'survey', 'crowdsignal-forms' ) ],
	icon: <SurveyIcon />,
	edit: EditEmbedBlock,
	save: SaveEmbedBlock,
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
	},
	getEditWrapperProps: ( { align } ) => ( {
		'data-align': align,
	} ),
	// example: {
	// 	attributes: {
	// 		question: __( 'How did you hear about us?', 'crowdsignal-forms' ),
	// 		answers: [
	// 			{
	// 				text: __( 'Search', 'crowdsignal-forms' ),
	// 			},
	// 			{
	// 				text: __( 'Friend', 'crowdsignal-forms' ),
	// 			},
	// 			{
	// 				text: __( 'Email', 'crowdsignal-forms' ),
	// 			},
	// 		],
	// 	},
	// },
};
