/**
 * External dependencies
 */
import { filter, isEmpty, map, tap } from 'lodash';

/**
 * Internal dependencies
 */
import { FontFamilyType, GoogleFonts } from 'blocks/poll/constants';

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

/**
 * Loads a custom google font, by name, only once per page if called more than once for the same font.
 *
 * @param {*} font The name of the Google font
 */
export const loadCustomFont = ( font ) => {
	if (
		isEmpty( font ) ||
		FontFamilyType.THEME_DEFAULT === font ||
		-1 === GoogleFonts.indexOf( font )
	) {
		return;
	}

	const googleFontsLink = `https://fonts.googleapis.com/css2?family=${ font }:wght@400;600;700&display=swap`;
	const crowdsignalFonts = filter(
		Array.from( document.head.childNodes ),
		( node ) =>
			node.nodeName.toLowerCase() === 'link' &&
			node.href === googleFontsLink
	);

	if ( crowdsignalFonts.length === 0 ) {
		document.head.appendChild(
			tap( document.createElement( 'link' ), ( link ) => {
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = googleFontsLink;
			} )
		);
	}
};
