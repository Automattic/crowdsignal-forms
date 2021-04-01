/**
 * External dependencies
 */
import React, { useLayoutEffect, useState } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress depenencies
 */
import { RichText } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import SignalWarning from 'components/signal-warning';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getAlignmentClassNames } from 'components/feedback/util';
import { useAccountInfo } from 'data/hooks';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars } from './util';

// Probably dependent on the button style
const PADDING = 20;

const getHorizontalPosition = ( position ) => {
	const body = document.body;
	const editorWrapper = document.getElementsByClassName(
		'interface-interface-skeleton__content'
	)[ 0 ];

	if ( ! editorWrapper ) {
		return {};
	}

	const wrapperPos = editorWrapper.getBoundingClientRect();

	if ( position === 'right' ) {
		return {
			left: null,
			right:
				PADDING +
				( body.offsetWidth - wrapperPos.width - wrapperPos.x ),
		};
	}

	return {
		left: PADDING + wrapperPos.x,
		right: null,
	};
};

const getVerticalPadding = ( position ) => {
	const body = document.body;
	const editorWrapper = document.getElementsByClassName(
		'interface-interface-skeleton__content'
	)[ 0 ];

	if ( ! editorWrapper ) {
		return {};
	}

	const wrapperPos = editorWrapper.getBoundingClientRect();

	if ( position === 'bottom' ) {
		return {
			bottom:
				PADDING +
				( body.offsetHeight - wrapperPos.height - wrapperPos.y ),
			top: null,
		};
	}

	if ( position === 'top' ) {
		return {
			bottom: null,
			top: PADDING + wrapperPos.y + 50, // 50 to account for the toolbar
		};
	}

	return {
		bottom: null,
		top: PADDING + wrapperPos.y + wrapperPos.height / 2, // + own height
	};
};


const EditFeedbackBlock = ( props ) => {
	const {
		attributes,
		activeSidebar,
		editorFeatures,
		fallbackStyles,
		isSelected,
		setAttributes
	} = props;

	const accountInfo = useAccountInfo();

	useLayoutEffect( () => {
		props.setPosition( {
			...getHorizontalPosition( attributes.x ),
			...getVerticalPadding( attributes.y ),
		} );
	}, [
		activeSidebar,
		editorFeatures.fullscreenMode,
		props.setPosition,
		attributes.x,
		attributes.y,
	] );

	const setPosition = ( x, y ) => setAttributes( { x, y } );

	const handleChangeAttribute = ( key ) =>
		( value ) => setAttributes( { [ key ]: value } );

	const shouldPromote = get( accountInfo, [
		'signalCount',
		'shouldDisplay',
	] );

	const signalWarning =
		shouldPromote &&
			get( accountInfo, [ 'signalCount', 'count' ] ) >=
				get( accountInfo, [ 'signalCount', 'userLimit' ] );

	const classes = classnames(
		'crowdsignal-forms-feedback',
		getAlignmentClassNames( attributes.x, attributes.y )
	);

	return (
		<ConnectToCrowdsignal>
			<Toolbar
				onChangePosition={ setPosition }
				{ ...props }
			/>
			<Sidebar
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
				{ ...props }
			/>

			<div
				className={ classes }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				{ isSelected && (
					<div className="crowdsignal-forms-feedback__popover">
						<RichText
							tagName="h3"
							className="crowdsignal-forms-feedback__header"
							onChange={ handleChangeAttribute( 'header' ) }
							value={ attributes.header }
							allowedFormats={ [] }
						/>

						<TextareaControl
							className="crowdsignal-forms-feedback__input"
							rows={ 6 }
							onChange={ handleChangeAttribute( 'feedbackPlaceholder' ) }
							value={ attributes.feedbackPlaceholder }
						/>

						<TextControl
							className="crowdsignal-forms-feedback__input"
							onChange={ handleChangeAttribute( 'emailPlaceholder' ) }
							value={ attributes.emailPlaceholder }
						/>

						<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
							<RichText
								className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
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

				<button className="crowdsignal-forms-feedback__trigger"></button>
			</div>

			{ props.renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withSelect( ( select ) => ( {
		activeSidebar: select( 'core/edit-post' ).getActiveGeneralSidebarName(),
		editorFeatures: select( 'core/edit-post' ).getPreference( 'features' ),
	} ) ),
	withFallbackStyles,
] )( EditFeedbackBlock );
