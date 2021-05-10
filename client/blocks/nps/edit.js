/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { times, get } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { TextareaControl } from '@wordpress/components';
import { RichText } from '@wordpress/block-editor';
import { PostPreviewButton } from '@wordpress/editor';
import { dispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { useAutosave } from 'components/use-autosave';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { updateNps } from 'data/nps/edit';
import { views } from './constants';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars } from './util';
import { useAccountInfo } from 'data/hooks';
import EditorNotice from 'components/editor-notice';
import FooterBranding from 'components/footer-branding';
import SignalWarning from 'components/signal-warning';
import RetryNotice from 'components/retry-notice';

const EditNpsBlock = ( props ) => {
	const [ view, setView ] = useState( views.RATING );

	const {
		attributes,
		clientId,
		fallbackStyles,
		isSelected,
		setAttributes,
		renderStyleProbe,
		sourceLink,
	} = props;

	const {
		feedbackQuestion,
		ratingQuestion,
		surveyId,
		title,
		isExample,
		viewThreshold,
	} = attributes;

	const { error: saveError, save: saveBlock } = useAutosave(
		async ( data ) => {
			dispatch( 'core/editor' ).lockPostSaving( clientId );

			try {
				const response = await updateNps( {
					feedbackQuestion: data.feedbackQuestion,
					ratingQuestion: data.ratingQuestion,
					sourceLink: data.sourceLink,
					surveyId: data.surveyId,
					title: data.title || data.ratingQuestion,
				} );

				if ( ! data.surveyId ) {
					setAttributes( { surveyId: response.surveyId } );
				}
			} finally {
				dispatch( 'core/editor' ).unlockPostSaving( clientId );
			}
		},
		{
			feedbackQuestion,
			ratingQuestion,
			sourceLink,
			surveyId,
			title,
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

		setView( views.RATING );
	}, [ isSelected ] );

	const handleChangeAttribute = ( attribute ) => ( value ) =>
		setAttributes( {
			[ attribute ]: value,
		} );

	const classes = classnames( 'crowdsignal-forms-nps', {
		'is-inactive': ! isExample && ! isSelected,
	} );

	const accountInfo = get( useAccountInfo(), 'data', {} );

	const hideBranding = get( accountInfo, 'capabilities', [] ).includes(
		'hide-branding'
	);

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
			blockIcon={ null }
			blockName={ __( 'Crowdsignal NPS', 'crowdsignal-forms' ) }
		>
			<Toolbar
				currentView={ view }
				onViewChange={ setView }
				{ ...props }
			/>
			<Sidebar
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
				{ ...props }
			/>
			{ ! isExample && signalWarning && <SignalWarning /> }
			{ ! isExample && saveError && (
				<RetryNotice retryHandler={ saveBlock } />
			) }

			{ ! isExample && (
				<EditorNotice
					isDismissible={ false }
					icon="visibility"
					componentActions={ [
						<PostPreviewButton
							key={ 1 }
							className={ [
								'is-secondary',
								'components-notice__action',
								'crowdsignal-forms-nps__preview-button',
								attributes.surveyId ? '' : 'is-disabled',
							] }
							textContent={ __( 'Preview', 'crowdsignal-forms' ) }
						/>,
					] }
				>
					{ sprintf(
						// translators: %d: number of pageviews
						_n(
							'This block will appear as a popup window to people who have visited this page at least %d time.',
							'This block will appear as a popup window to people who have visited this page at least %d times.',
							viewThreshold,
							'crowdsignal-forms'
						),
						viewThreshold
					) }
				</EditorNotice>
			) }

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
						value={ ratingQuestion }
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
								multiline={ false }
								disableLineBreaks={ true }
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
								multiline={ false }
								disableLineBreaks={ true }
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

						{ ! hideBranding && (
							<FooterBranding
								trackRef="cs-forms-nps"
								editing={ true }
								message={ __(
									'Collect your own feedback with Crowdsignal',
									'crowdsignal-forms'
								) }
							/>
						) }
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
							value={ feedbackQuestion }
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

						<div className="wp-block-button crowdsignal-forms-nps__feedback-button-wrapper">
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

						{ ! hideBranding && (
							<FooterBranding
								trackRef="cs-forms-nps"
								editing={ true }
								message={ __(
									'Collect your own feedback with Crowdsignal',
									'crowdsignal-forms'
								) }
							/>
						) }
					</div>
				</div>
			) }

			{ renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withSelect( ( select ) => ( {
		sourceLink: select( 'core/editor' ).getPermalink(),
	} ) ),
	withFallbackStyles,
] )( EditNpsBlock );
