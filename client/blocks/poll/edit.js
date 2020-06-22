/**
 * External dependencies
 */
import React from 'react';
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ClosedBanner from 'components/poll/closed-banner';
import { PollColors, getPollColors } from 'components/poll/colors';
import PollResults from 'components/poll/results';
import { maybeAddTemporaryAnswerIds } from 'components/poll/util';
import { withFallbackColors } from 'components/with-fallback-colors';
import { __ } from 'lib/i18n';
import { ClosedPollState } from './constants';
import EditAnswers from './edit-answers';
import SideBar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars, getBlockCssClasses, isPollClosed } from './util';
import { useCrowdsignalPoll } from './hooks';

const PollBlock = ( props ) => {
	const {
		attributes,
		className,
		fallbackColors,
		isSelected,
		setAttributes,
		renderColorProbe,
	} = props;

	const { setOutboundChanges, maybeSyncQueuedChanges } = useCrowdsignalPoll(
		attributes,
		{
			onSyncComplete: ( response, currentAttributes ) => {
				const { answers } = currentAttributes;
				const answersWithIds = response.answers
					? map( answers, ( answer, i ) => {
							const newAnswer = { ...answer };
							if ( response.answers[ i ] ) {
								newAnswer.answerId = response.answers[ i ].id;
							}
							return newAnswer;
					  } )
					: answers;

				const attrsToSet = { answers: answersWithIds };
				if ( ! currentAttributes.pollId ) {
					attrsToSet.pollId = response.id;
				}
				setAttributes( attrsToSet );
			},
		}
	);

	maybeSyncQueuedChanges( attributes );

	const setAttributesAndFlagChange = ( attrs ) => {
		setOutboundChanges( ( n ) => n + 1 );
		setAttributes( attrs );
	};

	const handleChangeQuestion = ( question ) =>
		setAttributesAndFlagChange( { question } );
	const handleChangeNote = ( note ) => setAttributesAndFlagChange( { note } );

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);
	const showNote = attributes.note || isSelected;
	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;
	const isHidden =
		isClosed && ClosedPollState.HIDDEN === attributes.closedPollState;

	return (
		<>
			<Toolbar { ...props } />
			<SideBar { ...props } />

			<div
				className={ getBlockCssClasses( attributes, className, {
					'is-selected-in-editor': isSelected,
					'is-closed': isClosed,
					'is-hidden': isHidden,
				} ) }
				style={ getStyleVars( attributes, fallbackColors ) }
			>
				<div className="wp-block-crowdsignal-forms-poll__content">
					<RichText
						tagName="h3"
						className="wp-block-crowdsignal-forms-poll__question"
						placeholder={ __( 'Enter your question' ) }
						onChange={ handleChangeQuestion }
						value={ attributes.question }
						allowedFormats={ [] }
					/>

					{ showNote && (
						<RichText
							tagName="p"
							className="wp-block-crowdsignal-forms-poll__note"
							placeholder={ __( 'Add a note (optional)' ) }
							onChange={ handleChangeNote }
							value={ attributes.note }
							allowedFormats={ [] }
						/>
					) }

					{ ! showResults && (
						<EditAnswers
							{ ...props }
							setAttributesAndFlagChange={
								setAttributesAndFlagChange
							}
						/>
					) }

					{ showResults && (
						<PollResults
							answers={ maybeAddTemporaryAnswerIds(
								attributes.answers
							) }
						/>
					) }
				</div>

				{ isClosed && (
					<ClosedBanner
						isPollHidden={ isHidden }
						isPollClosed={ isClosed }
					/>
				) }

				{ renderColorProbe() }
			</div>
		</>
	);
};

export default withFallbackColors( PollColors, getPollColors )( PollBlock );
