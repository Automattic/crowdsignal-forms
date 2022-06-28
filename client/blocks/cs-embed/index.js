/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Survey from '../../components/icon/survey';
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
	icon: <Survey />,
	edit: EditEmbedBlock,
	save: SaveEmbedBlock,
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
	},
	getEditWrapperProps: ( { align } ) => ( {
		'data-align': align,
	} ),
};
