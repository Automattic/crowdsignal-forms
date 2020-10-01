/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import { isPollClosed } from 'blocks/poll/util';
import { usePollVote } from 'data/hooks';
import { formatVoteCount } from 'components/vote/util';

const Applause = ( { attributes } ) => {
	const apiPollId = attributes.apiPollData ? attributes.apiPollData.id : null;
	const { vote } = usePollVote( apiPollId );
	const [ currentVote, setCurrentVote ] = useState( 0 );
	const [ queuedVotes, setQueuedVotes ] = useState( 0 );
	const [ timeoutHandle, setTimeoutHandle ] = useState( null );

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

	const displayedVoteCount = currentVote;

	return (
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
	);
};

Applause.propTypes = {
	className: PropTypes.string,
};

export default Applause;
