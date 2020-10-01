/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

/**
 * Fetch the poll results for the given pollId
 *
 * @param  {number}  pollId Poll ID.
 * @param  {boolean} doFetch Whether or not to actually perform the request.
 * @return {Promise}        Promise that resolves to a key-value object with answer IDs and vote counts.
 */
export const requestResults = async ( pollId, doFetch = true ) => {
	const baseUrl = 'https://api.crowdsignal.com/v3/polls';

	if ( ! doFetch ) {
		return null;
	}

	return window
		.fetch( `${ baseUrl }/${ pollId }/results`, {
			method: 'GET',
			headers: { 'content-type': 'application/json' },
		} )
		.then( ( response ) => {
			if ( response.status >= 200 && response.status < 300 ) {
				return response.json();
			}

			throw response;
		} )
		.then( ( response ) => {
			if ( 404 === response.status ) {
				// poll doesn't exist on the platform yet, return an empty result
				return {};
			} else if ( response.error ) {
				throw new Error( response.message );
			}

			return response.results.votes_by_answer;
		} );
};

export const requestVoteNonce = async ( pollId ) => {
	const hash = '5430eeac3911395001d731d9702fc38b'; // hash not used when format=json is passed
	const timestamp = new Date().getTime();
	const respNonce = await window.fetch(
		`https://polldaddy.com/n/${ hash }/${ pollId }?${ timestamp }&format=json`
	);
	if ( ! respNonce.ok ) {
		throw new CrowdsignalFormsServerError();
	}

	const jsonNonce = await respNonce.json();

	if ( ! jsonNonce.nonce ) {
		throw new CrowdsignalFormsServerError();
	}

	return jsonNonce.nonce;
};

export const requestVote = async (
	nonce,
	pollId,
	selectedAnswerIds,
	voteCount
) => {
	const answerString = selectedAnswerIds.join( ',' );
	const respVote = await window.fetch(
		`https://polls.polldaddy.com/vote-js.php?format=json&p=${ pollId }&b=1&a=${ answerString }&o=&va=16&cookie=0&n=${ nonce }&url=${ encodeURIComponent(
			window.location
		) }&vcTEMP=${ voteCount }`
	);

	if ( ! respVote.ok ) {
		throw new CrowdsignalFormsServerError();
	}

	const jsonVote = await respVote.json();
	if ( 'error' === jsonVote.status ) {
		throw new CrowdsignalFormsError( jsonVote.error );
	}
};

export class CrowdsignalFormsError extends Error {}
export class CrowdsignalFormsServerError extends CrowdsignalFormsError {
	constructor() {
		super( __( 'Server error. Please try again.' ) );
	}
}

/**
 * Returns the connected state of the current user's account.
 *
 * @return {string} Enum value of the account's state.
 */
export const requestIsCsConnected = async () => {
	return await apiFetch( {
		path: `/crowdsignal-forms/v1/account/connected`,
		method: 'GET',
	} );
};
