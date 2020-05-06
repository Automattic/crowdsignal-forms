/**
 * External dependencies
 */
import classNames from 'classnames';
import { filter, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { FontFamilyType, FontFamilyMap } from './constants';

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

/**
 * Returns the count of empty answers in the answers array
 *
 * @param  {Array}  answers Answers array
 * @return {number}         Empty answers count
 */
export const getEmptyAnswersCount = ( answers ) =>
	filter( answers, ( answer ) => ! answer.text ).length;

/**
 * Traverses the parent chain of the given node to get a 'best guess' of what the background color is if the provided node has a transparent background.
 * Algorithm for traversing parent chain "borrowed" from https://github.com/WordPress/gutenberg/blob/0c6e369/packages/block-editor/src/components/colors/use-colors.js#L201-L216
 *
 * @param  {Element} backgroundColorNode The element to check for background color
 * @return {string}  The background colour of the node
 */
export const getNodeBackgroundColor = ( backgroundColorNode ) => {
	let backgroundColor = window.getComputedStyle( backgroundColorNode )
		.backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType === window.Node.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor = window.getComputedStyle( backgroundColorNode )
			.backgroundColor;
	}
	return backgroundColor;
};

export const getFontFamilyFromType = ( type ) => {
	if ( ! includes( FontFamilyType, type ) ) {
		return null;
	}

	return FontFamilyMap[ type ];
};

export const getStyleVars = ( attributes ) => {
	return {
		'--crowdsignal-forms-font-family': getFontFamilyFromType(
			attributes.fontFamily
		),
		'--crowdsignal-forms-text-color': attributes.textColor,
		'--crowdsignal-forms-bg-color': attributes.backgroundColor,
		'--crowdsignal-forms-submit-button-text-color':
			attributes.submitButtonTextColor,
		'--crowdsignal-forms-submit-button-bg-color':
			attributes.submitButtonBackgroundColor,
	};
};
/**
 * Returns a css 'class' string of overridden styles given a collection of attributes.
 *
 * @param {*} attributes The block's attributes
 * @param  {...any} extraClasses A list of additional classes to add to the class string
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
		},
		extraClasses
	);
};
