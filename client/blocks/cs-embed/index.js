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
import variations from './variations';

export default {
	title: __( 'Survey', 'crowdsignal-forms' ),
	description: __(
		'Create a multipage survey on crowdsignal.com and embed it.',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [ __( 'survey', 'crowdsignal-forms' ) ],
	icon: <Survey />,
	edit: EditEmbedBlock,
	save: SaveEmbedBlock,
	variations,
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
	},
	getEditWrapperProps: ( { align } ) => ( {
		'data-align': align,
	} ),
};
