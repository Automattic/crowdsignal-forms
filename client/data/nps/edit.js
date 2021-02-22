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
