/**
 * External dependencies
 */
import { kebabCase, mapKeys } from 'lodash';

export const getStyleVars = ( attributes, fallbackStyles ) =>
	mapKeys(
		{
			backgroundColor: attributes.backgroundColor || '#ffffff',
			buttonColor: attributes.buttonColor || fallbackStyles.accentColor,
			buttonTextColor:
				attributes.buttonTextColor || fallbackStyles.textColorInverted,
			textColor: attributes.textColor || fallbackStyles.textColor,
			textSize: fallbackStyles.textSize,
			triggerBackgroundColor:
				attributes.triggerBackgroundColor || fallbackStyles.accentColor,
			triggerTextColor:
				attributes.triggerTextColor || fallbackStyles.textColorInverted,
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);

export const isWidgetEditor = () => !! window.wp.customizeWidgets;
