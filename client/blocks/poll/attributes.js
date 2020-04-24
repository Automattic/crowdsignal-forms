/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export default {
	pollId: {
		type: 'string',
		default: null,
	},
	isMultipleChoice: {
		type: 'boolean',
		default: false,
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
	submitButtonColor: {
		type: 'string',
		default: 'pink',
	},
};
