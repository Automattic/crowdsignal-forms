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
		return window.fetch( path, options );
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

export default apiFetch;
