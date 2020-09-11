/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/dedupe';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

/**
 * Internal dependencies
 */
import ThumbsUp from 'components/icon/thumbs-up';
import ThumbsDown from 'components/icon/thumbs-down';
import { formatVoteCount } from './util.js';

const VoteItem = ( {
	className,
	type,
	voteCount,
	apiAnswerId,
	onVote,
	disabled,
	isVotedOn,
} ) => {
	const [ currentVote, setCurrentVote ] = useState( 0 );

	const handleVote = () => {
		if ( disabled || ! onVote ) {
			return;
		}

		setCurrentVote( 1 );
		onVote( apiAnswerId );
	};

	const Icon = 'up' === type ? ThumbsUp : ThumbsDown;

	const classes = classNames(
		'wp-block-crowdsignal-forms-vote-item',
		className,
		{
			'is-voted-on': isVotedOn,
			'is-disabled': disabled,
		}
	);

	const displayedVoteCount = voteCount + currentVote;

	return (
		<div
			className={ classes }
			onClick={ handleVote }
			onKeyPress={ handleVote }
			role="button"
			tabIndex={ 0 }
		>
			<Icon className="wp-block-crowdsignal-forms-vote-item__icon" />
			<SwitchTransition mode="in-out">
				<CSSTransition
					key={ currentVote }
					classNames="wp-block-crowdsignal-forms-vote-item__count"
					timeout={ 300 }
				>
					<div className="wp-block-crowdsignal-forms-vote-item__count">
						{ formatVoteCount( displayedVoteCount ) }
					</div>
				</CSSTransition>
			</SwitchTransition>
		</div>
	);
};

VoteItem.propTypes = {
	apiAnswerId: PropTypes.number,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	isVotedOn: PropTypes.bool,
	onVote: PropTypes.func.isRequired,
	type: PropTypes.string.isRequired,
	voteCount: PropTypes.number.isRequired,
};

export default VoteItem;
