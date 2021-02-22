/**
 * Prefixes the request URLs with '/wp-json'
 *
 * @param  {Object}   options Request options
 * @param  {Function} next    Next middleware
 * @return {Promise}
 */
export const formatURL = ( options, next ) => {
	if ( options.path.indexOf( '/crowdsignal-forms/v1' ) === 0 ) {
		options.path = `/wp-json${ options.path }`;
	}

	return next( options );
};

/**
 * Set default headers
 *
 * @param  {Object}   options Request options
 * @param  {Function} next    Next middleware
 * @param  {Promise}
 */
export const defaultHeaders = ( options, next ) => {
	const headers = options.headers || {};

	return next( {
		...options,
		headers: {
			...headers,
			// The backend uses the Accept header as a condition for considering an
			// incoming request as a REST request.
			//
			// See: https://core.trac.wordpress.org/ticket/44534
			Accept: 'application/json, */*;q=0.1',
		},
	} );
};

/**
 * Convert data to JSON
 *
 * @param  {Object}   options      Request options
 * @param  {Object}   options.data Request data
 * @param  {Function} next         Next middleware
 * @param  {Promise}
 */
export const formatRequest = ( { data, ...options }, next ) => {
	if ( ! data ) {
		return next( options );
	}

	return next( {
		...options,
		headers: {
			...options.headers,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( data ),
	} );
};

/**
 * Auth middleware.
 * Detects whether the current user is logged in and if so, include credentials in the request.
 *
 * @param  {Object}   options Request options
 * @param  {Function} next    Next middleware
 * @param  {Promise}
 */
export const wpAuth = ( options, next ) => {
	if ( ! window._crowdsignalFormsWpNonce ) {
		return next( options );
	}

	return next( {
		credentials: 'same-origin',
		mode: 'same-origin',
		...options,
		headers: {
			'X-WP-Nonce': window._crowdsignalFormsWpNonce,
			...options.headers,
		},
	} );
};
