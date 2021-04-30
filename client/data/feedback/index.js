/**
 * External dependencies
 */
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import apiFetch from '@crowdsignalForms/apifetch';
import { withRequestTimeout } from 'data/util';

export const updateFeedbackResponse = ( surveyId, data ) =>
	withRequestTimeout(
		apiFetch( {
			path: trimEnd(
				`/crowdsignal-forms/v1/feedback/${ surveyId || '' }/response`
			),
			method: 'POST',
			data,
		} )
	);
