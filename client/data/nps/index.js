/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import { withRequestTimeout } from 'data/util';

export const updateNps = ( data ) =>
	withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/nps/${ data.surveyId || '' }`,
				'/'
			),
			method: 'POST',
			data,
		} )
	);

export const updateNpsResponse = ( surveyId, data ) => {
	if ( window.csFormsSetup && window.csFormsSetup._isWpcom ) {
		return window
			.fetch(
				'https://public-api.wordpress.com/crowdsignal-forms/v1/sites/' +
					window.csFormsSetup._currentSiteId +
					'/nps/' +
					surveyId +
					'/nonce',
				{
					headers: {
						accept: 'application/json, */*;q=0.1',
						'content-type': 'application/json',
						'x-wp-nonce': window.csFormsSetup._nonce,
					},
					mode: 'cors',
					credentials: window.csFormsSetup._isLoggedIn
						? 'include'
						: 'omit',
				}
			)
			.then( ( res ) => res.json() )
			.then( ( nonceResult ) => {
				data.nonce = nonceResult.nonce;
				return window
					.fetch(
						'https://public-api.wordpress.com/crowdsignal-forms/v1/sites/' +
							window.csFormsSetup._currentSiteId +
							'/nps/' +
							surveyId +
							'/response?_locale=user',
						{
							headers: {
								accept: 'application/json, */*;q=0.1',
								'content-type': 'application/json',
								'x-wp-nonce': window.csFormsSetup._nonce,
							},
							// referrer: window.csFormsSetup._siteUrl,
							// referrerPolicy: 'strict-origin-when-cross-origin',
							body: JSON.stringify( data ),
							method: 'POST',
							mode: 'cors',
							credentials: window.csFormsSetup._isLoggedIn
								? 'include'
								: 'omit',
						}
					)
					.then( ( response ) => response.json() );
			} );
	}
	return withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/nps/${ surveyId || '' }/response`
			),
			method: 'POST',
			data,
		} )
	);
};
