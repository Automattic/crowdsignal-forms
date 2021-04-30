/**
 * External dependencies
 */
import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress depenencies
 */
import { RichText } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getFeedbackButtonPosition } from 'components/feedback/util';
import { useAccountInfo } from 'data/hooks';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars } from './util';
import { useAutosave } from 'components/use-autosave';
import { updateFeedback } from 'data/feedback/edit';
import SignalWarning from 'components/signal-warning';
import { views, FeedbackStatus } from './constants';
import RetryNotice from 'components/retry-notice';

const EditFeedbackBlock = ( props ) => {
	const [ view, setView ] = useState( views.QUESTION );
	const [ height, setHeight ] = useState( null );
	const [ overlayPosition, setOverlayPosition ] = useState( {} );

	const {
		attributes,
		activeSidebar,
		editorFeatures,
		fallbackStyles,
		isSelected,
		setAttributes,
		clientId,
		sourceLink,
		setPosition,
	} = props;

	const {
		isExample,
		feedbackPlaceholder,
		emailPlaceholder,
		surveyId,
		title,
		header,
		emailResponses,
		triggerLabel,
	} = attributes;

	const triggerButton = useRef( null );
	const popover = useRef( null );

	const accountInfo = useAccountInfo();

	const { error: saveError, save: saveBlock } = useAutosave(
		async ( data ) => {
			dispatch( 'core/editor' ).lockPostSaving( clientId );

			try {
				const response = await updateFeedback( {
					feedbackPlaceholder: data.feedbackPlaceholder,
					emailPlaceholder: data.emailPlaceholder,
					sourceLink: data.sourceLink,
					surveyId: data.surveyId,
					title: data.title || data.header,
					emailResponses: data.emailResponses,
				} );

				if ( ! data.surveyId ) {
					setAttributes( { surveyId: response.surveyId } );
				}
			} finally {
				dispatch( 'core/editor' ).unlockPostSaving( clientId );
			}
		},
		{
			feedbackPlaceholder,
			emailPlaceholder,
			sourceLink,
			surveyId,
			title,
			header,
			emailResponses,
		}
	);

	// Force a save to Crowdsignal.com as soon as a new block is created
	useEffect( () => {
		if ( isExample || attributes.surveyId ) {
			return;
		}

		saveBlock();
	}, [] );

	useEffect( () => {
		if ( isSelected ) {
			return;
		}

		setView( views.QUESTION );
	}, [ isSelected ] );

	useLayoutEffect( () => {
		if ( isExample ) {
			return;
		}
		setPosition(
			getFeedbackButtonPosition(
				attributes.x,
				attributes.y,
				triggerButton.current.offsetWidth,
				triggerButton.current.offsetHeight,
				{
					left: 20,
					right: 20,
					top: isSelected ? 80 : 20,
					bottom: 20,
				},
				document.getElementsByClassName(
					'interface-interface-skeleton__content'
				)[ 0 ]
			)
		);
	}, [
		activeSidebar,
		editorFeatures.fullscreenMode,
		isSelected,
		setPosition,
		attributes.x,
		attributes.y,
		triggerButton.current,
	] );

	useLayoutEffect( () => {
		if ( ! popover.current ) {
			return;
		}

		setHeight( popover.current.offsetHeight );
	}, [ attributes.header, popover.current, isSelected ] );

	useLayoutEffect( () => {
		const contentWrapper = document.getElementsByClassName(
			'interface-interface-skeleton__content'
		)[ 0 ];
		const contentBox = contentWrapper.getBoundingClientRect();

		setOverlayPosition( {
			bottom: window.innerHeight - ( contentBox.top + contentBox.height ),
			left: contentBox.left,
			right: window.innerWidth - ( contentBox.left + contentBox.width ),
			top: contentBox.top,
		} );
	}, [ activeSidebar, editorFeatures.fullscreenMode, isSelected ] );

	const toggleBlock = () => {
		dispatch( 'core/block-editor' ).clearSelectedBlock();
		triggerButton.current.parentElement.parentElement.parentElement.blur();
	};

	const handleChangeAttribute = ( key ) => ( value ) =>
		setAttributes( { [ key ]: value } );

	const shouldPromote = get( accountInfo, [
		'signalCount',
		'shouldDisplay',
	] );

	const signalWarning =
		shouldPromote &&
		get( accountInfo, [ 'signalCount', 'count' ] ) >=
			get( accountInfo, [ 'signalCount', 'userLimit' ] );

	const email = get( accountInfo, [ 'account', 'email' ] );

	const classes = classnames(
		'crowdsignal-forms-feedback',
		`align-${ attributes.x }`,
		`vertical-align-${ attributes.y }`,
		{
			'no-shadow': attributes.hideTriggerShadow,
			'is-active': isSelected,
		}
	);

	const popoverStyles = {
		height,
	};

	const isClosed =
		FeedbackStatus.CLOSED === attributes.status ||
		( FeedbackStatus.CLOSED_AFTER === attributes.status &&
			null !== attributes.closedAfterDateTime &&
			new Date().toISOString() > attributes.closedAfterDateTime );

	return (
		<ConnectToCrowdsignal>
			<Toolbar
				currentView={ view }
				onViewChange={ setView }
				{ ...props }
			/>
			<Sidebar
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
				email={ email }
				{ ...props }
			/>

			<div
				className={ classes }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				<div className="wp-block-button crowdsignal-forms-feedback__trigger-wrapper">
					<RichText
						ref={ triggerButton }
						className="wp-block-button__link crowdsignal-forms-feedback__trigger"
						onChange={ handleChangeAttribute( 'triggerLabel' ) }
						value={ triggerLabel }
						allowedFormats={ [] }
						multiline={ false }
						disableLineBreaks={ true }
					/>
				</div>

				{ ( isExample || isSelected ) && (
					<>
						{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
						<div
							aria-modal="true"
							role="dialog"
							className="crowdsignal-forms-feedback__popover-overlay"
							onClick={ toggleBlock }
							style={ overlayPosition }
						/>

						{ ! isExample && signalWarning && <SignalWarning /> }
						{ ! isExample && saveError && (
							<RetryNotice retryHandler={ saveBlock } />
						) }

						{ view === views.QUESTION && (
							<div
								ref={ popover }
								className="crowdsignal-forms-feedback__popover"
							>
								<RichText
									tagName="h3"
									className="crowdsignal-forms-feedback__header"
									onChange={ handleChangeAttribute(
										'header'
									) }
									value={ attributes.header }
									allowedFormats={ [] }
								/>

								<TextareaControl
									className="crowdsignal-forms-feedback__input"
									rows={ 6 }
									onChange={ handleChangeAttribute(
										'feedbackPlaceholder'
									) }
									value={ attributes.feedbackPlaceholder }
								/>

								<TextControl
									className="crowdsignal-forms-feedback__input"
									onChange={ handleChangeAttribute(
										'emailPlaceholder'
									) }
									value={ attributes.emailPlaceholder }
								/>

								<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
									<RichText
										className="wp-block-button__link crowdsignal-forms-feedback__feedback-button"
										onChange={ handleChangeAttribute(
											'submitButtonLabel'
										) }
										value={ attributes.submitButtonLabel }
										allowedFormats={ [] }
										multiline={ false }
										disableLineBreaks={ true }
									/>
								</div>
							</div>
						) }

						{ view === views.SUBMIT && (
							<div
								className="crowdsignal-forms-feedback__popover"
								style={ popoverStyles }
							>
								<RichText
									tagName="h3"
									className="crowdsignal-forms-feedback__header"
									onChange={ handleChangeAttribute(
										'submitText'
									) }
									value={ attributes.submitText }
									allowedFormats={ [] }
								/>
							</div>
						) }
						{ isClosed && (
							<div className="crowdsignal-forms-feedback__closed-notice">
								{ __(
									'This Feedback Form is Closed',
									'crowdsignal-forms'
								) }
							</div>
						) }
					</>
				) }
			</div>

			{ props.renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withSelect( ( select ) => ( {
		activeSidebar: select( 'core/edit-post' ).getActiveGeneralSidebarName(),
		editorFeatures: select( 'core/edit-post' ).getPreference( 'features' ),
		sourceLink: select( 'core/editor' ).getPermalink(),
	} ) ),
	withFallbackStyles,
] )( EditFeedbackBlock );
