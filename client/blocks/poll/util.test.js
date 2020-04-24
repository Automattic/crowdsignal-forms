/**
 * Internal dependencies
 */
import { addAnswer, getEmptyAnswersCount } from './util';

test( 'addAnswer returns array of 1 item when original answers is empty', () => {
	const answers = addAnswer( [], 'test' );

	expect( answers.length ).toEqual( 1 );
	expect( answers[ 0 ].text ).toEqual( 'test' );
} );

test( 'addAnswer appends new answer to end of array', () => {
	const originalAnswers = [ { answerId: null, text: 'answer 1' } ];

	const answers = addAnswer( originalAnswers, 'answer 2' );

	expect( answers.length ).toEqual( originalAnswers.length + 1 );
	expect( answers[ answers.length - 1 ].text ).toEqual( 'answer 2' );
} );

test( 'getEmptyAnswersCount returns 0 for an empty array', () => {
	const answers = [];

	expect( getEmptyAnswersCount( answers ) ).toEqual( 0 );
} );

test( 'getEmptyAnswersCount returns 0 if all answers in an array have a non-empty text attribute', () => {
	const answers = [ { text: 'foo' }, { text: 'bar' }, { text: 'baz' } ];

	expect( getEmptyAnswersCount( answers ) ).toEqual( 0 );
} );

test( 'getEmptyAnswersCount returns the number of answers in an array that have an empty text attribute', () => {
	const answers = [ { text: 'foo' }, {}, { text: 'bar' }, {} ];

	expect( getEmptyAnswersCount( answers ) ).toEqual( 2 );
} );
