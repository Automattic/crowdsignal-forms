/**
 * External dependencies
 */
import React, { useLayoutEffect, useState } from 'react';
import classnames from 'classnames';

/**
 * WordPress depenencies
 */
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { withFallbackStyles } from 'components/with-fallback-styles';
import Toolbar from './toolbar';

// Probably dependent on the button style
const PADDING = 20;

const getHorizontalPosition = ( position ) => {
	const body = document.body;
	const editorWrapper = document.getElementsByClassName(
		'edit-post-visual-editor'
	)[ 0 ];

	if ( ! editorWrapper ) {
		return {};
	}

	const wrapperPos = editorWrapper.getBoundingClientRect();

	if ( 0 < position ) {
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
		'edit-post-visual-editor'
	)[ 0 ];

	if ( ! editorWrapper ) {
		return {};
	}

	const wrapperPos = editorWrapper.getBoundingClientRect();

	if ( position < 0 ) {
		return {
			bottom:
				PADDING +
				( body.offsetHeight - wrapperPos.height - wrapperPos.y ),
			top: null,
		};
	}

	if ( 0 < position ) {
		return {
			bottom: null,
			top: PADDING + wrapperPos.y,
		};
	}

	return {
		bottom: null,
		top: PADDING + wrapperPos.y + wrapperPos.height / 2, // + own height
	};
};

const EditFeedbackBlock = ( props ) => {
	const [ position, setPosition ] = useState( [ 1, -1 ] );

	const { activeSidebar, editorFeatures, isSelected } = props;

	useLayoutEffect( () => {
		const pos = {
			...getHorizontalPosition( position[ 0 ] ),
			...getVerticalPadding( position[ 1 ] ),
		};

		props.setPosition( pos );
	}, [
		activeSidebar,
		editorFeatures.fullscreenMode,
		props.setPosition,
		position,
	] );

	const classes = classnames( 'crowdsignal-forms-feedback', {
		'align-left': position[ 0 ] < 0,
		'align-right': position[ 0 ] > 0,
		'align-top': position[ 1 ] > 0,
		'align-center': position[ 1 ] === 0,
		'align-bottom': position[ 1 ] < 0,
	} );

	return (
		<ConnectToCrowdsignal>
			<Toolbar
				onChangePosition={ setPosition }
				position={ position }
				{ ...props }
			/>

			<div className={ classes }>
				{ position[ 0 ] < 0 && (
					<button className="crowdsignal-forms-feedback__trigger-button"></button>
				) }

				{ isSelected && (
					<div className="crowdsignal-forms-feedback__popover">
						Here Be Dragons
					</div>
				) }

				{ 0 < position[ 0 ] && (
					<button className="crowdsignal-forms-feedback__trigger-button"></button>
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
	} ) ),
	withFallbackStyles,
] )( EditFeedbackBlock );
