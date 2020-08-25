/**
 * External dependencies
 */
import classNames from 'classnames';
import { includes, isEmpty, kebabCase, mapKeys } from 'lodash';

/**
 * WordPress dependencies
 */
import { registerBlockStyle, unregisterBlockStyle } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	FontFamilyType,
	FontFamilyMap,
	PollStatus,
	AnswerStyle,
} from './constants';
import { __ } from 'lib/i18n';

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

export const getStyleVars = ( attributes, fallbackStyles ) => {
	const textColor = isEmpty( attributes.textColor )
		? fallbackStyles.text
		: attributes.textColor;

	return mapKeys(
		{
			borderColor: attributes.borderColor ?? fallbackStyles.accent,
			borderRadius: `${ attributes.borderRadius }px`,
			borderWidth: `${ attributes.borderWidth }px`,
			bgColor: attributes.backgroundColor,
			bodyFontFamily:
				getFontFamilyFromType( attributes.fontFamily ) ??
				fallbackStyles.bodyFontFamily,
			questionFontFamily:
				getFontFamilyFromType( attributes.fontFamily ) ??
				fallbackStyles.questionFontFamily,
			submitButtonBgColor:
				attributes.submitButtonBackgroundColor || fallbackStyles.accent,
			submitButtonTextColor:
				attributes.submitButtonTextColor || fallbackStyles.textInverted,
			textColor,
			textColorProperties:
				extractRGBColorProperties( textColor ) ?? '0, 0, 0',
			contentWideWidth: fallbackStyles.contentWideWidth,
		},
		( _, key ) => `--crowdsignal-forms-${ kebabCase( key ) }`
	);
};

/**
 * Extracts the comma separated color properties from an rgb string.
 * rgba strings are not supported for now because it introduces too many complications.
 *
 * @param {string} color The color string.
 * @return {string} The 3 comma separated rgb color properties.
 */
export const extractRGBColorProperties = ( color ) => {
	if (
		! color ||
		'string' !== typeof color ||
		( -1 === color.indexOf( 'rgb' ) && 0 !== color.indexOf( '#' ) ) ||
		-1 < color.indexOf( 'rgba' )
	) {
		return null;
	}

	if ( 0 === color.indexOf( '#' ) ) {
		color = hexToRGB( color );
	}

	return color.match( /\((.*?)\)/ )[ 1 ];
};

/**
 * converts css color hex to rgb
 *
 * @param {string} h The hex color string.
 * @return {string} The rgb value.
 */
export const hexToRGB = ( h ) => {
	let r = 0,
		g = 0,
		b = 0;

	const hexCode =
		4 === h.length
			? `#${ h[ 1 ] + h[ 1 ] + h[ 2 ] + h[ 2 ] + h[ 3 ] + h[ 3 ] }`
			: h;

	if ( 7 === hexCode.length ) {
		r = parseInt( hexCode.substr( 1, 2 ), 16 ) || 0;
		g = parseInt( hexCode.substr( 3, 2 ), 16 ) || 0;
		b = parseInt( hexCode.substr( 5, 2 ), 16 ) || 0;
	}

	return `rgb(${ r }, ${ g }, ${ b })`;
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
			'has-submit-button-bg-color':
				attributes.submitButtonBackgroundColor,
			'has-submit-button-text-color': attributes.submitButtonTextColor,
			'has-border-radius': attributes.borderRadius ?? false,
			'has-box-shadow': attributes.hasBoxShadow,
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

/**
 * Returns the type of answer controls that should be rendered given the current state of the block.
 *
 * @param {*} attributes the poll's attributes.
 * @param {string} className the css class string Gutenberg is passing into the block.
 */
export const getAnswerStyle = ( attributes, className ) => {
	if ( attributes.isMultipleChoice ) {
		return AnswerStyle.RADIO;
	}

	if (
		! isEmpty( className ) &&
		className.indexOf( 'is-style-buttons' ) > -1
	) {
		return AnswerStyle.BUTTON;
	}

	return AnswerStyle.RADIO;
};

/**
 * Registers or de-registers the `buttons` block style.
 *
 * @param {boolean} enable True if button style should be available, false if not.
 */
export const toggleButtonStyleAvailability = ( enable ) => {
	if ( enable ) {
		registerBlockStyle( 'crowdsignal-forms/poll', {
			name: 'buttons',
			label: __( 'Buttons' ),
		} );
	} else {
		unregisterBlockStyle( 'crowdsignal-forms/poll', 'buttons' );
	}
};
