/**
 * External dependencies
 */
import React, {
	useLayoutEffect,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import classnames from 'classnames';
import { get, max } from 'lodash';

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
import EditorNotice from 'components/editor-notice';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getFeedbackButtonPosition } from 'components/feedback/util';
import { useAccountInfo } from 'data/hooks';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars, isWidgetEditor } from './util';
import { useAutosave } from 'components/use-autosave';
import { updateFeedback } from 'data/feedback/edit';
import SignalWarning from 'components/signal-warning';
import { views, FeedbackStatus } from './constants';
import RetryNotice from 'components/retry-notice';
import FooterBranding from 'components/footer-branding';
import FeedbackIcon from 'components/icon/feedback';

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

	const [ margin, setMargin ] = useState( {} );

	const widgetEditor = useMemo( isWidgetEditor, [] );

	const blockElement = useRef( null );
	const triggerButton = useRef( null );
	const popover = useRef( null );

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
	// Also make sure isWidget flag is set correctly
	useEffect( () => {
		if ( isExample || attributes.surveyId ) {
			return;
		}

		saveBlock();
		setAttributes( {
			isWidget: widgetEditor,
		} );
	}, [] );

	useEffect( () => {
		if ( isSelected ) {
			return;
		}

		setView( views.QUESTION );
	}, [ isSelected ] );

	useLayoutEffect( () => {
		if ( isExample || ! triggerButton.current || widgetEditor ) {
			return;
		}

		setPosition(
			getFeedbackButtonPosition(
				attributes.x,
				attributes.y,
				blockElement.current.offsetWidth,
				blockElement.current.offsetHeight,
				{
					left: attributes.y === 'center' ? 10 : 20,
					right: attributes.y === 'center' ? 10 : 20,
					top: isSelected ? 80 : 20,
					bottom: 20,
				},
				document.getElementsByClassName(
					'interface-interface-skeleton__content'
				)[ 0 ]
			),
			triggerButton.current.offsetWidth,
			triggerButton.current.offsetHeight
		);

		const verticalTogglePadding =
			( max( [
				triggerButton.current.offsetWidth,
				blockElement.current.offsetHeight,
			] ) -
				triggerButton.current.offsetWidth ) /
			2;

		setMargin( {
			'--crowdsignal-forms-feedback__toggle-padding': `${ verticalTogglePadding }px`,
			minHeight:
				attributes.y === 'center'
					? triggerButton.current.offsetWidth
					: 0,
			marginLeft:
				attributes.y === 'center' && attributes.x === 'left'
					? triggerButton.current.offsetHeight -
					  triggerButton.current.offsetWidth -
					  10
					: 0,
			marginRight:
				attributes.y === 'center' && attributes.x === 'right'
					? triggerButton.current.offsetHeight -
					  triggerButton.current.offsetWidth -
					  10
					: 0,
		} );
	}, [
		activeSidebar,
		editorFeatures.fullscreenMode,
		isSelected,
		setPosition,
		attributes.x,
		attributes.y,
		triggerButton.current,
		blockElement.current,
		triggerLabel,
		widgetEditor,
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

	const { accountInfo } = useAccountInfo();

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
			'is-vertical': attributes.y === 'center',
			'is-widget': widgetEditor,
		}
	);

	// Widget editor uses CSS `display: none;` to hide sections making it impossible to measure any elements
	// until they're show. As such, we cannot detect when they actually become visible either.
	// Hence the need to just repeat this on every render until we get a value.
	const buttonHeight =
		widgetEditor &&
		triggerButton.current &&
		triggerButton.current.offsetHeight
			? `${
					triggerButton.current && triggerButton.current.offsetHeight
			  }px`
			: null;

	const styles = {
		...getStyleVars( attributes, fallbackStyles ),
		...margin,
		'--crowdsignal-forms-trigger-height': buttonHeight,
	};

	const popoverStyles = {
		height,
	};

	const isClosed =
		FeedbackStatus.CLOSED === attributes.status ||
		( FeedbackStatus.CLOSED_AFTER === attributes.status &&
			null !== attributes.closedAfterDateTime &&
			new Date().toISOString() > attributes.closedAfterDateTime );

	const hideBranding = get( accountInfo, 'capabilities', [] ).includes(
		'hide-branding'
	);

	return (
		<ConnectToCrowdsignal
			blockName={ __( 'Feedback Button', 'crowdsignal-forms' ) }
			blockIcon={ <FeedbackIcon /> }
		>
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

			{ widgetEditor && (
				<>
					{ ! isExample && ! widgetEditor && signalWarning && (
						<SignalWarning />
					) }
					{ ! isExample && ! widgetEditor && saveError && (
						<RetryNotice retryHandler={ saveBlock } />
					) }
					<EditorNotice
						icon="warning"
						status="warn"
						isDismissible={ false }
					>
						{ __(
							'This widget will appear in a fixed position as selected, in a corner or at an edge.',
							'crowdsignal-forms'
						) }
					</EditorNotice>
				</>
			) }

			<div ref={ blockElement } className={ classes } style={ styles }>
				<div className="crowdsignal-forms-feedback__trigger-preview">
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
				</div>

				<div className="crowdsignal-forms-feedback__popover-preview">
					{ ( isExample || isSelected || widgetEditor ) && (
						<>
							{ ! isWidgetEditor && (
								<>
									{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
									<div
										aria-modal="true"
										role="dialog"
										className="crowdsignal-forms-feedback__popover-overlay"
										onClick={ toggleBlock }
										style={ overlayPosition }
									/>
								</>
							) }

							{ ! isExample &&
								! widgetEditor &&
								signalWarning && <SignalWarning /> }
							{ ! isExample && ! widgetEditor && saveError && (
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
											value={
												attributes.submitButtonLabel
											}
											allowedFormats={ [] }
											multiline={ false }
											disableLineBreaks={ true }
										/>
									</div>
									{ ! hideBranding && (
										<FooterBranding
											editing={ true }
											trackRef="cs-forms-feedback"
											message={ __(
												'Collect your own feedback with Crowdsignal',
												'crowdsignal-forms'
											) }
										/>
									) }
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
									{ ! hideBranding && (
										<FooterBranding
											editing={ true }
											trackRef="cs-forms-feedback"
											message={ __(
												'Collect your own feedback with Crowdsignal',
												'crowdsignal-forms'
											) }
										/>
									) }
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
