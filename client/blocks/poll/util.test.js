/**
 * Internal dependencies
 */
import {
	addAnswer,
	getFontFamilyFromType,
	getBlockCssClasses,
	isPollClosed,
	pollIdExistsInPageContent,
} from './util';
import { FontFamilyType, FontFamilyMap, PollStatus } from './constants';

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

test( 'getFontFamilyFromType returns proper family when valid value is given', () => {
	expect( getFontFamilyFromType( FontFamilyType.ARIAL ) ).toEqual(
		FontFamilyMap[ FontFamilyType.ARIAL ]
	);
} );

test( 'getFontFamilyFromType returns null when invalid value is given', () => {
	expect( getFontFamilyFromType( 'invalid-font-type' ) ).toBeNull();
} );

test( 'getBlockCssClasses returns extra classes when provided', () => {
	const attributes = {
		submitButtonBackgroundColor: 'red',
		submitButtonTextColor: 'black',
	};
	const classes = getBlockCssClasses( attributes, 'class1', 'class2' );

	expect( classes ).toContain( 'class1' );
	expect( classes ).toContain( 'class2' );
} );

test( 'getBlockCssClasses returns no classes when no attributes or extra classes are provided', () => {
	expect( getBlockCssClasses( {} ) ).toEqual( '' );
} );

test( 'getBlockCssClasses does not return font family override if fontFamily is set to `theme-default`', () => {
	expect(
		getBlockCssClasses( {
			fontFamily: FontFamilyType.THEME_DEFAULT,
		} )
	).toEqual( '' );
} );

test.each( [
	[ 'submitButtonBackgroundColor', 'has-submit-button-bg-color' ],
	[ 'submitButtonTextColor', 'has-submit-button-text-color' ],
	[ 'backgroundColor', 'has-bg-color' ],
	[ 'textColor', 'has-text-color' ],
	[ 'fontFamily', 'has-font-family' ],
	[ 'borderRadius', 'has-border-radius' ],
	[ 'hasBoxShadow', 'has-box-shadow' ],
] )(
	'getBlockCssClasses when only %s is provided',
	( attributeName, associatedClass ) => {
		const attributes = {};
		attributes[ attributeName ] = 'value';

		const classes = getBlockCssClasses( attributes );

		expect( classes ).toContain( associatedClass );
		expect( classes.split( ' ' ).length ).toEqual(
			1,
			'There should only be 1 class in the returned string.'
		);
	}
);

test.each( [
	[
		'poll is open, closed after is not set',
		false,
		PollStatus.OPEN,
		null,
		null,
	],
	[
		'poll is open, closed after is set and past',
		false,
		PollStatus.OPEN,
		new Date( 2020, 1, 1 ).toISOString(),
		new Date( 2021, 1, 1 ),
	],
	[
		'poll is closed, closed after is not set',
		true,
		PollStatus.CLOSED,
		null,
		null,
	],
	[
		'poll is closed, closed after is set but not yet past',
		true,
		PollStatus.CLOSED,
		new Date( 2020, 1, 1 ).toISOString(),
		new Date( 2019, 1, 1 ),
	],
	[
		'poll is set to PollStatus.CLOSED_AFTER but time has not past yet',
		false,
		PollStatus.CLOSED_AFTER,
		new Date( 2020, 1, 1 ).toISOString(),
		new Date( 2019, 1, 1 ),
	],
	[
		'poll is set to PollStatus.CLOSED_AFTER and time has past',
		true,
		PollStatus.CLOSED_AFTER,
		new Date( 2020, 1, 1 ).toISOString(),
		new Date( 2021, 1, 1 ),
	],
	[
		'poll is set to PollStatus.CLOSED_AFTER and current time is the same as closed after time',
		false,
		PollStatus.CLOSED_AFTER,
		new Date( 2020, 1, 1 ).toISOString(),
		new Date( 2020, 1, 1 ),
	],
] )(
	'isPollClosed when %s, should return %s',
	(
		_,
		expectedIsClosed,
		pollStatus,
		closedAfterDateTime,
		currentDateTime
	) => {
		expect(
			isPollClosed( pollStatus, closedAfterDateTime, currentDateTime )
		).toEqual( expectedIsClosed );
	}
);

const testPostContent = `post content
<!-- wp:crowdsignal-forms/poll {"pollId":10573434,"question":"First poll on page"} /-->
middle post content
<!-- wp:crowdsignal-forms/poll {"pollId":10578923,"question":"Another poll on the page"} /-->
More post content, with some non-crowdsignal blocks in there too
<!-- wp:block {"ref":246} /-->`;

test.each( [ [ null ], [ undefined ], [ '' ] ] )(
	'pollIdExistsInPostContent returns false if pollId is not set',
	( pollId ) => {
		expect( pollIdExistsInPageContent( pollId, testPostContent ) ).toEqual(
			false
		);
	}
);

test( 'pollIdExistsInPostContent returns true if pollId is present', () => {
	expect( pollIdExistsInPageContent( 10573434, testPostContent ) ).toEqual(
		true
	);
} );

test( 'pollIdExistsInPostContent returns false if pollId is NOT present', () => {
	expect( pollIdExistsInPageContent( 123, testPostContent ) ).toEqual(
		false
	);
} );
