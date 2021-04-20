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
import { Icon, TextControl, TextareaControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import SignalIcon from 'components/icon/signal';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getFeedbackButtonPosition } from 'components/feedback/util';
import { useAccountInfo } from 'data/hooks';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars, getTriggerStyles } from './util';
import { useAutosave } from 'components/use-autosave';
import { updateFeedback } from 'data/feedback/edit';
import SignalWarning from 'components/signal-warning';
import { views } from './constants';
import RetryNotice from 'components/retry-notice';

const EditFeedbackBlock = ( props ) => {
	const [ view, setView ] = useState( views.QUESTION );

	const {
		attributes,
		activeSidebar,
		editorFeatures,
		fallbackStyles,
		isSelected,
		setAttributes,
		clientId,
		sourceLink,
	} = props;

	const {
		isExample,
		feedbackPlaceholder,
		emailPlaceholder,
		surveyId,
		title,
		triggerBackgroundImage,
		header,
		emailResponses,
	} = attributes;

	const triggerButton = useRef( null );

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
		props.setPosition(
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
		props.setPosition,
		attributes.x,
		attributes.y,
		triggerButton.current,
	] );

	const setPosition = ( x, y ) => setAttributes( { x, y } );

	const toggleBlock = () =>
		dispatch( 'core/block-editor' ).clearSelectedBlock();

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
		`vertical-align-${ attributes.y }`
	);

	const triggerStyles = getTriggerStyles( attributes );

	return (
		<ConnectToCrowdsignal>
			<Toolbar
				currentView={ view }
				onChangePosition={ setPosition }
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
				<button
					ref={ triggerButton }
					className="crowdsignal-forms-feedback__trigger"
					style={ triggerStyles }
				>
					{ ! triggerBackgroundImage && (
						<Icon icon={ SignalIcon } size={ 75 } />
					) }
				</button>

				{ isSelected && (
					<>
						{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
						<div
							aria-modal="true"
							role="dialog"
							className="crowdsignal-forms-feedback__popover-overlay"
							onClick={ toggleBlock }
						/>

						{ ! isExample && signalWarning && <SignalWarning /> }
						{ ! isExample && saveError && (
							<RetryNotice retryHandler={ saveBlock } />
						) }

						{ view === views.QUESTION && (
							<div className="crowdsignal-forms-feedback__popover">
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
							<div className="crowdsignal-forms-feedback__popover">
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
