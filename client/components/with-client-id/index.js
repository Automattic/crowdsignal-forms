/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isArray, map } from 'lodash';

const withClientId = ( Element, clientIdAttributeNames ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;
		const clientIdNames = isArray( clientIdAttributeNames )
			? clientIdAttributeNames
			: [ clientIdAttributeNames ];
		useEffect( () => {
			map( clientIdNames, ( name ) => {
				if ( ! attributes[ name ] ) {
					const clientId = uuidv4();
					const newAttribute = {};
					newAttribute[ name ] = clientId;

					setAttributes( newAttribute );
				}
			} );
		} );

		return <Element { ...props } />;
	};
};

export default withClientId;
