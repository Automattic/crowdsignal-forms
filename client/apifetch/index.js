/**
 * External dependencies
 */
import { findIndex, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { defaultHeaders, formatURL, formatRequest, wpAuth } from './middleware';

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
 * Removes a middleware from apiFetch
 *
 * @param {Function} middleware The middleware to remove
 */
apiFetch.disable = ( middleware ) => {
	const index = findIndex( middlewareRegistry, ( m ) => m === middleware );

	if ( index ) {
		middlewareRegistry.splice( index, 1 );
	}
};

/**
 * Export the default middlewares on the apiFetch object
 *
 * @type {Object}
 */
apiFetch.middleware = {
	defaultHeaders,
	formatURL,
	formatRequest,
	wpAuth,
};

/**
 * Apply the default middlewares
 */
forEach( apiFetch.middleware, apiFetch.use );

export default apiFetch;
