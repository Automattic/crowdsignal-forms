/**
 * Creates a new Answer object then returns a copy of the passed in `answers` array with the new answer appended to it.
 *
 * @param array answers The existing array of answers.
 * @param string text The text for the new answer to add.
 * @returns array The newly created answers array.
 */
export const addAnswer = ( answers, text ) => [ ...answers, {
	answerId: null,
	text: text,
} ]
