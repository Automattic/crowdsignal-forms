/**
 * External dependencies
 */
const { fetch } = window;

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

export const requestVoteNonce = async ( pollId ) => {
	const hash = '5430eeac3911395001d731d9702fc38b'; // hash not used when format=json is passed
	const timestamp = new Date().getTime();
	const respNonce = await fetch(
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

export const requestVote = async ( nonce, pollId, selectedAnswerIds ) => {
	const answerString = selectedAnswerIds.join( ',' );
	const respVote = await fetch(
		`https://polls.polldaddy.com/vote-js.php?p=${ pollId }&b=1&a=${ answerString }&o=&va=16&cookie=0&n=${ nonce }&url=${ encodeURI(
			window.location
		) }&format=json`
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
