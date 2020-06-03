/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

export const useFetch = ( fetchCallback, watchProps ) => {
	const [ data, setData ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		setLoading( true );
		setError( null );
		setData( null );

		fetchCallback()
			.then( setData )
			.catch( setError )
			.finally( () => setLoading( false ) );
	}, watchProps );

	return {
		data,
		error,
		loading,
	};
};
