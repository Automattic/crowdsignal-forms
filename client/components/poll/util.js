/**
 * External dependencies
 */
import { isEmpty, map } from 'lodash';

/**
 * Adds api answer ids to the answer objects (when they are available).
 *
 * @param  {Array} answers     Answers array
 * @param  {Array} answerIdMap A json object with client answer ids as keys, and API answer ids as values.
 * @return {Array}             Updated answers array
 */
export const addApiAnswerIds = ( answers, answerIdMap ) =>
	map( answers, ( answer ) => {
		if ( typeof answer.answerIdFromApi !== 'undefined' ) {
			return answer;
		}
		return {
			...answer,
			answerIdFromApi: answerIdMap[ answer.answerId ],
		};
	} );

/**
 * Fisher-Yates algorithm shuffle implementation.
 * Provides a predictable way of shuffling array items given a seed.
 *
 * @param {Array} toShuffle The array to shuffle.
 * @param {Function} randomNumberGenerator A function that generates a random number (like `seedrandom`).
 * @return {Array} The shuffled array.
 */
export const shuffleWithGenerator = ( toShuffle, randomNumberGenerator ) => {
	const shuffled = toShuffle.slice();

	for ( let i = shuffled.length - 1; i > 0; i-- ) {
		const j = Math.floor( randomNumberGenerator() * i );
		const tmp = shuffled[ i ];
		shuffled[ i ] = shuffled[ j ];
		shuffled[ j ] = tmp;
	}
	return shuffled;
};

/**
 * Determines if an answer is considered "empty", based on if text is set and blank or object has no values.
 *
 * @param {*} answer The answer object.
 */
export const isAnswerEmpty = ( answer ) =>
	isEmpty( answer ) ||
	'undefined' === typeof answer.text ||
	null === answer.text ||
	'' === answer.text;
