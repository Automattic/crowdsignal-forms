/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from 'react';

const withTimeout = ( timeout, promise ) => {
	let timeoutId;
	return new Promise( ( resolve, reject ) => {
		timeoutId = setTimeout(
			() => reject( new Error( 'request timeout' ) ),
			timeout
		);
		promise
			.then( resolve, reject )
			.finally( () => clearTimeout( timeoutId ) );
	} );
};

const defaultAnswer = { text: '' };

const API_REQUEST_TIMEOUT = 10000;

const toApi = ( { pollId, answers, note, question } ) => {
	const pollDto = {
		answers: map( answers, ( answer ) => {
			const answerWithDefaults = { ...defaultAnswer, ...answer };
			const answerDto = {
				answer_text: answerWithDefaults.text,
			};
			if ( answerWithDefaults.answerId ) {
				answerDto.id = answerWithDefaults.answerId;
			}
			return answerDto;
		} ),
		note,
		question,
	};

	if ( pollId ) {
		pollDto.id = pollId;
	}

	return pollDto;
};

const createPoll = ( data ) =>
	withTimeout(
		API_REQUEST_TIMEOUT,
		apiFetch( {
			path: '/crowdsignal-forms/v1/polls',
			method: 'POST',
			data,
		} )
	);

const getPoll = ( pollId ) =>
	withTimeout(
		API_REQUEST_TIMEOUT,
		apiFetch( {
			path: `/crowdsignal-forms/v1/polls/${ pollId }`,
			method: 'GET',
		} )
	);

const updatePoll = ( pollId, data ) =>
	withTimeout(
		API_REQUEST_TIMEOUT,
		apiFetch( {
			path: `/crowdsignal-forms/v1/polls/${ pollId }`,
			method: 'POST',
			data,
		} )
	);

const BLOCK_POLL_NOT_SET = {};

function shouldSetPollId( apiPoll, attrs ) {
	return apiPoll !== BLOCK_POLL_NOT_SET && ! attrs.pollId;
}

export const useCrowdsignalPoll = ( attributes, { onSyncComplete } ) => {
	const [ isFirst, setIsFirst ] = useState( true );
	const [ isSyncing, setIsSyncing ] = useState( false );
	const [ syncError, setSyncError ] = useState( null );
	const [ poll, setPoll ] = useState( BLOCK_POLL_NOT_SET );
	const [ outboundChanges, setOutboundChanges ] = useState( 0 );
	const [ inboundChanges, setInboundChanges ] = useState( 0 );

	const syncPollApiRequest = ( blockAttributes ) => {
		return ( blockAttributes.pollId
			? updatePoll( blockAttributes.pollId, toApi( blockAttributes ) )
			: createPoll( toApi( blockAttributes ) )
		).then( ( response ) => {
			setPoll( response );
			setInboundChanges( ( n ) => n + 1 );
		} );
	};

	const maybeSyncQueuedChanges = ( freshAttributes ) => {
		if ( shouldSetPollId( poll, freshAttributes ) ) {
			// We got a poll from the API, but we need to sync the attributes.
			onSyncComplete( poll, freshAttributes );
		}

		if ( isSyncing ) {
			return;
		}

		if ( inboundChanges > 0 ) {
			setInboundChanges( ( n ) => n - 1 );
			onSyncComplete( poll, freshAttributes );
		}

		if ( outboundChanges > 0 ) {
			setOutboundChanges( 0 );
			wrapRequest( () => syncPollApiRequest( freshAttributes ) );
		}
	};

	const wrapRequest = ( requestClosure ) => {
		if ( isSyncing ) {
			setOutboundChanges( ( n ) => n + 1 );
			return;
		}

		setIsSyncing( true );
		setSyncError( null );
		requestClosure()
			.catch( setSyncError )
			.finally( () => {
				setIsSyncing( false );
			} );
	};

	useEffect( () => {
		if ( isFirst ) {
			setIsFirst( false );
			wrapRequest( () => {
				return ( attributes.pollId
					? getPoll( attributes.pollId, toApi( attributes ) )
					: Promise.reject( 'poll not present' )
				).then( ( response ) => {
					setPoll( response );
				} );
			} );
		}
	}, [] );

	return {
		poll,
		syncError,
		isSyncing,
		outboundChanges,
		setOutboundChanges,
		maybeSyncQueuedChanges,
	};
};
