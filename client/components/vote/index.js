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
import { usePollResults, usePollVote } from 'data/hooks';
import { getVoteItemStyleVars } from 'blocks/vote/util';
import { __ } from 'lib/i18n';

const Vote = ( { attributes } ) => {
	const apiPollId = attributes.apiPollData.id;
	const [ votedOnId, setVotedOnId ] = useState( 0 );
	const { hasVoted, vote, storedCookieValue } = usePollVote(
		apiPollId,
		true,
		true
	);

	const { results } = usePollResults( apiPollId );

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
		attributes.className,
		`size-${ attributes.size }`
	);

	const answerClientIdToApiId = zipObject(
		map( attributes.apiPollData.answers, 'client_id' ),
		map( attributes.apiPollData.answers, 'id' )
	);

	const voteItemStyleVars = getVoteItemStyleVars( attributes );

	return (
		<div className={ classes } style={ voteItemStyleVars }>
			<div className="wp-block-crowdsignal-forms-vote__items">
				{ map( attributes.innerBlocks, ( voteAttributes ) => {
					const apiAnswerId =
						answerClientIdToApiId[ voteAttributes.answerId ];

					return (
						<VoteItem
							{ ...voteAttributes }
							key={ voteAttributes.answerId }
							apiAnswerId={ apiAnswerId }
							onVote={ handleVoteClick }
							disabled={ hasVoted || 0 !== votedOnId }
							isVotedOn={ apiAnswerId === votedOnId }
							voteCount={ results ? results[ apiAnswerId ] : 0 }
							hideCount={ attributes.hideResults }
						/>
					);
				} ) }
			</div>

			{ hasVoted && ! attributes.hideBranding && (
				<div className="wp-block-crowdsignal-forms-vote__branding">
					<a
						className="wp-block-crowdsignal-forms-vote__branding-link"
						href="https://crowdsignal.com"
						target="blank"
						rel="noopener noreferrer"
					>
						{ __( 'Powered by Crowdsignal' ) }
					</a>
				</div>
			) }
		</div>
	);
};

export default Vote;
