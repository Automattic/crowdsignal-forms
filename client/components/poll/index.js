/**
 * External dependencies
 */
import React from 'react';

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
import PollVote from './vote';
import { maybeAddTemporaryAnswerIds } from './util';

const Poll = ( { attributes } ) => {
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

	return (
		<div className={ classes } style={ getStyleVars( attributes, {} ) }>
			{ ! showResults && (
				<>
					<div className="wp-block-crowdsignal-forms-poll__content">
						<h3 className="wp-block-crowdsignal-forms-poll__question">
							{ attributes.question }
						</h3>

						{ attributes.note && (
							<p className="wp-block-crowdsignal-forms-poll__note">
								{ attributes.note }
							</p>
						) }

						<PollVote
							answers={ maybeAddTemporaryAnswerIds(
								attributes.answers
							) }
							isMultipleChoice={ attributes.isMultipleChoice }
							onSubmit={ handleSubmit }
							submitButtonLabel={ attributes.submitButtonLabel }
						/>
					</div>
					{ isClosed && <ClosedBanner /> }
				</>
			) }
			{ showResults && (
				<div>
					TODO: Show Results
					<br />
					c/RTITc5kn-tr
				</div>
			) }
		</div>
	);
};

export default Poll;
