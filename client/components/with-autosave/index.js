/**
 * External dependencies
 */
import React, { useState } from 'react';
import { debounce, intersection, isEmpty, keys } from 'lodash';

/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';

const SAVE_DEBOUNCE = 1500;
const RETRY_THRESHOLD = 3;

export const withAutosave = ( onSave, watchedAttributes = [] ) => {
	const debouncedSave = debounce(
		( attributes, setAttributes, onSuccess, onFailure ) =>
			onSave( attributes, setAttributes )
				.then( onSuccess )
				.catch( onFailure ),
		SAVE_DEBOUNCE
	);

	const shouldSave = ( attributes ) =>
		! isEmpty( intersection( watchedAttributes, keys( attributes ) ) );

	return ( WrappedComponent ) => {
		return ( props ) => {
			const [ needsRetry, setNeedsRetry ] = useState( true );
			const [ isSaving, setIsSaving ] = useState( false );
			const [ error, setError ] = useState( false );

			const { attributes, clientId, setAttributes } = props;

			const handleSave = ( data = attributes, retryCount = 0 ) => {
				setError( false );
				setIsSaving( true );
				dispatch( 'core/editor' ).lockPostSaving( clientId );

				debouncedSave(
					data,
					setAttributes,
					() => {
						setIsSaving( false );
						setNeedsRetry( true );
						dispatch( 'core/editor' ).unlockPostSaving( clientId );
					},
					() => {
						if ( ! needsRetry ) {
							setNeedsRetry( true );
							return;
						}

						if ( retryCount < RETRY_THRESHOLD ) {
							handleSave( data, retryCount + 1 );
							return;
						}

						setError( true );
						setIsSaving( false );
						dispatch( 'core/editor' ).unlockPostSaving( clientId );
					}
				);
			};

			const saveAttributes = ( newAttributes ) => {
				if ( shouldSave( newAttributes ) ) {
					if ( isSaving ) {
						setNeedsRetry( false );
					}

					handleSave( {
						...attributes,
						...newAttributes,
					} );
				}

				setAttributes( newAttributes );
			};

			const handleForceSave = () => handleSave();

			return (
				<WrappedComponent
					attributes={ attributes }
					setAttributes={ saveAttributes }
					forceSave={ handleForceSave }
					saveError={ error }
					{ ...props }
				/>
			);
		};
	};
};
