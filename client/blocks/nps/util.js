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
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);
