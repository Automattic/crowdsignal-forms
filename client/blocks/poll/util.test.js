/**
 * Internal dependencies
 */
import { addAnswer } from './util';

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
