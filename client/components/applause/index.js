/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { isPollClosed } from 'blocks/poll/util';
import { getApplauseStyleVars, getBlockCssClasses } from 'blocks/applause/util';
import { ApplauseStyles, getApplauseStyles } from './styles';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { usePollVote, usePollResults } from 'data/hooks';
import { formatVoteCount } from 'components/vote/util';
import BrandLink from 'components/brand-link';
import ApplauseAnimation from './animation';

const Applause = ( props ) => {
	const { attributes, fallbackStyles, renderStyleProbe } = props;
	const apiPollId = attributes.apiPollData ? attributes.apiPollData.id : null;
	const { hasVoted, vote } = usePollVote( apiPollId, true );
	const [ currentVote, setCurrentVote ] = useState( 0 );
	const [ queuedVotes, setQueuedVotes ] = useState( 0 );
	const [ timeoutHandle, setTimeoutHandle ] = useState( null );
	const [ animationActiveState, setAnimationActiveState ] = useState( false );
	const [ animationTimeoutHandle, setAnimationTimeoutHandle ] = useState(
		null
	);
	const { results } = usePollResults( apiPollId );

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	const handleVote = () => {
		if ( apiPollId === null || isClosed ) {
			return;
		}

		if ( animationTimeoutHandle ) {
			clearTimeout( animationTimeoutHandle );
		}

		setAnimationActiveState( true );
		setAnimationTimeoutHandle(
			setTimeout( () => {
				setAnimationActiveState( false );
			}, 200 )
		);

		const newQueuedVoteCount = queuedVotes + 1;
		setQueuedVotes( newQueuedVoteCount );
		setCurrentVote( currentVote + 1 );

		const answerId = attributes.apiPollData.answers[ 0 ].id;

		if ( null !== timeoutHandle ) {
			clearTimeout( timeoutHandle );
		}

		const handle = setTimeout( () => {
			vote( [ answerId ], newQueuedVoteCount );
			setTimeoutHandle( null );
			setQueuedVotes( 0 );
		}, 1000 );

		setTimeoutHandle( handle );
	};

	const classes = getBlockCssClasses(
		attributes,
		'crowdsignal-forms-applause',
		attributes.className,
		`size-${ attributes.size }`,
		{
			'is-closed': isClosed,
		}
	);

	const styleVars = getApplauseStyleVars( attributes, fallbackStyles );
	const apiVoteCount = null !== results ? values( results )[ 0 ] : 0;
	const displayedVoteCount = apiVoteCount + currentVote;

	return (
		<>
			<div
				className={ classes }
				style={ styleVars }
				onClick={ handleVote }
				onKeyPress={ handleVote }
				role="button"
				tabIndex={ 0 }
			>
				<ApplauseAnimation active={ animationActiveState } />
				<p className="crowdsignal-forms-applause__count">
					{ formatVoteCount( displayedVoteCount ) } Claps
				</p>
				{ renderStyleProbe() }
			</div>
			<BrandLink
				showBranding={ hasVoted && ! attributes.hideBranding }
				referralCode="cs-forms-applause"
			/>
		</>
	);
};

Applause.propTypes = {
	className: PropTypes.string,
};

export default withFallbackStyles(
	ApplauseStyles,
	getApplauseStyles
)( Applause );
