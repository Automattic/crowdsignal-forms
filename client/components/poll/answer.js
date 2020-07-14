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
	isFocused,
	onSelect,
	onFocus,
	text,
} ) => {
	const handleSelect = ( event ) =>
		onSelect( parseInt( event.target.value, 10 ) );

	const handleFocus = ( event ) =>
		onFocus( parseInt( event.target.value, 10 ) );

	const classes = classnames( 'wp-block-crowdsignal-forms-poll__answer', {
		'is-multiple-choice': isMultipleChoice,
		'is-selected': isSelected,
		'is-focused': isFocused,
	} );

	const answerElementId = `poll-answer-${ answerIdFromApi }`;

	return (
		<label className={ classes } htmlFor={ answerElementId } tabIndex="-1">
			<input
				className="wp-block-crowdsignal-forms-poll__input"
				id={ answerElementId }
				name="answer"
				onChange={ handleSelect }
				selected={ isSelected }
				type={ isMultipleChoice ? 'checkbox' : 'radio' }
				value={ answerIdFromApi }
				disabled={ hasVoted || isVoting }
				tabIndex="0"
				ariaLabel={ text }
				onFocus={ handleFocus }
			/>

			<span className="wp-block-crowdsignal-forms-poll__check" />

			<span className="wp-block-crowdsignal-forms-poll__answer-label">
				{ text }
			</span>
		</label>
	);
};

PollAnswer.propTypes = {
	answerIdFromApi: PropTypes.number.isRequired,
	hasVoted: PropTypes.bool,
	isMultipleChoice: PropTypes.bool,
	isSelected: PropTypes.bool,
	isVoting: PropTypes.bool,
	onSelect: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
};

export default PollAnswer;
