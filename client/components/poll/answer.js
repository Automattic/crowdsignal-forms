/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const PollAnswer = ( {
	answerIdFromApi,
	hasVoted,
	isMultipleChoice,
	isSelected,
	isVoting,
	onSelect,
	text,
} ) => {
	const handleSelect = ( event ) =>
		onSelect( parseInt( event.target.value, 10 ) );

	const classes = classnames( 'wp-block-crowdsignal-forms-poll__answer', {
		'is-multiple-choice': isMultipleChoice,
		'is-selected': isSelected,
	} );

	const answerElementId = `poll-answer-${ answerIdFromApi }`;

	return (
		<label className={ classes } htmlFor={ answerElementId }>
			<input
				className="wp-block-crowdsignal-forms-poll__input"
				id={ answerElementId }
				name="answer"
				onChange={ handleSelect }
				selected={ isSelected }
				type={ isMultipleChoice ? 'checkbox' : 'radio' }
				value={ answerIdFromApi }
				disabled={ hasVoted || isVoting }
			/>

			<span className="wp-block-crowdsignal-forms-poll__check" />

			<span className="wp-block-crowdsignal-forms-poll__answer-label">
				{ text }
			</span>
		</label>
	);
};

PollAnswer.propTypes = {
	answerId: PropTypes.number.isRequired,
	isMultipleChoice: PropTypes.bool,
	isSelected: PropTypes.bool,
	onSelect: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
};

export default PollAnswer;
