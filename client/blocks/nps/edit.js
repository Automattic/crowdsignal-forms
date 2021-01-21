/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { pick, tap, times } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Icon, Notice, TextareaControl } from '@wordpress/components';
import { RichText } from '@wordpress/block-editor';
import { dispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { updateNps } from 'data/nps';
import { views } from './constants';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars } from './util';

const EditNpsBlock = ( props ) => {
	const [ view, setView ] = useState( views.RATING );

	const {
		attributes,
		clientId,
		fallbackStyles,
		isSelected,
		postPreviewLink,
		setAttributes,
		renderStyleProbe,
	} = props;

	useEffect( () => {
		if ( isSelected ) {
			return;
		}

		setView( views.RATING );
	}, [ isSelected ] );

	const handleChangeAttribute = ( attribute ) => ( value ) =>
		setAttributes( {
			[ attribute ]: value,
		} );

	const handleSaveNPS = async () => {
		dispatch( 'core/editor' ).lockPostSaving( clientId );

		try {
			const { surveyId } = await updateNps(
				tap(
					pick( attributes, [
						'feedbackQuestion',
						'ratingQuestion',
						'surveyId',
						'title',
					] ),
					( data ) => {
						if ( ! data.title ) {
							data.title = data.ratingQuestion;
						}
					}
				)
			);

			if ( attributes.surveyId ) {
				return;
			}

			setAttributes( { surveyId } );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		} finally {
			dispatch( 'core/editor' ).unlockPostSaving( clientId );
		}
	};

	const classes = classnames( 'crowdsignal-forms-nps', {
		'is-inactive': ! isSelected,
	} );

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal NPS', 'crowdsignal-forms' ) }
		>
			<Toolbar
				currentView={ view }
				onViewChange={ setView }
				{ ...props }
			/>
			<Sidebar { ...props } />

			<button onClick={ handleSaveNPS }>
				{ __( 'Save', 'crowdsignal-forms' ) }
			</button>

			<Notice
				className="crowdsignal-forms-nps__editor-notice"
				isDismissible={ false }
				actions={ [
					{
						label: __( 'Preview', 'crowdsignal-forms' ),
						onClick: () => window.open( postPreviewLink, 'blank' ),
					},
				] }
			>
				<Icon icon="visibility" />
				<span className="crowdsignal-forms-nps__editor-notice-text">
					{ __(
						'This block will appear as a popup window to people who have visited this page at least 3 times.',
						'crowdsignal-forms'
					) }
				</span>
			</Notice>

			{ ( view === views.RATING || ! isSelected ) && (
				<div
					className={ classes }
					style={ getStyleVars( attributes, fallbackStyles ) }
				>
					<RichText
						tagName="h3"
						className="crowdsignal-forms-nps__question"
						placeholder={ __(
							'Enter your rating question',
							'crowdsignal-forms'
						) }
						onChange={ handleChangeAttribute( 'ratingQuestion' ) }
						value={ attributes.ratingQuestion }
						allowedFormats={ [] }
					/>

					<div className="crowdsignal-forms-nps__rating">
						<div className="crowdsignal-forms-nps__rating-labels">
							<RichText
								tagName="span"
								placeholder={ __(
									'Not likely',
									'crowdsignal-forms'
								) }
								onChange={ handleChangeAttribute(
									'lowRatingLabel'
								) }
								value={ attributes.lowRatingLabel }
								allowedFormats={ [] }
							/>
							<RichText
								tagName="span"
								placeholder={ __(
									'Very likely',
									'crowdsignal-forms'
								) }
								onChange={ handleChangeAttribute(
									'highRatingLabel'
								) }
								value={ attributes.highRatingLabel }
								allowedFormats={ [] }
							/>
						</div>

						<div className="crowdsignal-forms-nps__rating-scale">
							{ times( 11, ( n ) => (
								<div
									key={ `rating-${ n }` }
									className="crowdsignal-forms-nps__rating-button"
								>
									{ n }
								</div>
							) ) }
						</div>
					</div>
				</div>
			) }

			{ view === views.FEEDBACK && isSelected && (
				<div
					className={ classes }
					style={ getStyleVars( attributes, fallbackStyles ) }
				>
					<div className="crowdsignal-forms-nps__feedback">
						<RichText
							tagName="h3"
							className="crowdsignal-forms-nps__question"
							placeholder={ __(
								'Enter your feedback question',
								'crowdsignal-forms'
							) }
							onChange={ handleChangeAttribute(
								'feedbackQuestion'
							) }
							value={ attributes.feedbackQuestion }
							allowedFormats={ [] }
						/>

						<TextareaControl
							className="crowdsignal-forms-nps__feedback-text"
							rows={ 6 }
							onChange={ handleChangeAttribute(
								'feedbackPlaceholder'
							) }
							value={ attributes.feedbackPlaceholder }
						/>

						<RichText
							className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
							onChange={ handleChangeAttribute(
								'submitButtonLabel'
							) }
							value={ attributes.submitButtonLabel }
							allowedFormats={ [] }
						/>
					</div>
				</div>
			) }

			{ renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withSelect( ( select ) => ( {
		postPreviewLink: select( 'core/editor' ).getEditedPostPreviewLink(),
	} ) ),
	withFallbackStyles,
] )( EditNpsBlock );
