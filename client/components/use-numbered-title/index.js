/**
 * External dependencies
 */
import { useEffect } from 'react';
import { isEmpty, isNil } from 'lodash';

const useNumberedTitle = (
	blockName,
	titlePrefix,
	attributes,
	setAttributes
) =>
	useEffect( () => {
		if ( isEmpty( window.csBlockTypeCount ) ) {
			window.csBlockTypeCount = {};
		}

		if ( isNil( window.csBlockTypeCount[ blockName ] ) ) {
			window.csBlockTypeCount[ blockName ] = 0;
		}

		window.csBlockTypeCount[ blockName ]++;

		if ( null !== attributes.title ) {
			// exit if title is set, but only after block count has been set, so newer blocks get the correct count.
			return;
		}

		if ( 1 === window.csBlockTypeCount[ blockName ] ) {
			setAttributes( {
				title: titlePrefix,
			} );
		} else {
			setAttributes( {
				title: `${ titlePrefix } ${ window.csBlockTypeCount[ blockName ] }`,
			} );
		}
	}, [] );

export default useNumberedTitle;
