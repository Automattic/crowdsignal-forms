/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { map, sum, values, zipObject } from 'lodash';

/**
 * Internal dependencies
 */
import { usePollResults } from 'data/hooks';
import { __, _n, sprintf } from 'lib/i18n';
import PollAnswerResults from './answer-results';

const PollResults = ( { answers, pollId } ) => {
	const { loading, results: tempResults } = usePollResults( pollId );

	const resultsTotalClasses = classnames(
		'wp-block-crowdsignal-forms-poll__results-total',
		{
			'is-loading': loading,
		}
	);

	// Because we're not making a real request yet
	// we need to inject the answer id's into the response.
	const results = zipObject( map( answers, 'answerId' ), tempResults || {} );

	const total = sum( values( results ) );

	return (
		<>
			<div className="wp-block-crowdsignal-forms-poll__results">
				{ map( answers, ( answer ) => (
					<PollAnswerResults
						key={ answer.answerId }
						loading={ loading }
						share={ ( results[ answer.answerId ] * 100 ) / total }
						text={ answer.text }
						votes={ results[ answer.answerId ] }
					/>
				) ) }
			</div>

			<div className="wp-block-crowdsignal-forms-poll__results-footer">
				<span className={ resultsTotalClasses }>
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
		</>
	);
};

export default PollResults;
