/**
 * External dependencies
 */
import { kebabCase, mapKeys } from 'lodash';

export const getStyleVars = ( attributes, fallbackStyles ) =>
	mapKeys(
		{
			backgroundColor: attributes.backgroundColor || '#ffffff',
			buttonColor: attributes.buttonColor || fallbackStyles.accentColor,
			textColor: attributes.textColor || fallbackStyles.textColor,
			textColorInverted: fallbackStyles.textColorInverted,
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);
