/**
 * External dependencies
 */
import seedrandom from 'seedrandom';

/**
 * Internal dependencies
 */
import { shuffleWithGenerator, isAnswerEmpty } from './util';

test( 'shuffleWithGenerator does not modify the original array', () => {
	const elements = [ 1, 2, 3, 4, 5 ];
	const elementsClone = elements.slice();

	shuffleWithGenerator( elements, new seedrandom() );

	expect( elements ).toEqual( elementsClone );
} );

test( 'shuffleWithGenerator does not gain or lose any elements', () => {
	const elements = [ 1, 2, 3, 4, 5 ];
	const shuffled = shuffleWithGenerator( elements, new seedrandom() );

	expect( shuffled ).toHaveLength( elements.length );
	expect( shuffled ).toEqual( expect.arrayContaining( elements ) );
} );

test( 'shuffleWithGenerator shuffles the same way twice when provided with the same random number generator', () => {
	const seed = 1;
	let rng = new seedrandom( seed );
	const elements = [ 1, 2, 3, 4, 5 ];
	const shuffled = shuffleWithGenerator( elements, rng );

	rng = new seedrandom( seed );
	const shuffledAgain = shuffleWithGenerator( elements, rng );

	expect( shuffled ).toEqual( shuffledAgain );
} );

test( 'shuffleWithGenerator actually shuffles the elements, when given a random number generator', () => {
	const rng = new seedrandom();
	const elements = [ 1, 2, 3, 4, 5 ];
	const shuffled = shuffleWithGenerator( elements, rng );

	expect( shuffled ).not.toEqual( elements );
} );

test( 'shuffleWithGenerator does not shuffle any elements, when given a static number generator', () => {
	const elements = [ 1, 2, 3, 4, 5 ];

	const shuffled = shuffleWithGenerator( elements, () => 1 );

	expect( elements ).toEqual( shuffled );
} );

test.each( [
	[ 'object is empty', {} ],
	[ 'object only has answerId', { answerId: 123 } ],
	[ 'object has only text as empty string', { text: '' } ],
	[ 'object has only empty text and answerId', { text: '', answerId: 123 } ],
] )( 'isAnswerEmpty returns true if %s', ( _, answer ) => {
	expect( isAnswerEmpty( answer ) ).toEqual( true );
} );

test.each( [
	[ 'object has non-empty text value', { text: 'answer value' } ],
] )( 'isAnswerEmpty returns false if %s', ( _, answer ) => {
	expect( isAnswerEmpty( answer ) ).toEqual( false );
} );
