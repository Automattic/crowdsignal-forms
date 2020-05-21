/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getStyleVars, getBlockCssClasses } from 'blocks/poll/util';
import PollVote from './vote';
import { maybeAddTemporaryAnswerIds } from './util';

const Poll = ( { attributes } ) => {
	const handleSubmit = ( selectedAnswerIds ) => {
		// eslint-disable-next-line
		console.log( `Poll submitted with the following answers ${ JSON.stringify( selectedAnswerIds ) }` );
	};

	const classes = getBlockCssClasses(
		attributes,
		attributes.className,
		'wp-block-crowdsignal-forms-poll'
	);

	return (
		<div className={ classes } style={ getStyleVars( attributes, {} ) }>
			<h3 className="wp-block-crowdsignal-forms-poll__question">
				{ attributes.question }
			</h3>

			{ attributes.note && (
				<p className="wp-block-crowdsignal-forms-poll__note">
					{ attributes.note }
				</p>
			) }

			<PollVote
				answers={ maybeAddTemporaryAnswerIds( attributes.answers ) }
				isMultipleChoice={ attributes.isMultipleChoice }
				onSubmit={ handleSubmit }
				submitButtonLabel={ attributes.submitButtonLabel }
			/>
		</div>
	);
};

export default Poll;
