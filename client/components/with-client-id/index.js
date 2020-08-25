/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const withClientId = ( Element, clientIdAttributeName ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;
		useEffect( () => {
			if ( ! attributes[ clientIdAttributeName ] ) {
				const clientId = uuidv4();
				const newAttribute = {};
				newAttribute[ clientIdAttributeName ] = clientId;

				setAttributes( newAttribute );
			}
		} );

		return <Element { ...props } />;
	};
};

export default withClientId;
