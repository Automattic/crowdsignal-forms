/**
 * External dependencies
 */
import { map, uniqueId } from 'lodash';

/**
 * Generates unique answer IDs for answers that have not beeen published yet.
 * This keeps the poll block working while in preview mode.
 *
 * @param  {Array} answers Answers array
 * @return {Array}         Updated answers array
 */
export const maybeAddTemporaryAnswerIds = ( answers ) =>
	map( answers, ( answer ) => {
		if ( typeof answer.answerId !== 'undefined' ) {
			return answer;
		}

		return {
			...answer,
			answerId: parseInt( uniqueId(), 10 ),
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
