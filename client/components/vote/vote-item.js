/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

/**
 * Internal dependencies
 */
import ThumbsUp from 'components/icon/thumbs-up';
import ThumbsDown from 'components/icon/thumbs-down';
import { formatVoteCount } from './util';
import { getVoteItemStyleVars, getBlockCssClasses } from 'blocks/vote/util';

const VoteItem = ( props ) => {
	const {
		attributes,
		voteCount,
		apiAnswerId,
		onVote,
		disabled,
		isVotedOn,
		hideCount,
		fallbackStyles,
		isInEditor,
	} = props;
	const { className, type } = attributes;

	const [ currentVote, setCurrentVote ] = useState( 0 );

	const handleVote = () => {
		if ( disabled || ! onVote ) {
			return;
		}

		setCurrentVote( 1 );
		onVote( apiAnswerId );
	};

	const Icon = 'up' === type ? ThumbsUp : ThumbsDown;
	const typeClass = `is-type-${ type }`;
	const classes = getBlockCssClasses(
		attributes,
		'crowdsignal-forms-vote-item',
		className,
		{
			'is-voted-on': isVotedOn,
			'is-disabled': disabled,
			'is-in-editor': isInEditor,
		},
		typeClass
	);
	const blockStyle = getVoteItemStyleVars( attributes, fallbackStyles );

	const displayedVoteCount = voteCount + currentVote;

	return (
		<div
			className={ classes }
			onClick={ handleVote }
			onKeyPress={ handleVote }
			role="button"
			style={ blockStyle }
			tabIndex={ 0 }
		>
			<Icon
				className="crowdsignal-forms-vote-item__icon"
				fillColor="currentColor"
			/>

			{ ! hideCount && (
				<SwitchTransition mode="in-out">
					<CSSTransition
						key={ currentVote }
						classNames="crowdsignal-forms-vote-item__count"
						timeout={ 300 }
					>
						<div className="crowdsignal-forms-vote-item__count">
							{ formatVoteCount( displayedVoteCount ) }
						</div>
					</CSSTransition>
				</SwitchTransition>
			) }
		</div>
	);
};

VoteItem.propTypes = {
	apiAnswerId: PropTypes.number,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	isVotedOn: PropTypes.bool,
	onVote: PropTypes.func,
	type: PropTypes.string.isRequired,
	voteCount: PropTypes.number.isRequired,
};

export default VoteItem;
