/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { map, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { useEntityId } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import ClosedBanner from 'components/poll/closed-banner';
import { PollStyles, getPollStyles } from 'components/poll/styles';
import PollResults from 'components/poll/results';
import { maybeAddTemporaryAnswerIds } from 'components/poll/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { __ } from 'lib/i18n';
import { ClosedPollState } from './constants';
import EditAnswers from './edit-answers';
import SideBar from './sidebar';
import Toolbar from './toolbar';
import {
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
	pollIdExistsInPageContent,
} from './util';
import ErrorBanner from 'components/poll/error-banner';
import { v4 as uuidv4 } from 'uuid';
import EditBar from './edit-bar';

// To be moved to hooks if we end up using it.
const useViewResultsUrl = ( { attributes } ) => {
	const postId = useEntityId( 'postType', 'post' );
	const [ viewResultsUrl, setViewResultsUrl ] = useState( '' );

	useEffect( () => {
		if ( ! attributes.pollId || viewResultsUrl !== '' ) {
			return;
		}
		apiFetch( {
			path: `/crowdsignal-forms/v1/post-polls/${ postId }/${ attributes.pollId }`,
			method: 'GET',
		} ).then(
			( res ) =>
				setViewResultsUrl(
					`https://app.crowdsignal.com/polls/${ res.id }/results`
				),
			() => setViewResultsUrl( '' )
		);
	}, [ attributes.pollId ] );

	return viewResultsUrl;
};

const withPollAndAnswerIds = ( Element ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;
		const viewResultsUrl = useViewResultsUrl( props );
		useEffect( () => {
			if ( ! attributes.pollId ) {
				const thePollId = uuidv4();
				setAttributes( { pollId: thePollId } );
			}
			if ( some( attributes.answers, ( a ) => ! a.answerId && a.text ) ) {
				const answers = map( attributes.answers, ( answer ) => {
					if ( answer.answerId || ! answer.text ) {
						return answer;
					}
					const answerId = uuidv4();
					return { ...answer, answerId };
				} );

				setAttributes( { answers } );
			}
		} );

		return <Element { ...props } viewResultsUrl={ viewResultsUrl } />;
	};
};

const PollBlock = ( props ) => {
	const {
		attributes,
		className,
		fallbackStyles,
		isSelected,
		setAttributes,
		renderStyleProbe,
		viewResultsUrl,
	} = props;

	const [ isPollEditable, setIsPollEditable ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const handleChangeQuestion = ( question ) => setAttributes( { question } );
	const handleChangeNote = ( note ) => setAttributes( { note } );

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);
	const showNote = attributes.note || ( isSelected && isPollEditable );
	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;
	const isHidden =
		isClosed && ClosedPollState.HIDDEN === attributes.closedPollState;
	const hideBranding = true; // hide branding in editor for now

	const postDetails = wp.data.select( 'core/editor' ).getCurrentPost();
	const wasBlockAddedBeforeLastPublish =
		'publish' === postDetails.status &&
		pollIdExistsInPageContent( attributes.pollId, postDetails.content );

	useEffect( () => setIsPollEditable( ! wasBlockAddedBeforeLastPublish ), [
		isSelected,
	] );

	const showEditBar =
		isSelected && wasBlockAddedBeforeLastPublish && ! isPollEditable;

	return (
		<>
			<Toolbar { ...props } />
			<SideBar { ...props } viewResultsUrl={ viewResultsUrl } />

			<div
				className={ getBlockCssClasses( attributes, className, {
					'is-selected-in-editor': isSelected,
					'is-closed': isClosed,
					'is-hidden': isHidden,
				} ) }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				{ showEditBar && (
					<EditBar
						onEditClick={ () => {
							setIsPollEditable( true );
						} }
					/>
				) }
				{ errorMessage && <ErrorBanner>{ errorMessage }</ErrorBanner> }
				<div className="wp-block-crowdsignal-forms-poll__content">
					{ isPollEditable ? (
						<RichText
							tagName="h3"
							className="wp-block-crowdsignal-forms-poll__question"
							placeholder={ __( 'Enter your question' ) }
							onChange={ handleChangeQuestion }
							value={ attributes.question }
							allowedFormats={ [] }
						/>
					) : (
						<h3 className="wp-block-crowdsignal-forms-poll__question">
							{ attributes.question
								? attributes.question
								: __( 'Enter your question' ) }
						</h3>
					) }

					{ showNote &&
						( isPollEditable ? (
							<RichText
								tagName="p"
								className="wp-block-crowdsignal-forms-poll__note"
								placeholder={ __( 'Add a note (optional)' ) }
								onChange={ handleChangeNote }
								value={ attributes.note }
								allowedFormats={ [] }
							/>
						) : (
							<p className="wp-block-crowdsignal-forms-poll__note">
								{ attributes.note
									? attributes.note
									: __( 'Add a note (optional)' ) }
							</p>
						) ) }

					{ ! showResults && (
						<EditAnswers
							{ ...props }
							setAttributes={ setAttributes }
							disabled={ ! isPollEditable }
						/>
					) }

					{ showResults && (
						<PollResults
							answers={ maybeAddTemporaryAnswerIds(
								attributes.answers
							) }
							hideBranding={ hideBranding }
							setErrorMessage={ setErrorMessage }
						/>
					) }
				</div>

				{ isClosed && (
					<ClosedBanner
						isPollHidden={ isHidden }
						isPollClosed={ isClosed }
					/>
				) }

				{ renderStyleProbe() }
			</div>
		</>
	);
};

export default withFallbackStyles(
	PollStyles,
	getPollStyles
)( withPollAndAnswerIds( PollBlock ) );
