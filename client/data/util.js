const WP_API_REQUEST_TIMEOUT = 10000;

/**
 * Wraps a promise in a timeout that will reject
 * when it fails to complite within given time.
 *
 * @param  {Promise} promise Promise
 * @return {Promise}         Promise wrapped in a request timeout
 */
export const withRequestTimeout = ( promise ) =>
	new Promise( ( resolve, reject ) => {
		const timer = setTimeout(
			() => reject( new Error( 'Request timed out' ) ),
			WP_API_REQUEST_TIMEOUT
		);

		promise.then( resolve, reject ).finally( () => clearTimeout( timer ) );
	} );
