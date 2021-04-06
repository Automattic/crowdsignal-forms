/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import { withRequestTimeout } from 'data/util';

export const updateFeedback = ( data ) =>
	withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/feedback/${ data.surveyId || '' }`,
				'/'
			),
			method: 'POST',
			data,
		} )
	);
