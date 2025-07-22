/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import { withRequestTimeout } from 'data/util';

export const updateNps = ( data ) => {
	const apiData = { ...data };

	// Add post_id to the request data if postId is provided
	if ( data.postId ) {
		apiData.post_id = data.postId;
		// Remove the postId from the data since it's not needed in the API payload
		delete apiData.postId;
	}

	return withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/nps/${ data.surveyId || '' }`,
				'/'
			),
			method: 'POST',
			data: apiData,
		} )
	);
};
