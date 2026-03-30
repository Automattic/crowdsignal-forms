/**
 * External dependencies
 */
import { kebabCase, mapKeys } from 'lodash';

export const getStyleVars = ( attributes, fallbackStyles ) => {
	// When the style probe can't detect proper theme button colors
	// (e.g., in the iframed block editor), accentColor and textColorInverted
	// both resolve to the same value. Don't set those CSS variables so the
	// theme's .wp-block-button__link styles apply instead.
	const fallbacksValid =
		fallbackStyles.accentColor !== fallbackStyles.textColorInverted;

	return mapKeys(
		{
			backgroundColor: attributes.backgroundColor || '#ffffff',
			buttonColor:
				attributes.buttonColor ||
				( fallbacksValid ? fallbackStyles.accentColor : undefined ),
			buttonTextColor:
				attributes.buttonTextColor ||
				( fallbacksValid
					? fallbackStyles.textColorInverted
					: undefined ),
			textColor: attributes.textColor || fallbackStyles.textColor,
			textSize: fallbackStyles.textSize,
			triggerBackgroundColor:
				attributes.triggerBackgroundColor ||
				( fallbacksValid ? fallbackStyles.accentColor : undefined ),
			triggerTextColor:
				attributes.triggerTextColor ||
				( fallbacksValid
					? fallbackStyles.textColorInverted
					: undefined ),
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);
};

export const isWidgetEditor = () => !! window.wp.customizeWidgets;
