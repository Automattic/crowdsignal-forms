/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { get, filter, isEmpty, map, round, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { ResizableBox } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import ClosedBanner from 'components/poll/closed-banner';
import PollResults from 'components/poll/results';
import {
	addApiAnswerIds,
	isAnswerEmpty,
	loadCustomFont,
} from 'components/poll/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { ClosedPollState } from './constants';
import EditAnswers from './edit-answers';
import SideBar from './sidebar';
import Toolbar from './toolbar';
import {
	getAnswerStyle,
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
	toggleButtonStyleAvailability,
} from './util';
import ErrorBanner from 'components/poll/error-banner';
import { v4 as uuidv4 } from 'uuid';
import EditBar from './edit-bar';
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import PollIcon from 'components/icon/poll';
import withPollBase from 'components/with-poll-base';
import FooterBranding from 'components/footer-branding';
import SignalWarning from 'components/signal-warning';
import { STORE_NAME } from 'state';

const withPollAndAnswerIds = ( Element ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;
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

		return <Element { ...props } />;
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
		pollDataFromApi,
		context,
	} = props;

	const {
		postId,
		queryId,
	} = context;

	// Prevent block from loading in FSE or a query loop because save handlers don't support those contexts.
	// - double == instead of triple === used because we need to test for both null and undefined
	if ( null == postId ) {
		return <ErrorBanner>{ __( 'Crowdsignal blocks cannot be used outside of a post or page. The Site Editor is not supported.', 'crowdsignal-forms' ) }</ErrorBanner>;
	} else if ( null != queryId ) {
		return <ErrorBanner>{ __( 'Crowdsignal blocks are not supported inside a query loop.', 'crowdsignal-forms' ) }</ErrorBanner>;
	}

	const [ isPollEditable, setIsPollEditable ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const pollIsPublished = ! isEmpty( pollDataFromApi );
	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';
	const pollIdFromApi = pollDataFromApi ? pollDataFromApi.id : null;
	const answerIdMap = {};
	if ( pollDataFromApi ) {
		map( pollDataFromApi.answers, ( answer ) => {
			answerIdMap[ answer.client_id ] = answer.id;
		} );
	}

	const handleChangeQuestion = ( question ) => setAttributes( { question } );
	const handleChangeNote = ( note ) => setAttributes( { note } );

	const handleResize = ( event, handle, element ) => {
		if ( handle !== 'right' && handle !== 'left' ) {
			return;
		}

		setAttributes( {
			width: round(
				( element.offsetWidth / element.parentNode.offsetWidth ) * 100
			),
		} );
	};

	const isResizable = isSelected && attributes.align !== 'full';
	const blockWidth =
		attributes.align !== 'full' ? `${ attributes.width }%` : 'auto';

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);
	const showNote = attributes.note || ( isSelected && isPollEditable );
	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;
	const isHidden =
		isClosed && ClosedPollState.HIDDEN === attributes.closedPollState;

	const accountInfo = useSelect( ( select ) =>
		select( STORE_NAME ).getAccountInfo()
	);

	const hideBranding = get( accountInfo, 'capabilities', [] ).includes(
		'hide-branding'
	);

	useEffect( () => setIsPollEditable( ! pollIsPublished ), [ isSelected ] );

	useEffect( () => {
		if ( isSelected ) {
			toggleButtonStyleAvailability( ! attributes.isMultipleChoice );
		}
	}, [ attributes.isMultipleChoice, isSelected ] );

	const showEditBar = isSelected && pollIsPublished && ! isPollEditable;

	const answerStyle = getAnswerStyle( attributes, className );

	if ( attributes.fontFamily ) {
		loadCustomFont( attributes.fontFamily );
	}

	const shouldPromote = get( accountInfo, [
		'signalCount',
		'shouldDisplay',
	] );
	const signalWarning =
		shouldPromote &&
		get( accountInfo, [ 'signalCount', 'count' ] ) >=
			get( accountInfo, [ 'signalCount', 'userLimit' ] );

	return (
		<ConnectToCrowdsignal
			blockIcon={ <PollIcon /> }
			blockName={ __( 'Crowdsignal Poll', 'crowdsignal-forms' ) }
		>
			<Toolbar { ...props } />
			<SideBar
				{ ...props }
				viewResultsUrl={ viewResultsUrl }
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
			/>
			{ signalWarning && <SignalWarning /> }
			<ResizableBox
				className="crowdsignal-forms-poll__resize-wrapper"
				size={ { height: 'auto', width: blockWidth } }
				minWidth="25%"
				maxWidth="100%"
				enable={ { left: true, right: true } }
				onResizeStop={ handleResize }
				showHandle={ isResizable }
				resizeRatio={ 2 }
			>
				<div
					className={ getBlockCssClasses(
						attributes,
						className,
						{
							'is-selected-in-editor': isSelected,
							'is-closed': isClosed,
							'is-hidden': isHidden,
						},
						'crowdsignal-forms-poll'
					) }
					style={ getStyleVars( attributes, fallbackStyles ) }
				>
					{ showEditBar && (
						<EditBar
							onEditClick={ () => {
								setIsPollEditable( true );
							} }
						/>
					) }
					{ errorMessage && (
						<ErrorBanner>{ errorMessage }</ErrorBanner>
					) }
					<div className="crowdsignal-forms-poll__content">
						{ isPollEditable ? (
							<RichText
								tagName="h3"
								className="crowdsignal-forms-poll__question"
								placeholder={ __(
									'Enter your question',
									'crowdsignal-forms'
								) }
								onChange={ handleChangeQuestion }
								value={ attributes.question }
								allowedFormats={ [] }
								disableLineBreaks={ true }
							/>
						) : (
							<h3 className="crowdsignal-forms-poll__question">
								{ attributes.question ||
									__(
										'Enter your question',
										'crowdsignal-forms'
									) }
							</h3>
						) }

						{ showNote &&
							( isPollEditable ? (
								<RichText
									tagName="p"
									className="crowdsignal-forms-poll__note"
									placeholder={ __(
										'Add a note (optional)',
										'crowdsignal-forms'
									) }
									onChange={ handleChangeNote }
									value={ attributes.note }
									allowedFormats={ [] }
									disableLineBreaks={ true }
								/>
							) : (
								<div className="crowdsignal-forms-poll__note">
									{ attributes.note ||
										__(
											'Add a note (optional)',
											'crowdsignal-forms'
										) }
								</div>
							) ) }

						{ ! showResults && (
							<EditAnswers
								{ ...props }
								setAttributes={ setAttributes }
								disabled={ ! isPollEditable }
								answerStyle={ answerStyle }
								buttonAlignment={ attributes.buttonAlignment }
							/>
						) }

						{ showResults && (
							<PollResults
								answers={ addApiAnswerIds(
									filter(
										attributes.answers,
										( answer ) => ! isAnswerEmpty( answer )
									),
									answerIdMap
								) }
								pollIdFromApi={ pollIdFromApi }
								hideBranding={ hideBranding }
								setErrorMessage={ setErrorMessage }
							/>
						) }
						{ ! hideBranding && (
							<FooterBranding />
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
			</ResizableBox>
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withFallbackStyles,
	withPollBase,
	withPollAndAnswerIds,
] )( PollBlock );
