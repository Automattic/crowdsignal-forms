/**
 * Internal dependencies
 */
import { getBackgroundColor } from './util';

test( 'getBackgroundColor returns parent color if passed in node has a transparent background', () => {
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

	expect( getBackgroundColor( node ) ).toEqual( parentBackgroundColor );
} );

test( 'getBackgroundColor returns current node background color if background is not transparent', () => {
	const backgroundColor = '#00ff00';
	const node = document.createElement( 'div' );

	window.getComputedStyle = () => ( { backgroundColor } );

	expect( getBackgroundColor( node ) ).toEqual( backgroundColor );
} );
