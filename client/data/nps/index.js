/**
 * External dependencies
 */
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import apiFetch from '@crowdsignalForms/apifetch';
import { withRequestTimeout } from 'data/util';

export const updateNpsResponse = ( surveyId, data ) =>
	withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/nps/${ surveyId || '' }/response`
			),
			method: 'POST',
			data,
		} )
	);
