/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { map, sum, values } from 'lodash';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { usePollResults } from 'data/hooks';
import PollAnswerResults from './answer-results';
import FooterBranding from 'components/footer-branding';
import { isAnswerEmpty } from './util';

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
							`the results for this poll at this time.`,
						'crowdsignal-forms'
				  )
				: ''
		);
	}, [ error ] );

	const classes = classnames( 'crowdsignal-forms-poll__results', {
		'is-error': !! error,
		'is-loading': loading,
	} );

	const total = sum( values( results ) );

	return (
		<div className={ classes }>
			<div className="crowdsignal-forms-poll__results-list">
				{ map(
					answers,
					( answer ) =>
						! isAnswerEmpty( answer ) && (
							<PollAnswerResults
								key={ answer.answerId }
								error={ !! error }
								loading={ loading }
								text={ answer.text }
								totalVotes={ total }
								votes={
									results
										? results[ answer.answerIdFromApi ] ?? 0
										: 0
								}
							/>
						)
				) }
			</div>

			<div className="crowdsignal-forms-poll__results-footer">
				<span className="crowdsignal-forms-poll__results-total">
					{ sprintf(
						/* translators: %s: Number of votes */
						_n(
							'%s total vote',
							'%s total votes',
							total,
							'crowdsignal-forms'
						),
						total ? total.toLocaleString() : 0
					) }
				</span>
				{ ! hideBranding && <FooterBranding /> }
			</div>
		</div>
	);
};

PollResults.propTypes = {
	pollIdFromApi: PropTypes.number,
	answers: PropTypes.arrayOf(
		PropTypes.shape( {
			answerId: PropTypes.string.isRequired,
			answerIdFromApi: PropTypes.number,
			text: PropTypes.string,
		} )
	).isRequired,
	setErrorMessage: PropTypes.func.isRequired,
	hideBranding: PropTypes.bool,
};

export default PollResults;
