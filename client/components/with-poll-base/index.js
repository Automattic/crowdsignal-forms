/**
 * External dependencies
 */
import React, { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	startSubscriptions,
	startPolling,
	withPollDataSelect,
	withPollDataDispatch,
} from 'blocks/poll/subscriptions';
import usePollDuplicateCleaner from 'components/use-poll-duplicate-cleaner';

startSubscriptions();

const isP2tenberg = () => 'p2tenberg' in window;

const withPollBase = ( Element ) => {
	return ( props ) => {
		const {
			attributes,
			setAttributes,
			addPollClientId,
			removePollClientId,
		} = props;

		useEffect( () => {
			if ( isP2tenberg() ) {
				startPolling();
			}

			if ( attributes.pollId ) {
				addPollClientId( attributes.pollId );
			}

			return () => {
				if ( attributes.pollId ) {
					removePollClientId( attributes.pollId );
				}
			};
		}, [] );

		usePollDuplicateCleaner(
			props.clientId,
			attributes.pollId,
			attributes.answers,
			setAttributes
		);

		return <Element { ...props } />;
	};
};

export default ( Element ) => {
	return compose( [
		withPollDataSelect(),
		withPollDataDispatch(),
		withPollBase,
	] )( Element );
};
