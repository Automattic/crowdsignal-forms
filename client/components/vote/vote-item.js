/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames/dedupe';
import ThumbsUp from 'components/icon/thumbs-up';
import ThumbsDown from 'components/icon/thumbs-down';

const VoteItem = ( { className, type, voteCount } ) => {
	const classes = classNames(
		'wp-block-crowdsignal-forms-vote-item',
		className
	);

	return (
		<div className={ classes }>
			{ 'up' === type ? (
				<ThumbsUp className="wp-block-crowdsignal-forms-vote-item__icon" />
			) : (
				<ThumbsDown className="wp-block-crowdsignal-forms-vote-item__icon" />
			) }
			<div className="wp-block-crowdsignal-forms-vote-item__count">
				{ voteCount ?? 0 }
			</div>
		</div>
	);
};

export default VoteItem;
