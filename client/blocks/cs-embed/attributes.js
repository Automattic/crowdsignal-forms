/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';

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
		default:
			'https://crowdsignal.com/support/add-a-multipage-survey-to-any-wordpress-page-or-post/?ref=surveyembedblock',
	},
	createText: {
		type: 'string',
		default: __( 'Create a new Survey', 'crowdsignal-forms' ),
	},
	typeText: {
		type: 'string',
		default: __( 'survey', 'crowdsignal-forms' ),
	},
	editText: {
		type: 'string',
		default: createInterpolateElement(
			__(
				'Edit your surveys on <a>crowdsignal.com</a>',
				'crowdsignal-forms'
			),
			{
				a: (
					// eslint-disable-next-line jsx-a11y/anchor-has-content
					<a
						href="https://app.crowdsignal.com"
						target="_blank"
						rel="external noreferrer noopener"
					/>
				),
			}
		),
	},
	dashboardLink: {
		type: 'string',
		default: 'https://app.crowdsignal.com/?ref=surveyembedblock',
	},
	embedMessage: {
		type: 'string',
		default: __(
			'Paste a link to the survey you want to display on your site',
			'crowdsignal-forms'
		),
	},
	placeholderTitle: {
		type: 'string',
		default: __( 'Survey Embed', 'crowdsignal-forms' ),
	},
};
