/**
 * Middlewares to be applied to the apiFetch call.
 */
const middlewareRegistry = [];

/**
 * Applies all middlewares and runs the request.
 *
 * @param  {Object}   options      Passed as the second param for window.fetch
 * @param  {string}   options.path Request URL
 * @param  {Function} apply        The middleware to apply next
 * @return {Promise}               Request promise
 */
const run = async ( { path, ...options }, [ apply, ...middlewares ] ) => {
	if ( ! apply ) {
		const response = await window.fetch( path, options );

		return response.json();
	}

	return apply(
		{
			path,
			...options,
		},
		( nextOptions ) => run( nextOptions, middlewares )
	);
};

/**
 * Makes a request using window.fetch and registered middleware.
 *
 * @param  {Object}  options      Request options
 * @param  {string}  options.path Request URL (required)
 * @return {Promise}              Request promise
 */
const apiFetch = async ( options ) => run( options, middlewareRegistry );

/**
 * Appends a middleware to apiFetch
 *
 * @param  {Function} middleware Middleware function
 */
apiFetch.use = ( middleware ) => middlewareRegistry.push( middleware );

/**
 * Prefix the request URLs with '/wp-json'
 */
apiFetch.use( ( options, next ) => {
	if ( options.path.indexOf( '/crowdsignal-forms/v1' ) === 0 ) {
		options.path = `/wp-json${ options.path }`;
	}

	return next( options );
} );

/**
 * Set default headers
 */
apiFetch.use( ( options, next ) => {
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
} );

/**
 * Convert data to JSON
 */
apiFetch.use( ( { data, ...options }, next ) => {
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
} );

/**
 * Auth middleware.
 *
 * Detect whether the current user is logged in and if so, include credentials in the request.
 */
apiFetch.use( ( options, next ) => {
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
} );

export default apiFetch;
