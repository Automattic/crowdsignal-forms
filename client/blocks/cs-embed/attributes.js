/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';



export default {
	"url": {
		"type": "string"
	},
	"caption": {
		"type": "string",
		"source": "html",
		"selector": "figcaption"
	},
	"type": {
		"type": "string",
		"default": "html"
	},
	"providerNameSlug": {
		"type": "string",
		"default": "crowdsignal"
	},
	"allowResponsive": {
		"type": "boolean",
		"default": true
	},
	"responsive": {
		"type": "boolean",
		"default": false
	},
	"previewable": {
		"type": "boolean",
		"default": true
	},
	"createLink": {
		"type": "string",
		"default": "https://app.crowdsignal.com/surveys/new"
	},
	"createText": {
		"type": "string",
		"default": "Create a new Survey"
	}
};
