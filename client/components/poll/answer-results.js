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
import { _n, sprintf } from 'lib/i18n';

const PollAnswerResults = ( { error, loading, text, totalVotes, votes } ) => {
	const classes = classnames( 'crowdsignal-forms-poll__answer-results', {
		'is-error': error,
		'is-loading': loading,
	} );

	const showResults = ! loading && ! error;

	const answerShare = 0 === totalVotes ? 0 : ( votes * 100 ) / totalVotes;

	const progressBarStyles = {
		width: `${ parseInt( answerShare, 10 ) }%`,
	};

	return (
		<div className={ classes }>
			<div className="crowdsignal-forms-poll__answer-results-labels">
				<span className="crowdsignal-forms-poll__answer-results-answer">
					{ decodeEntities( text ) }
				</span>

				<span className="crowdsignal-forms-poll__answer-results-votes">
					{ showResults &&
						sprintf(
							// translators: %s: Number of votes.
							_n( '%s vote', '%s votes', votes ),
							votes.toLocaleString()
						) }
				</span>

				<span className="crowdsignal-forms-poll__answer-results-percent">
					{ showResults && `${ answerShare.toFixed( 2 ) }%` }
				</span>
			</div>

			<div className="crowdsignal-forms-poll__answer-results-progress-track">
				<div
					className="crowdsignal-forms-poll__answer-results-progress-bar"
					style={ progressBarStyles }
				/>
			</div>
		</div>
	);
};

PollAnswerResults.propTypes = {
	loading: PropTypes.bool,
	text: PropTypes.string.isRequired,
	totalVotes: PropTypes.number,
	votes: PropTypes.number,
};

export default PollAnswerResults;
