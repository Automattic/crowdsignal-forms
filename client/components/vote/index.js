/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { map, zipObject } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import VoteItem from 'components/vote/vote-item';
import { usePollVote } from 'data/hooks';

const Vote = ( { attributes } ) => {
	const apiPollId = attributes.apiPollData.id;
	const [ votedOnId, setVotedOnId ] = useState( 0 );
	const { hasVoted, vote, storedCookieValue } = usePollVote(
		apiPollId,
		true,
		true
	);

	useEffect( () => {
		if ( '' !== storedCookieValue ) {
			setVotedOnId( parseInt( storedCookieValue.split( ',' )[ 0 ], 10 ) );
		}
	}, [ storedCookieValue ] );

	const handleVoteClick = async ( answerId ) => {
		setVotedOnId( answerId );
		await vote( [ answerId ] );
	};

	const classes = classNames(
		'wp-block-crowdsignal-forms-vote',
		attributes.className
	);

	const answerClientIdToApiId = zipObject(
		map( attributes.apiPollData.answers, 'client_id' ),
		map( attributes.apiPollData.answers, 'id' )
	);

	return (
		<div className={ classes }>
			{ map( attributes.innerBlocks, ( voteAttributes ) => (
				<VoteItem
					{ ...voteAttributes }
					key={ voteAttributes.answerId }
					apiAnswerId={
						answerClientIdToApiId[ voteAttributes.answerId ]
					}
					onVote={ handleVoteClick }
					disabled={ hasVoted || 0 !== votedOnId }
					isVotedOn={
						answerClientIdToApiId[ voteAttributes.answerId ] ===
						votedOnId
					}
				/>
			) ) }
		</div>
	);
};

export default Vote;
