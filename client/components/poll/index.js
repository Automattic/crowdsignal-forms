/**
 * External dependencies
 */
import React, { useState } from 'react';
import seedrandom from 'seedrandom';

/**
 * Internal dependencies
 */
import {
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
} from 'blocks/poll/util';
import { ClosedPollState } from 'blocks/poll/constants';
import ClosedBanner from './closed-banner';
import PollResults from './results';
import PollVote from './vote';
import { maybeAddTemporaryAnswerIds, shuffleWithGenerator } from './util';

const Poll = ( { attributes } ) => {
	const [ randomAnswerSeed ] = useState( Math.random() );
	const handleSubmit = ( selectedAnswerIds ) => {
		// eslint-disable-next-line
		console.log( `Poll submitted with the following answers ${ JSON.stringify( selectedAnswerIds ) }` );
	};

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	if ( isClosed && ClosedPollState.HIDDEN === attributes.closedPollState ) {
		return null;
	}

	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;

	const classes = getBlockCssClasses(
		attributes,
		attributes.className,
		'wp-block-crowdsignal-forms-poll',
		{
			'is-closed': isClosed,
		}
	);

	const answers = shuffleWithGenerator(
		attributes.answers,
		attributes.randomizeAnswers
			? new seedrandom( randomAnswerSeed )
			: () => 1
	);

	return (
		<div className={ classes } style={ getStyleVars( attributes, {} ) }>
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
					/>
				) }

				{ showResults && (
					<PollResults
						answers={ maybeAddTemporaryAnswerIds( answers ) }
					/>
				) }
			</div>

			{ isClosed && <ClosedBanner /> }
		</div>
	);
};

export default Poll;
