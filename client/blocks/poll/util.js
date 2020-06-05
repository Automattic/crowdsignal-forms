/**
 * External dependencies
 */
import classNames from 'classnames';
import { includes, kebabCase, mapKeys } from 'lodash';

/**
 * Internal dependencies
 */
import { FontFamilyType, FontFamilyMap, PollStatus } from './constants';

/**
 * Creates a new Answer object then returns a copy of the passed in `answers` array with the new answer appended to it.
 *
 * @param  {Array}  answers The existing array of answers.
 * @param  {string} text	The text for the new answer to add.
 * @return {Array}			The newly created answers array.
 */
export const addAnswer = ( answers, text ) => [
	...answers,
	{
		answerId: null,
		text,
	},
];

export const getFontFamilyFromType = ( type ) => {
	if ( ! includes( FontFamilyType, type ) ) {
		return null;
	}

	return FontFamilyMap[ type ];
};

export const getStyleVars = ( attributes, fallbackColors ) =>
	mapKeys(
		{
			borderColor: attributes.borderColor ?? fallbackColors.accent,
			borderRadius: `${ attributes.borderRadius }px`,
			borderWidth: `${ attributes.borderWidth }px`,
			bgColor: attributes.backgroundColor,
			fontFamily: getFontFamilyFromType( attributes.fontFamily ),
			submitButtonBgColor: attributes.submitButtonBackgroundColor,
			submitButtonTextColor: attributes.submitButtonTextColor,
			subtleTextColor: fallbackColors.textSubtle,
			textColor: attributes.textColor || fallbackColors.text,
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);

/**
 * Returns a css 'class' string of overridden styles given a collection of attributes.
 *
 * @param {*} attributes The block's attributes
 * @param {...any} extraClasses A list of additional classes to add to the class string
 */
export const getBlockCssClasses = ( attributes, ...extraClasses ) => {
	return classNames(
		{
			'has-custom-font-family':
				attributes.fontFamily &&
				FontFamilyType.THEME_DEFAULT !== attributes.fontFamily,
			'has-custom-bg-color': attributes.backgroundColor,
			'has-custom-text-color': attributes.textColor,
			'has-custom-submit-button-bg-color':
				attributes.submitButtonBackgroundColor,
			'has-custom-submit-button-text-color':
				attributes.submitButtonTextColor,
			'has-custom-border-radius': attributes.borderRadius ?? false,
			'has-custom-box-shadow': attributes.hasBoxShadow,
		},
		extraClasses
	);
};

/**
 * Determines if the poll is closed based on its editor settings.
 *
 * @param {string} pollStatus The poll's status, as set in the editor.
 * @param {string} closedAfterDateTimeUTC The UTC date time string to close the poll after if pollStatus is PollStatus.CLOSED_AFTER.
 * @param {Date}   currentDateTime  Optionally set the current date that will be used for current time comparisons.
 */
export const isPollClosed = (
	pollStatus,
	closedAfterDateTimeUTC,
	currentDateTime = new Date()
) => {
	if ( PollStatus.CLOSED === pollStatus ) {
		return true;
	}

	if ( PollStatus.CLOSED_AFTER === pollStatus ) {
		const closedAfterDateTime = new Date( closedAfterDateTimeUTC );

		return closedAfterDateTime < currentDateTime;
	}

	return false;
};
