/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export default {
	url: {
		type: 'string',
	},
	caption: {
		type: 'string',
		source: 'html',
		selector: 'figcaption',
	},
	type: {
		type: 'string',
		default: 'html',
	},
	providerNameSlug: {
		type: 'string',
		default: 'crowdsignal',
	},
	allowResponsive: {
		type: 'boolean',
		default: true,
	},
	responsive: {
		type: 'boolean',
		default: false,
	},
	previewable: {
		type: 'boolean',
		default: true,
	},
	createLink: {
		type: 'string',
		default: 'https://app.crowdsignal.com/?ref=surveyembedblock',
	},
	createText: {
		type: 'string',
		default: __( 'Create a new Survey', 'crowdsignal-forms' ),
	},
	typeText: {
		type: 'string',
		default: __( 'survey', 'crowdsignal-forms' ),
	},
	typeTextPlural: {
		type: 'string',
		default: __( 'surveys', 'crowdsignal-forms' ),
	},
	dashboardLink: {
		type: 'string',
		default: 'https://app.crowdsignal.com/?ref=surveyembedblock',
	},
};
