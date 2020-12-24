/**
 * External dependencies
 */
// import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
// import { useEffect, useState } from 'react';
// import { useEntityId } from '@wordpress/core-data';

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

// const defaultAnswer = { text: '' };

const API_REQUEST_TIMEOUT = 10000;

// const toApi = ( { pollId, answers, note, question, ...settings }, postId ) => {
// 	const timestamp = Date.parse( settings.closedAfterDateTime ) || Date.now();
// 	const pollDto = {
// 		answers: map( answers, ( answer ) => {
// 			const answerWithDefaults = { ...defaultAnswer, ...answer };
// 			const answerDto = {
// 				answer_text: answerWithDefaults.text,
// 			};
// 			if ( answerWithDefaults.answerId ) {
// 				answerDto.id = answerWithDefaults.answerId;
// 			}
// 			return answerDto;
// 		} ),
// 		note,
// 		question,
// 		settings: {
// 			title: settings.title,
// 			after_vote: settings.confirmMessageType,
// 			after_message: '', // not among the poll properties yet
// 			redirect_url: '', // not among the poll properties yet
// 			randomize_answers: settings.randomizeAnswers,
// 			restrict_vote_repeat: settings.hasOneResponsePerComputer,
// 			captcha: false, // v2
// 			multiple_choice: settings.isMultipleChoice,
// 			close_status: settings.pollStatus,
// 			close_after: parseInt( timestamp / 1000, 10 ),
// 		},
// 	};
//
// 	if ( pollId ) {
// 		pollDto.id = pollId;
// 	}
//
// 	if ( postId ) {
// 		pollDto.post_id = postId;
// 	}
//
// 	return pollDto;
// };
//
// const createPoll = ( data ) =>
// 	withTimeout(
// 		API_REQUEST_TIMEOUT,
// 		apiFetch( {
// 			path: '/crowdsignal-forms/v1/polls',
// 			method: 'POST',
// 			data,
// 		} )
// 	);
//
// const getPoll = ( pollId ) =>
// 	withTimeout(
// 		API_REQUEST_TIMEOUT,
// 		apiFetch( {
// 			path: `/crowdsignal-forms/v1/polls/${ pollId }`,
// 			method: 'GET',
// 		} )
// 	);
//
// const updatePoll = ( pollId, data ) =>
// 	withTimeout(
// 		API_REQUEST_TIMEOUT,
// 		apiFetch( {
// 			path: `/crowdsignal-forms/v1/polls/${ pollId }`,
// 			method: 'POST',
// 			data,
// 		} )
// 	);

export const archivePoll = ( pollId ) =>
	withTimeout(
		API_REQUEST_TIMEOUT,
		apiFetch( {
			path: `/crowdsignal-forms/v1/polls/${ pollId }/archive`,
			method: 'POST',
		} )
	);

// const BLOCK_POLL_NOT_SET = {};

// function shouldSetPollId( apiPoll, attrs ) {
// 	return apiPoll !== BLOCK_POLL_NOT_SET && ! attrs.pollId;
// }

// export const useCrowdsignalPoll = ( attributes, { onSyncComplete } ) => {
// 	const [ isFirst, setIsFirst ] = useState( true );
// 	const [ isSyncing, setIsSyncing ] = useState( false );
// 	const [ syncError, setSyncError ] = useState( null );
// 	const [ poll, setPoll ] = useState( BLOCK_POLL_NOT_SET );
// 	const [ outboundChanges, setOutboundChanges ] = useState( 0 );
// 	const [ inboundChanges, setInboundChanges ] = useState( 0 );
// 	const postId = useEntityId( 'postType', 'post' );
//
// 	const syncPollApiRequest = ( blockAttributes ) => {
// 		return ( blockAttributes.pollId
// 			? updatePoll(
// 					blockAttributes.pollId,
// 					toApi( blockAttributes, postId )
// 			  )
// 			: createPoll( toApi( blockAttributes, postId ) )
// 		).then( ( response ) => {
// 			setPoll( response );
// 			setInboundChanges( ( n ) => n + 1 );
// 		} );
// 	};
//
// 	const maybeSyncQueuedChanges = ( freshAttributes ) => {
// 		if ( shouldSetPollId( poll, freshAttributes ) ) {
// 			// We got a poll from the API, but we need to sync the attributes.
// 			onSyncComplete( poll, freshAttributes );
// 		}
//
// 		if ( isSyncing ) {
// 			return;
// 		}
//
// 		if ( inboundChanges > 0 ) {
// 			setInboundChanges( 0 );
// 			onSyncComplete( poll, freshAttributes );
// 		}
// 	};
//
// 	const wrapRequest = ( requestClosure ) => {
// 		if ( isSyncing ) {
// 			setOutboundChanges( ( n ) => n + 1 );
// 			return;
// 		}
//
// 		setIsSyncing( true );
// 		setSyncError( null );
// 		requestClosure()
// 			.catch( setSyncError )
// 			.finally( () => {
// 				setIsSyncing( false );
// 			} );
// 	};
//
// 	useEffect( () => {
// 		if ( isFirst ) {
// 			setIsFirst( false );
// 			wrapRequest( () => {
// 				return ( attributes.pollId
// 					? getPoll( attributes.pollId, toApi( attributes ) )
// 					: Promise.reject( 'poll not present' )
// 				).then( ( response ) => {
// 					setPoll( response );
// 				} );
// 			} );
// 		}
// 	}, [] );
//
// 	useEffect( () => {
// 		if ( outboundChanges === 0 ) {
// 			return () => {
// 				// do nothing in this case, no api req needed.
// 			};
// 		}
//
// 		const timeoutId = setTimeout( () => {
// 			setOutboundChanges( 0 );
// 			wrapRequest( () => syncPollApiRequest( attributes, postId ) );
// 		}, 1500 );
//
// 		return () => timeoutId && clearTimeout( timeoutId );
// 	}, [ outboundChanges ] );
//
// 	return {
// 		poll,
// 		syncError,
// 		isSyncing,
// 		outboundChanges,
// 		setOutboundChanges,
// 		maybeSyncQueuedChanges,
// 	};
// };
