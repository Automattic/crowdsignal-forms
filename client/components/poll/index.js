/**
 * External dependencies
 */
import React, { useState } from 'react';
import seedrandom from 'seedrandom';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
} from 'blocks/poll/util';
import { ClosedPollState, ConfirmMessageType } from 'blocks/poll/constants';
import { withFallbackColors } from 'components/with-fallback-colors';
import ClosedBanner from './closed-banner';
import PollResults from './results';
import PollVote from './vote';
import { PollColors, getPollColors } from './colors';
import { maybeAddTemporaryAnswerIds, shuffleWithGenerator } from './util';
import { __ } from 'lib/i18n';
import { usePollVote } from 'data/hooks';
import { CrowdsignalFormsError } from 'data/poll';
import ErrorBanner from './error-banner';
import SubmitMessage from './submit-message';

const Poll = ( { attributes, fallbackColors, renderColorProbe } ) => {
	const [ randomAnswerSeed ] = useState( Math.random() );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ dismissSubmitMessage, setDismissSubmitMessage ] = useState( false );

	const { hasVoted, isVoting, vote } = usePollVote(
		attributes.pollId,
		attributes.hasOneResponsePerComputer
	);

	const handleSubmit = async ( selectedAnswerIds ) => {
		try {
			setErrorMessage( '' );
			setDismissSubmitMessage( false );

			await vote( selectedAnswerIds );

			if (
				ConfirmMessageType.REDIRECT === attributes.confirmMessageType
			) {
				window.open( attributes.redirectAddress );
			}
		} catch ( ex ) {
			if ( ex instanceof CrowdsignalFormsError ) {
				setErrorMessage( ex.message );
			} else {
				setErrorMessage( __( 'Server error. Please try again.' ) );
			}
		}
	};

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	if ( isClosed && ClosedPollState.HIDDEN === attributes.closedPollState ) {
		return null;
	}

	const showResults =
		( isClosed &&
			ClosedPollState.SHOW_RESULTS === attributes.closedPollState ) ||
		( hasVoted &&
			ConfirmMessageType.RESULTS === attributes.confirmMessageType );

	const showSubmitMessage =
		hasVoted &&
		! showResults &&
		! dismissSubmitMessage &&
		ConfirmMessageType.REDIRECT !== attributes.confirmMessageType;

	const classes = getBlockCssClasses(
		attributes,
		attributes.className,
		'wp-block-crowdsignal-forms-poll',
		{
			'has-voted': hasVoted,
			'is-closed': isClosed,
			'is-voting': isVoting,
		}
	);

	const answers = shuffleWithGenerator(
		filter( attributes.answers, ( answer ) => !! answer.text ),
		attributes.randomizeAnswers
			? new seedrandom( randomAnswerSeed )
			: () => 1
	);

	return (
		<div
			className={ classes }
			style={ getStyleVars( attributes, fallbackColors ) }
		>
			{ errorMessage && <ErrorBanner>{ errorMessage }</ErrorBanner> }

			<div className="wp-block-crowdsignal-forms-poll__content">
				<h3 className="wp-block-crowdsignal-forms-poll__question">
					{ attributes.question }
				</h3>

				{ attributes.note && (
					<p className="wp-block-crowdsignal-forms-poll__note">
						{ attributes.note }
					</p>
				) }

				{ ! showResults && (
					<PollVote
						answers={ maybeAddTemporaryAnswerIds( answers ) }
						isMultipleChoice={ attributes.isMultipleChoice }
						onSubmit={ handleSubmit }
						submitButtonLabel={ attributes.submitButtonLabel }
						hasVoted={ hasVoted }
						isVoting={ isVoting }
					/>
				) }

				{ showResults && (
					<PollResults
						pollId={ attributes.pollId }
						answers={ maybeAddTemporaryAnswerIds( answers ) }
						setErrorMessage={ setErrorMessage }
					/>
				) }
			</div>
			{ showSubmitMessage && (
				<SubmitMessage
					{ ...attributes }
					setDismissSubmitMessage={ setDismissSubmitMessage }
				/>
			) }
			{ ( isClosed || hasVoted ) && (
				<ClosedBanner isPollClosed={ isClosed } hasVoted={ hasVoted } />
			) }

			{ renderColorProbe() }
		</div>
	);
};

export default withFallbackColors( PollColors, getPollColors )( Poll );
