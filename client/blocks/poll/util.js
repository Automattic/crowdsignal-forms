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
