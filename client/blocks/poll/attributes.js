/**
 * Internal dependencies
 */
import {
	FontFamilyType,
	ConfirmMessageType,
	PollStatus,
	ClosedPollState,
} from './constants';
import { __ } from 'lib/i18n';

export default {
	pollId: {
		type: 'string',
		default: null,
	},
	isMultipleChoice: {
		type: 'boolean',
		default: false,
	},
	title: {
		type: 'string',
		default: __( 'Untitled Poll' ),
	},
	question: {
		type: 'string',
		default: '',
	},
	note: {
		type: 'string',
		default: '',
	},
	answers: {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				answerId: {
					type: 'string',
					default: null,
				},
				text: {
					type: 'string',
					default: '',
				},
			},
		},
		default: [ {}, {}, {} ],
	},
	submitButtonLabel: {
		type: 'string',
		default: __( 'Submit' ),
	},
	submitButtonTextColor: {
		type: 'string',
	},
	submitButtonBackgroundColor: {
		type: 'string',
	},
	confirmMessageType: {
		type: 'string',
		default: ConfirmMessageType.RESULTS,
	},
	customConfirmMessage: {
		type: 'string',
	},
	redirectAddress: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	backgroundColor: {
		type: 'string',
	},
	fontFamily: {
		type: 'string',
		default: FontFamilyType.THEME_DEFAULT,
	},
	hasCaptchaProtection: {
		type: 'boolean',
		default: false,
	},
	hasOneResponsePerComputer: {
		type: 'boolean',
		default: false,
	},
	hasRandomOrderOfAnswers: {
		type: 'boolean',
		default: false,
	},
	blockAlignment: {
		type: 'string',
		default: 'center',
	},
	pollStatus: {
		type: 'string',
		default: PollStatus.OPEN,
	},
	closedPollState: {
		type: 'string',
		default: ClosedPollState.SHOW_RESULTS,
	},
	closedAfterDateTime: {
		type: 'string',
		default: null,
	},
};
