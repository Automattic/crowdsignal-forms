/**
 * External dependencies
 */
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import { useFetch } from './util.js';

export const usePollResults = ( pollId ) => {
	const { data, error, loading } = useFetch( () => {
		// This would be an API fetch call but we're faking it for demonstration purposes
		return new Promise( ( resolve ) => {
			setTimeout(
				() =>
					resolve(
						times( 10, () => 300 ) // Return 10 entries with 300 votes each
					),
				1500
			);
		} );
	}, [ pollId ] );

	return {
		error,
		loading,
		results: data,
	};
};
