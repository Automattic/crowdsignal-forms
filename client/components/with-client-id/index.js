/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { forEach } from 'lodash';

const withClientId = ( clientIdAttributes ) => ( Element ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;

		useEffect( () => {
			forEach( clientIdAttributes, ( key ) => {
				if ( attributes[ key ] ) {
					return;
				}

				setAttributes( {
					[ key ]: uuid(),
				} );
			} );
		}, [] );

		return <Element { ...props } />;
	};
};

export default withClientId;
