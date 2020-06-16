/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { map, sum, values } from 'lodash';

/**
 * Internal dependencies
 */
import { usePollResults } from 'data/hooks';
import { __, _n, sprintf } from 'lib/i18n';
import PollAnswerResults from './answer-results';

const PollResults = ( { answers, pollId } ) => {
	const { error, loading, results } = usePollResults( pollId );

	const classes = classnames( 'wp-block-crowdsignal-forms-poll__results', {
		'is-error': !! error,
		'is-loading': loading,
	} );

	const total = sum( values( results ) );

	return (
		<div className={ classes }>
			<div className="wp-block-crowdsignal-forms-poll__results-list">
				{ map( answers, ( answer ) => (
					<PollAnswerResults
						key={ answer.answerId }
						error={ !! error }
						loading={ loading }
						text={ answer.text }
						totalVotes={ total }
						votes={ results ? results[ answer.answerId ] : 0 }
					/>
				) ) }
			</div>

			{ error && (
				<div className="wp-block-crowdsignal-forms-poll__results-error">
					{ __(
						`Unfortunately, we're having some trouble retrieving ` +
							`the results for this poll at this time.`
					) }
				</div>
			) }

			<div className="wp-block-crowdsignal-forms-poll__results-footer">
				<span className="wp-block-crowdsignal-forms-poll__results-total">
					{ sprintf(
						// translators: %s: Number of votes
						_n( '%s total vote', '%s total votes', total ),
						total ? total.toLocaleString() : 0
					) }
				</span>

				<span className="wp-block-crowdsignal-forms-poll__results-branding">
					<a
						className="wp-block-crowdsignal-forms-poll__results-cs-link"
						href="https://crowdsignal.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Create your own poll with Crowdsignal' ) }
					</a>
				</span>
			</div>
		</div>
	);
};

PollResults.propTypes = {
	pollId: PropTypes.number.isRequired,
	answers: PropTypes.arrayOf(
		PropTypes.shape( {
			answerId: PropTypes.number.isRequired,
			text: PropTypes.string,
		} )
	).isRequired,
};

export default PollResults;
