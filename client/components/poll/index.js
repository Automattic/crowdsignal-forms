/**
 * External dependencies
 */
import React, { useState } from 'react';
import seedrandom from 'seedrandom';
import { filter, map, reduce } from 'lodash';
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import {
	getAnswerStyle,
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
} from 'blocks/poll/util';
import { ClosedPollState, ConfirmMessageType } from 'blocks/poll/constants';
import { withFallbackStyles } from 'components/with-fallback-styles';
import ClosedBanner from './closed-banner';
import PollResults from './results';
import PollVote from './vote';
import { PollStyles, getPollStyles } from './styles';
import { shuffleWithGenerator, loadCustomFont } from './util';
import { __ } from 'lib/i18n';
import { usePollVote } from 'data/hooks';
import { CrowdsignalFormsError } from 'data/poll';
import ErrorBanner from './error-banner';
import SubmitMessage from './submit-message';

const Poll = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ randomAnswerSeed ] = useState( Math.random() );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ dismissSubmitMessage, setDismissSubmitMessage ] = useState( false );
	const { apiPollData } = attributes;
	const pollIdFromApi = apiPollData.id;

	const { hasVoted, isVoting, vote } = usePollVote(
		pollIdFromApi,
		attributes.hasOneResponsePerComputer
	);

	const handleSubmit = async ( selectedAnswerIds ) => {
		try {
			setErrorMessage( '' );
			setDismissSubmitMessage( false );

			await vote( selectedAnswerIds );

			if (
				ConfirmMessageType.REDIRECT === attributes.confirmMessageType
			) {
				window.open( attributes.redirectAddress );
			}
		} catch ( ex ) {
			if ( ex instanceof CrowdsignalFormsError ) {
				setErrorMessage( ex.message );
			} else {
				setErrorMessage( __( 'Server error. Please try again.' ) );
			}
		}
	};

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	if ( isClosed && ClosedPollState.HIDDEN === attributes.closedPollState ) {
		return null;
	}

	const showResults =
		( isClosed &&
			ClosedPollState.SHOW_RESULTS === attributes.closedPollState ) ||
		( hasVoted &&
			ConfirmMessageType.RESULTS === attributes.confirmMessageType );

	const showSubmitMessage =
		hasVoted &&
		! showResults &&
		! dismissSubmitMessage &&
		ConfirmMessageType.REDIRECT !== attributes.confirmMessageType;

	const hasDefaultThankyou =
		ConfirmMessageType.THANK_YOU === attributes.confirmMessageType;

	const classes = getBlockCssClasses(
		attributes,
		attributes.className,
		'wp-block-crowdsignal-forms-poll',
		{
			'has-voted': hasVoted,
			'is-closed': isClosed,
			'is-voting': isVoting,
			'has-default-thankyou': hasDefaultThankyou,
		}
	);

	const blockStyle = {
		width:
			attributes.align !== 'full'
				? `${ attributes.width }${ attributes.widthUnit }`
				: 'auto',
		...getStyleVars( attributes, fallbackStyles ),
	};

	const answerClientIdMap = reduce(
		apiPollData.answers,
		( accum, answer ) => {
			accum[ answer.client_id ] = answer.id;
			return accum;
		},
		{}
	);

	const answersWithIds = map(
		attributes.answers,
		( answerWithoutIdFromApi ) => {
			const answerIdFromApi =
				answerClientIdMap[ answerWithoutIdFromApi.answerId ];
			return { ...answerWithoutIdFromApi, answerIdFromApi };
		}
	);

	const answers = shuffleWithGenerator(
		filter( answersWithIds, ( answer ) => !! answer.text ),
		attributes.randomizeAnswers
			? new seedrandom( randomAnswerSeed )
			: () => 1
	);

	const contentClasses = classNames(
		{
			'is-transparent': showSubmitMessage,
		},
		'wp-block-crowdsignal-forms-poll__content'
	);

	const answerStyle = getAnswerStyle( attributes, attributes.className );

	if ( attributes.fontFamily ) {
		loadCustomFont( attributes.fontFamily );
	}

	return (
		<div className={ classes } style={ blockStyle }>
			{ errorMessage && <ErrorBanner>{ errorMessage }</ErrorBanner> }

			<div className={ contentClasses }>
				<h3 className="wp-block-crowdsignal-forms-poll__question">
					{ decodeEntities( attributes.question ) }
				</h3>

				{ attributes.note && (
					<p className="wp-block-crowdsignal-forms-poll__note">
						{ decodeEntities( attributes.note ) }
					</p>
				) }

				{ ! showResults && (
					<PollVote
						answers={ answers }
						answerStyle={ answerStyle }
						buttonAlignment={ attributes.buttonAlignment }
						isMultipleChoice={ attributes.isMultipleChoice }
						onSubmit={ handleSubmit }
						submitButtonLabel={ attributes.submitButtonLabel }
						hasVoted={ hasVoted }
						isVoting={ isVoting }
						hideBranding={ attributes.hideBranding }
					/>
				) }

				{ showResults && (
					<PollResults
						pollIdFromApi={ pollIdFromApi }
						answers={ answers }
						setErrorMessage={ setErrorMessage }
						hideBranding={ attributes.hideBranding }
					/>
				) }
			</div>
			{ showSubmitMessage && (
				<SubmitMessage
					{ ...attributes }
					setDismissSubmitMessage={ setDismissSubmitMessage }
				/>
			) }
			{ ( isClosed || hasVoted ) && (
				<ClosedBanner
					showSubmitMessage={ showSubmitMessage }
					isPollClosed={ isClosed }
					hasVoted={ hasVoted }
				/>
			) }

			{ renderStyleProbe() }
		</div>
	);
};

export default withFallbackStyles( PollStyles, getPollStyles )( Poll );
