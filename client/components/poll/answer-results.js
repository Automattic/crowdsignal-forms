/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { _n, sprintf } from 'lib/i18n';

const PollAnswerResults = ( { loading, share, text, votes } ) => {
	const classes = classnames(
		'wp-block-crowdsignal-forms-poll__answer-results',
		{
			'is-loading': loading,
		}
	);

	const progressBarStyles = {
		width: `${ parseInt( share, 10 ) }%`,
	};

	return (
		<div className={ classes }>
			<div className="wp-block-crowdsignal-forms-poll__answer-results-labels">
				<span className="wp-block-crowdsignal-forms-poll__answer-results-answer">
					{ text }
				</span>

				<span className="wp-block-crowdsignal-forms-poll__answer-results-votes">
					{ ! loading &&
						sprintf(
							// translators: %s: Number of votes.
							_n( '%s vote', '%s votes', votes ),
							votes.toLocaleString()
						) }
				</span>

				<span className="wp-block-crowdsignal-forms-poll__answer-results-percent">
					{ ! loading && `${ share.toFixed( 2 ) }%` }
				</span>
			</div>

			<div className="wp-block-crowdsignal-forms-poll__answer-results-progress-track">
				<div
					className="wp-block-crowdsignal-forms-poll__answer-results-progress-bar"
					style={ progressBarStyles }
				/>
			</div>
		</div>
	);
};

PollAnswerResults.propTypes = {
	loading: PropTypes.bool,
	share: PropTypes.number,
	text: PropTypes.string.isRequired,
	votes: PropTypes.number,
};

export default PollAnswerResults;
