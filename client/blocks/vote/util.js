/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isEmpty, kebabCase, mapKeys } from 'lodash';

export const getVoteStyleVars = ( attributes ) => {
	return mapKeys(
		{
			borderRadius: `${ attributes.borderRadius }px`,
			borderWidth: `${ attributes.borderWidth }px`,
		},
		( _, key ) => `--crowdsignal-forms-vote-${ kebabCase( key ) }`
	);
};

export const getVoteItemStyleVars = ( attributes, fallbackStyles ) => {
	const textColor = isEmpty( attributes.textColor )
		? fallbackStyles.text
		: attributes.textColor;

	return mapKeys(
		{
			borderColor: attributes.borderColor,
			bgColor: attributes.backgroundColor,
			textColor,
			votedColor: fallbackStyles.accent,
		},
		( _, key ) => `--crowdsignal-forms-vote-${ kebabCase( key ) }`
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
