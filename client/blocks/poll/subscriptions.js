/**
 * WordPress dependencies
 */
import { subscribe, select, dispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

import { map, filter } from 'lodash';

const isPollBlock = ( block ) => block.name === 'crowdsignal-forms/poll';

let subsStarted = false;
let pollingStarted = false;

export const startPolling = () => {
	if ( pollingStarted ) {
		return;
	}
	pollingStarted = true;
	let lastInterval = null;
	const scheduleNextTick = () => {
		if ( null !== lastInterval ) {
			clearTimeout( lastInterval );
		}
		lastInterval = setTimeout( () => tick(), 1000 + Math.random() * 1000 );
	};
	const tick = () => {
		const {
			getPollClientIds,
			getPollDataByClientId,
			shouldTryFetchingPollData,
			isFetchingPollData,
		} = select( 'crowdsignal-forms/polls' );
		const pollsWithNoApiData = filter(
			getPollClientIds(),
			( clientId ) => null === getPollDataByClientId( clientId )
		);

		if ( pollsWithNoApiData.length < 1 ) {
			return scheduleNextTick();
		}

		const {
			setTryFetchPollData,
			setPollApiDataForClientId,
			setIsFetchingPollData,
		} = dispatch( 'crowdsignal-forms/polls' );

		if ( ! shouldTryFetchingPollData() ) {
			setTryFetchPollData( true );
		} else if ( ! isFetchingPollData() ) {
			setIsFetchingPollData( true );
			Promise.all(
				map( pollsWithNoApiData, ( clientId ) => {
					return apiFetch( {
						path: `/crowdsignal-forms/v1/polls/${ clientId }?cached=1`,
						method: 'GET',
					} ).then(
						( response ) =>
							setPollApiDataForClientId( clientId, {
								...response,
								viewResultsUrl: `https://app.crowdsignal.com/polls/${ response.id }/results`,
							} ),
						() => setPollApiDataForClientId( clientId, null )
					);
				} )
			).finally( () => setIsFetchingPollData( false ) );
		}
		return scheduleNextTick();
	};

	tick();
};

export const startSubscriptions = () => {
	if ( subsStarted ) {
		return;
	}

	subsStarted = true;

	const {
		isEditedPostDirty,
		isEditedPostNew,
		isSavingPost,
		isCleanNewPost,
		getCurrentPostId,
	} = select( 'core/editor' );
	const {
		setTryFetchPollData,
		setPollApiDataForClientId,
		setIsFetchingPollData,
	} = dispatch( 'crowdsignal-forms/polls' );
	const {
		shouldTryFetchingPollData,
		getPollDataByClientId,
		isFetchingPollData,
	} = select( 'crowdsignal-forms/polls' );

	subscribe( () => {
		const pollBlocks = filter(
			select( 'core/block-editor' ).getBlocks(),
			isPollBlock
		);
		if ( pollBlocks.length < 1 ) {
			return;
		}

		if ( isFetchingPollData() ) {
			return;
		}

		if (
			isCleanNewPost() ||
			isEditedPostNew() ||
			isSavingPost() ||
			isEditedPostDirty()
		) {
			return;
		}

		const postId = getCurrentPostId();

		if ( ! postId ) {
			return;
		}

		const pollsThatAreNotFetched = filter(
			pollBlocks,
			( { attributes } ) =>
				attributes.pollId &&
				null === getPollDataByClientId( attributes.pollId )
		);
		if ( pollsThatAreNotFetched.length < 1 ) {
			return;
		}

		if ( ! shouldTryFetchingPollData() ) {
			setTryFetchPollData( true );
		} else if ( ! isFetchingPollData() ) {
			setIsFetchingPollData( true );
			Promise.all(
				map( pollsThatAreNotFetched, ( pollBlock ) => {
					const { pollId } = pollBlock.attributes;
					return apiFetch( {
						path: `/crowdsignal-forms/v1/polls/${ pollId }?cached=1`,
						method: 'GET',
					} ).then(
						( response ) =>
							setPollApiDataForClientId( pollId, {
								...response,
								viewResultsUrl: `https://app.crowdsignal.com/polls/${ response.id }/results`,
							} ),
						() => setPollApiDataForClientId( pollId, null )
					);
				} )
			).finally( () => setIsFetchingPollData( false ) );
		}
	} );
};
