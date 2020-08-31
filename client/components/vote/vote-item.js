/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/dedupe';

/**
 * Internal dependencies
 */
import ThumbsUp from 'components/icon/thumbs-up';
import ThumbsDown from 'components/icon/thumbs-down';

const VoteItem = ( {
	className,
	type,
	voteCount,
	apiAnswerId,
	onVote,
	disabled,
	isVotedOn,
} ) => {
	const [ actualVoteCount, setActualVoteCount ] = useState( 0 );
	useEffect( () => {
		if ( voteCount ) {
			setActualVoteCount( voteCount );
		}
	}, [ voteCount ] );

	const classes = classNames(
		'wp-block-crowdsignal-forms-vote-item',
		className,
		{
			'is-voted-on': isVotedOn,
			'is-disabled': disabled,
		}
	);

	const handleVote = () => {
		if ( ! disabled && onVote ) {
			setActualVoteCount( actualVoteCount + 1 );
			onVote( apiAnswerId );
		}
	};

	return (
		<div
			className={ classes }
			onClick={ handleVote }
			onKeyPress={ handleVote }
			role="button"
			tabIndex={ 0 }
		>
			{ 'up' === type ? (
				<ThumbsUp className="wp-block-crowdsignal-forms-vote-item__icon" />
			) : (
				<ThumbsDown className="wp-block-crowdsignal-forms-vote-item__icon" />
			) }
			<div className="wp-block-crowdsignal-forms-vote-item__count">
				{ actualVoteCount ?? 0 }
			</div>
		</div>
	);
};

export default VoteItem;
