/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import PollClosedBanner from 'components/poll/closed-banner';
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

const PollBlock = ( props ) => {
	const {
		attributes,
		className,
		fallbackColors,
		isSelected,
		setAttributes,
		renderColorProbe,
	} = props;

	const handleChangeQuestion = ( question ) => setAttributes( { question } );
	const handleChangeNote = ( note ) => setAttributes( { note } );

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
					/>

					{ showNote && (
						<RichText
							tagName="p"
							className="wp-block-crowdsignal-forms-poll__note"
							placeholder={ __( 'Add a note (optional)' ) }
							onChange={ handleChangeNote }
							value={ attributes.note }
						/>
					) }

					{ ! showResults && <EditAnswers { ...props } /> }

					{ showResults && (
						<PollResults
							answers={ maybeAddTemporaryAnswerIds(
								attributes.answers
							) }
						/>
					) }
				</div>

				{ isClosed && <PollClosedBanner isPollHidden={ isHidden } /> }

				{ renderColorProbe() }
			</div>
		</>
	);
};

export default withFallbackColors( PollColors, getPollColors )( PollBlock );
