/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PollIcon from 'components/icon/poll';
import attributes from './attributes';
import EditFeedbackBlock from './edit';

export default {
	title: __( 'Feedback', 'crowdsignal-forms' ),
	description: __( 'Feedback block', 'crowdsignal-forms' ),
	category: 'crowdsignal-forms',
	keywords: [ 'crowdsignal', __( 'feedback', 'crowdsignal-forms' ) ],
	icon: <PollIcon />,
	edit: EditFeedbackBlock,
	attributes,
};
