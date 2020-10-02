/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import { isPollClosed } from 'blocks/poll/util';
import { usePollVote, usePollResults } from 'data/hooks';
import { formatVoteCount } from 'components/vote/util';
import BrandLink from 'components/brand-link';

const Applause = ( { attributes } ) => {
	const apiPollId = attributes.apiPollData ? attributes.apiPollData.id : null;
	const { hasVoted, vote } = usePollVote( apiPollId );
	const [ currentVote, setCurrentVote ] = useState( 0 );
	const [ queuedVotes, setQueuedVotes ] = useState( 0 );
	const [ timeoutHandle, setTimeoutHandle ] = useState( null );
	const { results } = usePollResults( apiPollId );

	const handleVote = () => {
		if ( null !== apiPollId ) {
			const newQueuedVoteCount = queuedVotes + 1;
			setQueuedVotes( newQueuedVoteCount );
			setCurrentVote( currentVote + 1 );

			const answerId = attributes.apiPollData.answers[ 0 ].id;

			if ( null !== timeoutHandle ) {
				clearTimeout( timeoutHandle );
				// eslint-disable-next-line no-console
				console.log( 'clearing existing handle' );
			}

			const handle = setTimeout( () => {
				// eslint-disable-next-line no-console
				console.log(
					`sending vote request for ${ newQueuedVoteCount } votes`
				);
				vote( [ answerId ], newQueuedVoteCount );
				setTimeoutHandle( null );
				setQueuedVotes( 0 );
			}, 1000 );

			setTimeoutHandle( handle );
		}
	};

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	const classes = classNames(
		'crowdsignal-forms-applause',
		attributes.className,
		`size-${ attributes.size }`,
		{
			'is-closed': isClosed,
		}
	);

	const apiVoteCount = null !== results ? values( results )[ 0 ] : 0;
	const displayedVoteCount = apiVoteCount + currentVote;

	return (
		<>
			<div
				className={ classes }
				onClick={ handleVote }
				onKeyPress={ handleVote }
				role="button"
				tabIndex={ 0 }
			>
				<ApplauseIcon className="crowdsignal-forms-applause__icon" />
				<span className="crowdsignal-forms-applause__count">
					{ formatVoteCount( displayedVoteCount ) } Claps
				</span>
			</div>
			<BrandLink showBranding={ hasVoted && ! attributes.hideBranding } />
		</>
	);
};

Applause.propTypes = {
	className: PropTypes.string,
};

export default Applause;
