/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FeedbackIcon from 'components/icon/feedback';
import attributes from './attributes';
import EditFeedbackBlock from './edit';

export default {
	title: __( 'Feedback Button', 'crowdsignal-forms' ),
	description: __(
		'Allow your audience to share some feedback with you',
		'crowdsignal-forms'
	),
	category: 'crowdsignal-forms',
	keywords: [
		'crowdsignal',
		__( 'feedback', 'crowdsignal-forms' ),
		__( 'floating', 'crowdsignal-forms' ),
		__( 'contact', 'crowdsignal-forms' ),
		__( 'call to action', 'crowdsignal-forms' ),
		__( 'cta', 'crowdsignal-forms' ),
		__( 'button', 'crowdsignal-forms' ),
		__( 'subscribe', 'crowdsignal-forms' ),
		__( 'form', 'crowdsignal-forms' ),
		__( 'email', 'crowdsignal-forms' ),
		__( 'message', 'crowdsignal-forms' ),
	],
	icon: <FeedbackIcon />,
	edit: EditFeedbackBlock,
	supports: {
		multiple: false,
		html: false,
		reusable: false,
	},
	attributes,
};
