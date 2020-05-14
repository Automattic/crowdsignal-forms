/**
 * Internal dependencies
 */
import {
	addAnswer,
	getEmptyAnswersCount,
	getNodeBackgroundColor,
	getFontFamilyFromType,
	getBlockCssClasses,
} from './util';
import { FontFamilyType, FontFamilyMap } from './constants';

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

test( 'getNodeBackgroundColor returns parent color if passed in node has a transparent background', () => {
	const parentBackgroundColor = '#00ff00';
	const parentNode = document.createElement( 'div' );
	const node = document.createElement( 'div' );
	parentNode.appendChild( node );

	window.getComputedStyle = ( nodeToCheck ) => {
		let backgroundColor = 'rgba(0, 0, 0, 0)';

		if ( nodeToCheck === parentNode ) {
			backgroundColor = parentBackgroundColor;
		}

		return { backgroundColor };
	};

	expect( getNodeBackgroundColor( node ) ).toEqual( parentBackgroundColor );
} );

test( 'getNodeBackgroundColor returns current node background color if background is not transparent', () => {
	const backgroundColor = '#00ff00';
	const node = document.createElement( 'div' );

	window.getComputedStyle = () => ( { backgroundColor } );

	expect( getNodeBackgroundColor( node ) ).toEqual( backgroundColor );
} );

test( 'getFontFamilyFromType returns proper family when valid value is given', () => {
	expect( getFontFamilyFromType( FontFamilyType.COMIC_SANS ) ).toEqual(
		FontFamilyMap[ FontFamilyType.COMIC_SANS ]
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
	[ 'submitButtonBackgroundColor', 'has-custom-submit-button-bg-color' ],
	[ 'submitButtonTextColor', 'has-custom-submit-button-text-color' ],
	[ 'backgroundColor', 'has-custom-bg-color' ],
	[ 'textColor', 'has-custom-text-color' ],
	[ 'fontFamily', 'has-custom-font-family' ],
	[ 'borderColor', 'has-custom-border-color' ],
	[ 'borderWidth', 'has-custom-border-width' ],
	[ 'borderRadius', 'has-custom-border-radius' ],
	[ 'hasBoxShadow', 'has-custom-box-shadow' ],
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
