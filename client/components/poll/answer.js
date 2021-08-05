/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import { AnswerStyle } from 'blocks/poll/constants';

const PollAnswer = ( {
	answerIdFromApi,
	answerStyle,
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
		onSelect( parseInt( event.target.attributes.answerid.value, 10 ) );

	const handleFocus = ( event ) =>
		onFocus( parseInt( event.target.attributes.answerid.value, 10 ) );

	const handleButtonVote = ( event ) => {
		event.preventDefault();

		handleSelect( event );
	};

	const classes = classnames( 'crowdsignal-forms-poll__answer', {
		'is-multiple-choice': isMultipleChoice,
		'is-selected': isSelected,
		'is-focused': isFocused,
		'is-button': AnswerStyle.BUTTON === answerStyle,
	} );

	const answerElementId = `poll-answer-${ answerIdFromApi }`;

	const renderRadioAnswers = () => (
		<label className={ classes } htmlFor={ answerElementId } tabIndex="-1">
			<input
				className="crowdsignal-forms-poll__input"
				id={ answerElementId }
				name="answer"
				onChange={ handleSelect }
				selected={ isSelected }
				type={ isMultipleChoice ? 'checkbox' : 'radio' }
				answerid={ answerIdFromApi }
				disabled={ hasVoted || isVoting }
				tabIndex="0"
				aria-label={ text }
				onFocus={ handleFocus }
			/>

			<div className="crowdsignal-forms-poll__check" />

			<div className="crowdsignal-forms-poll__answer-label-wrapper">
				<div className="crowdsignal-forms-poll__answer-label">
					{ decodeEntities( text ) }
				</div>
			</div>
		</label>
	);

	const renderButtonAnswers = () => (
		<div className="wp-block-button crowdsignal-forms-poll__block-button">
			<input
				type="submit"
				className="wp-block-button__link crowdsignal-forms-poll__submit-button"
				value={ decodeEntities( text ) }
				answerid={ answerIdFromApi }
				onClick={ handleButtonVote }
			/>
		</div>
	);

	return (
		<div className={ classes }>
			{ AnswerStyle.RADIO === answerStyle && renderRadioAnswers() }
			{ AnswerStyle.BUTTON === answerStyle && renderButtonAnswers() }
		</div>
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
