/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { times, get } from 'lodash';
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import { TextareaControl } from '@wordpress/components';
import { RichText } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { views } from './constants';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars } from './util';
import EditorNotice from 'components/editor-notice';
import FooterBranding from 'components/footer-branding';
import SignalWarning from 'components/signal-warning';
import PromotionalTooltip from 'components/promotional-tooltip';
import { STORE_NAME } from 'state';
import withFseCheck from 'components/with-fse-check';
import useSurveyId from 'hooks/use-survey-id';

const EditNpsBlock = ( props ) => {
	const [ view, setView ] = useState( views.RATING );

	const {
		attributes,
		fallbackStyles,
		isSelected,
		setAttributes,
		renderStyleProbe,
	} = props;

	const {
		feedbackQuestion,
		ratingQuestion,
		isExample,
		viewThreshold,
		surveyClientId,
	} = attributes;

	// Generate surveyClientId for new blocks (including legacy blocks without one)
	useEffect( () => {
		if ( isExample || surveyClientId || attributes.surveyId ) {
			return;
		}
		setAttributes( { surveyClientId: uuidv4() } );
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

	const accountInfo = useSelect( ( select ) =>
		select( STORE_NAME ).getAccountInfo()
	);

	const resolvedSurveyId = useSurveyId( surveyClientId, 'nps' );

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
				resolvedSurveyId={ resolvedSurveyId }
				{ ...props }
			/>
			{ ! isExample && signalWarning && <SignalWarning /> }

			{ ! isExample && (
				<EditorNotice
					isDismissible={ false }
					icon="visibility"
					componentActions={ [
						// Temporarily disabled to prevent block render error,
						// until we can figure out why it is breaking (maybe a new WP version?)
						// <PostPreviewButton
						// 	key={ 1 }
						// 	className={ [
						// 		'is-secondary',
						// 		'components-notice__action',
						// 		'crowdsignal-forms-nps__preview-button',
						// 		attributes.surveyId ? '' : 'is-disabled',
						// 	] }
						// 	textContent={ __( 'Preview', 'crowdsignal-forms' ) }
						// />,
					] }
				>
					{ sprintf(
						/* translators: %d: number of pageviews */
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
								message={ __(
									'Collect your own feedback with Crowdsignal',
									'crowdsignal-forms'
								) }
							>
								<PromotionalTooltip />
							</FooterBranding>
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
								message={ __(
									'Collect your own feedback with Crowdsignal',
									'crowdsignal-forms'
								) }
							>
								<PromotionalTooltip />
							</FooterBranding>
						) }
					</div>
				</div>
			) }

			{ renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withFallbackStyles,
	withFseCheck,
] )( EditNpsBlock );
