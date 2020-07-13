/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { map, sum, values } from 'lodash';

/**
 * Internal dependencies
 */
import { usePollResults } from 'data/hooks';
import { __, _n, sprintf } from 'lib/i18n';
import PollAnswerResults from './answer-results';
import FooterBranding from './footer-branding';

const PollResults = ( {
	answers,
	pollIdFromApi,
	setErrorMessage,
	hideBranding,
} ) => {
	const { error, loading, results } = usePollResults( pollIdFromApi );

	useEffect( () => {
		setErrorMessage(
			error
				? __(
						`Unfortunately, we're having some trouble retrieving ` +
							`the results for this poll at this time.`
				  )
				: ''
		);
	}, [ error ] );

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
						key={ answer.answerIdFromApi }
						error={ !! error }
						loading={ loading }
						text={ answer.text }
						totalVotes={ total }
						votes={
							results ? results[ answer.answerIdFromApi ] ?? 0 : 0
						}
					/>
				) ) }
			</div>

			<div className="wp-block-crowdsignal-forms-poll__results-footer">
				<span className="wp-block-crowdsignal-forms-poll__results-total">
					{ sprintf(
						// translators: %s: Number of votes
						_n( '%s total vote', '%s total votes', total ),
						total ? total.toLocaleString() : 0
					) }
				</span>
				{ ! hideBranding && <FooterBranding /> }
			</div>
		</div>
	);
};

PollResults.propTypes = {
	pollIdFromApi: PropTypes.number.isRequired,
	answers: PropTypes.arrayOf(
		PropTypes.shape( {
			answerIdFromApi: PropTypes.number.isRequired,
			text: PropTypes.string,
		} )
	).isRequired,
	setErrorMessage: PropTypes.func.isRequired,
	hideBranding: PropTypes.bool,
};

export default PollResults;
