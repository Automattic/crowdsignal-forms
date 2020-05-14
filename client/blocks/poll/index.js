/**
 * Internal dependencies
 */
import EditPollBlock from './edit';
import attributes from './attributes';
import { __ } from 'lib/i18n';

export default {
	title: __( 'Poll' ),
	description: __(
		'Ask a question and offer answer options | powered by Crowdsignal'
	),
	category: 'widgets',
	attributes,
	edit: EditPollBlock,
};
