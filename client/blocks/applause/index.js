/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import { __ } from 'lib/i18n';
import EditApplauseBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Applause' ),
	description: __( 'TODO DESCRIPTION HERE — powered by Crowdsignal.' ),
	category: 'crowdsignal-forms',
	keywords: [ 'crowdsignal', __( 'applause' ), __( 'clap' ) ],
	icon: <ApplauseIcon />,
	edit: EditApplauseBlock,
	attributes,
	example: {},
};
