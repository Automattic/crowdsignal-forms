/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isEmpty, kebabCase, mapKeys } from 'lodash';

export const getApplauseStyleVars = ( attributes, fallbackStyles ) => {
	const textColor = isEmpty( attributes.textColor )
		? fallbackStyles.textColor
		: attributes.textColor;

	return mapKeys(
		{
			bgColor:
				attributes.backgroundColor || fallbackStyles.backgroundColor,
			textColor,
			hoverColor: fallbackStyles.accentColor,
			borderRadius: `${ attributes.borderRadius || 0 }px`,
			borderWidth: `${ attributes.borderWidth || 0 }px`,
			borderColor: attributes.borderColor,
		},
		( _, key ) => `--crowdsignal-forms-applause-${ kebabCase( key ) }`
	);
};

/**
 * Returns a css 'class' string of overridden styles given a collection of attributes.
 *
 * @param {*} attributes The block's attributes
 * @param {...any} extraClasses A list of additional classes to add to the class string
 */
export const getBlockCssClasses = ( attributes, ...extraClasses ) => {
	return classNames(
		{
			'has-bg-color': attributes.backgroundColor,
			'has-text-color': attributes.textColor,
			'has-border-color': attributes.borderColor,
		},
		extraClasses
	);
};
