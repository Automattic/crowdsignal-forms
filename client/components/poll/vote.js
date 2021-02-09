/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { includes, map, without } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { AnswerStyle, ButtonAlignment } from 'blocks/poll/constants';
import PollAnswer from './answer';
import FooterBranding from 'components/footer-branding';

const PollVote = ( {
	answers,
	answerStyle,
	buttonAlignment,
	hasVoted,
	isMultipleChoice,
	isVoting,
	onSubmit,
	submitButtonLabel,
	hideBranding,
} ) => {
	const [ selected, setSelected ] = useState( [] );

	const handleSelect = ( answerId ) => {
		if ( AnswerStyle.BUTTON === answerStyle ) {
			setSelected( [ answerId ] );
			return onSubmit( [ answerId ] );
		}

		if ( ! isMultipleChoice ) {
			return setSelected( [ answerId ] );
		}

		if ( includes( selected, answerId ) ) {
			return setSelected( without( selected, answerId ) );
		}

		setSelected( [ ...selected, answerId ] );
	};

	const [ focused, setFocused ] = useState( [] );

	const handleFocus = ( answerId ) => {
		return setFocused( [ answerId ] );
	};

	const handleSubmit = ( event ) => {
		event.preventDefault();

		onSubmit( selected );
	};

	const classes = classnames(
		{
			'is-button': AnswerStyle.BUTTON === answerStyle,
			'is-inline-button-alignment':
				ButtonAlignment.INLINE === buttonAlignment,
		},
		'crowdsignal-forms-poll__options'
	);

	return (
		<form
			className="crowdsignal-forms-poll__form"
			onSubmit={ handleSubmit }
		>
			<div className={ classes }>
				{ map( answers, ( answer, index ) => (
					<PollAnswer
						key={ `poll-answer-${ index }` }
						answerStyle={ answerStyle }
						isMultipleChoice={ isMultipleChoice }
						isSelected={ includes(
							selected,
							answer.answerIdFromApi
						) }
						isFocused={ includes(
							focused,
							answer.answerIdFromApi
						) }
						onSelect={ handleSelect }
						onFocus={ handleFocus }
						hasVoted={ hasVoted }
						isVoting={ isVoting }
						{ ...answer }
					/>
				) ) }
			</div>

			{ ! hasVoted && AnswerStyle.RADIO === answerStyle && (
				<div className="crowdsignal-forms-poll__actions">
					<div className="wp-block-button crowdsignal-forms-poll__block-button">
						<input
							type="submit"
							className="wp-block-button__link crowdsignal-forms-poll__submit-button"
							disabled={ isVoting || ! selected.length }
							value={ submitButtonLabel }
						/>
					</div>
				</div>
			) }
			{ ! hideBranding && (
				<div className="wp_block-crowdsignal-forms-poll__vote-branding">
					<FooterBranding showLogo={ false } />
				</div>
			) }
		</form>
	);
};

PollVote.propTypes = {
	answers: PropTypes.array.isRequired,
	isMultipleChoice: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	submitButtonLabel: PropTypes.string.isRequired,
};

export default PollVote;
