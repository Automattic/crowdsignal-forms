/**
 * External dependencies
 */
import { filter } from 'lodash';

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
	let backgroundColor = getComputedStyle( backgroundColorNode )
		.backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType === Node.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor = getComputedStyle( backgroundColorNode )
			.backgroundColor;
	}
	return backgroundColor;
};
