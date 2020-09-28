/**
 * Internal dependencies
 */
//import VoteIcon from 'components/icon/vote';
import { __ } from 'lib/i18n';
// import './store';
import EditApplauseBlock from './edit';
import attributes from './attributes';

export default {
	title: __( 'Applause' ),
	description: __( 'TODO DESCRIPTION HERE — powered by Crowdsignal.' ),
	category: 'crowdsignal-forms',
	keywords: [ 'crowdsignal', __( 'applause' ), __( 'clap' ) ],
	//icon: <VoteIcon />,
	edit: EditApplauseBlock,
	attributes,
	example: {},
};
