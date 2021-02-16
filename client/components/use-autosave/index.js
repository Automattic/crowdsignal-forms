/**
 * External dependencies
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce, values } from 'lodash';

const SAVE_DEBOUNCE = 1500;
const RETRY_THRESHOLD = 3;

export const useAutosave = ( onSave, data = {} ) => {
	const [ error, setError ] = useState( false );

	const revision = useRef( 0 );

	const debouncedSave = useCallback(
		debounce(
			( args, onFailure ) => onSave( args ).catch( onFailure ),
			SAVE_DEBOUNCE
		),
		[]
	);

	const handleSave = useCallback( ( savedRevision, retryCount = 1 ) => {
		setError( false );

		debouncedSave( data, () => {
			// Don't retry if there are new changes waiting to be saved
			if ( savedRevision !== revision.current ) {
				return;
			}

			if ( retryCount < RETRY_THRESHOLD ) {
				handleSave( savedRevision, retryCount + 1 );
				return;
			}

			setError( true );
		} );
	}, values( data ) );

	useEffect( () => {
		// Don't autosave on initial render
		if ( 0 === revision.current++ ) {
			return;
		}

		handleSave( revision.current );
	}, values( data ) );

	return {
		error,
		save: () => handleSave( revision.current ),
	};
};
