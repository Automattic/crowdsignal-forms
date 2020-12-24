/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	CheckboxControl,
	TimePicker,
	ExternalLink,
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import {
	InspectorControls,
	URLInput,
	PanelColorSettings,
	ContrastChecker,
} from '@wordpress/block-editor';
import { includes } from 'lodash';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ConfirmMessageType,
	FontFamilyType,
	PollStatus,
	ClosedPollState,
	AnswerStyle,
	ButtonAlignment,
} from './constants';
import { getAnswerStyle } from './util';
import SidebarPromote from 'components/sidebar-promote';

const SideBar = ( {
	attributes,
	className,
	setAttributes,
	fallbackBackgroundColor,
	fallbackTextColor,
	fallbackSubmitButtonBackgroundColor,
	fallbackSubmitButtonTextColor,
	viewResultsUrl,
	shouldPromote,
	signalWarning,
} ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const handleChangeConfirmMessageType = ( type ) =>
		includes( ConfirmMessageType, type ) &&
		setAttributes( { confirmMessageType: type } );

	const handleChangeCustomConfirmMessage = ( customConfirmMessage ) =>
		setAttributes( { customConfirmMessage } );

	const handleChangeRedirectAddress = ( redirectAddress ) =>
		setAttributes( { redirectAddress } );

	const handleChangeTextColor = ( textColor ) =>
		setAttributes( { textColor } );

	const handleChangeBackgroundColor = ( backgroundColor ) =>
		setAttributes( { backgroundColor } );

	const handleChangeBorderColor = ( borderColor ) =>
		setAttributes( { borderColor } );

	const handleChangeBorderRadius = ( borderRadius ) => {
		setAttributes( {
			borderRadius: parseInt( borderRadius, 10 ) || 0,
		} );
	};

	const handleChangeBorderWidth = ( borderWidth ) => {
		setAttributes( {
			borderWidth: parseInt( borderWidth, 10 ) || 0,
		} );
	};

	const handleChangeFontFamily = ( font ) =>
		includes( FontFamilyType, font ) &&
		setAttributes( { fontFamily: font } );

	const handleChangeHasOneResponsePerComputer = (
		hasOneResponsePerComputer
	) => setAttributes( { hasOneResponsePerComputer } );

	const handleChangeRandomizeAnswers = ( randomizeAnswers ) =>
		setAttributes( { randomizeAnswers } );

	const handleChangeSubmitButtonTextColor = ( submitButtonTextColor ) =>
		setAttributes( { submitButtonTextColor } );

	const handleChangeSubmitButtonBackgroundColor = (
		submitButtonBackgroundColor
	) => setAttributes( { submitButtonBackgroundColor } );

	const handleChangePollStatus = ( pollStatus ) => {
		if ( ! includes( PollStatus, pollStatus ) ) {
			return;
		}

		// closedAfterDateTime MUST be set when pollStatus is set to CLOSED_AFTER
		setAttributes( {
			closedAfterDateTime:
				pollStatus === PollStatus.CLOSED_AFTER
					? new Date(
							new Date().getTime() + 24 * 60 * 60 * 1000
					  ).toISOString()
					: null,
			pollStatus,
		} );
	};

	const handleChangeClosedPollState = ( closedPollState ) =>
		includes( ClosedPollState, closedPollState ) &&
		setAttributes( { closedPollState } );

	const handleChangeCloseAfterDateTime = ( closedAfterDateTime ) => {
		const dateTime = new Date( closedAfterDateTime );
		setAttributes( { closedAfterDateTime: dateTime.toISOString() } );
	};

	const handleChangeHasBoxShadow = ( hasBoxShadow ) => {
		setAttributes( { hasBoxShadow } );
	};

	const handleChangeButtonAlignment = ( buttonAlignment ) =>
		setAttributes( { buttonAlignment } );

	const handleChangeWidth = ( width ) =>
		setAttributes( { width: parseInt( width, 10 ) } );

	const handleResetWidth = () =>
		setAttributes( {
			width: 100,
		} );

	const resultsLinkEnabled = '' !== viewResultsUrl;

	const answerStyle = getAnswerStyle( attributes, className );

	// https://github.com/Automattic/crowdsignal-forms/issues/14
	if ( ConfirmMessageType.REDIRECT === attributes.confirmMessageType ) {
		attributes.confirmMessageType = ConfirmMessageType.THANK_YOU;
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<p>
					{ resultsLinkEnabled
						? __( 'Manage results on ', 'crowdsignal-forms' )
						: __(
								'Publish this post to enable results on ',
								'crowdsignal-forms'
						  ) }
					<ExternalLink
						href={
							resultsLinkEnabled
								? viewResultsUrl
								: 'https://www.crowdsignal.com'
						}
					>
						crowdsignal.com
					</ExternalLink>
				</p>
				<p>
					<Button
						href={ viewResultsUrl }
						isSecondary
						target="_blank"
						disabled={ ! resultsLinkEnabled }
					>
						{ __( 'View results', 'crowdsignal-forms' ) }
					</Button>
				</p>

				<TextControl
					value={ decodeEntities(
						attributes.title ?? attributes.question
					) }
					label={ __(
						'Title of the poll block',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeTitle }
				/>
				{ shouldPromote && (
					<SidebarPromote signalWarning={ signalWarning } />
				) }
			</PanelBody>
			<PanelBody
				title={ __( 'Confirmation message', 'crowdsignal-forms' ) }
				initialOpen={ false }
			>
				<SelectControl
					value={ attributes.confirmMessageType }
					label={ __( 'On submission', 'crowdsignal-forms' ) }
					options={ [
						{
							label: __( 'Show results', 'crowdsignal-forms' ),
							value: ConfirmMessageType.RESULTS,
						},
						{
							label: __(
								'Show "Thank You" message',
								'crowdsignal-forms'
							),
							value: ConfirmMessageType.THANK_YOU,
						},
						{
							label: __(
								'Show a custom text message',
								'crowdsignal-forms'
							),
							value: ConfirmMessageType.CUSTOM_TEXT,
						},
						// https://github.com/Automattic/crowdsignal-forms/issues/14
						// {
						// 	label: __(
						// 		'Redirect to another webpage',
						// 		'crowdsignal-forms'
						// 	),
						// 	value: ConfirmMessageType.REDIRECT,
						// },
					] }
					onChange={ handleChangeConfirmMessageType }
				/>

				{ ConfirmMessageType.CUSTOM_TEXT ===
					attributes.confirmMessageType && (
					<TextareaControl
						value={ attributes.customConfirmMessage }
						label={ __( 'Message text', 'crowdsignal-forms' ) }
						placeholder={ __(
							'Thanks for voting!',
							'crowdsignal-forms'
						) }
						onChange={ handleChangeCustomConfirmMessage }
					/>
				) }

				{ ConfirmMessageType.REDIRECT ===
					attributes.confirmMessageType && (
					<URLInput
						className="crowdsignal-forms__redirect-url"
						value={ attributes.redirectAddress }
						label={ __( 'Redirect address', 'crowdsignal-forms' ) }
						onChange={ handleChangeRedirectAddress }
					/>
				) }
			</PanelBody>
			<PanelBody
				title={ __( 'Poll status', 'crowdsignal-forms' ) }
				initialOpen={ false }
			>
				<SelectControl
					value={ attributes.pollStatus }
					label={ __( 'Currently', 'crowdsignal-forms' ) }
					options={ [
						{
							label: __( 'Open', 'crowdsignal-forms' ),
							value: PollStatus.OPEN,
						},
						{
							label: __( 'Closed after', 'crowdsignal-forms' ),
							value: PollStatus.CLOSED_AFTER,
						},
						{
							label: __( 'Closed', 'crowdsignal-forms' ),
							value: PollStatus.CLOSED,
						},
					] }
					onChange={ handleChangePollStatus }
				/>

				{ PollStatus.CLOSED_AFTER === attributes.pollStatus && (
					<TimePicker
						currentTime={ attributes.closedAfterDateTime }
						label={ __( 'Close poll on', 'crowdsignal-forms' ) }
						onChange={ handleChangeCloseAfterDateTime }
						is12Hour={ true }
					/>
				) }

				{ PollStatus.OPEN !== attributes.pollStatus && (
					<SelectControl
						value={ attributes.closedPollState }
						label={ __(
							'When poll is closed',
							'crowdsignal-forms'
						) }
						options={ [
							{
								label: __(
									'Show results',
									'crowdsignal-forms'
								),
								value: ClosedPollState.SHOW_RESULTS,
							},
							{
								label: __(
									'Show poll with "Closed" banner',
									'crowdsignal-forms'
								),
								value: ClosedPollState.SHOW_CLOSED_BANNER,
							},
							{
								label: __( 'Hide poll', 'crowdsignal-forms' ),
								value: ClosedPollState.HIDDEN,
							},
						] }
						onChange={ handleChangeClosedPollState }
					/>
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Block styling', 'crowdsignal-forms' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border color', 'crowdsignal-forms' ),
					},
				] }
			>
				<ContrastChecker
					textColor={ attributes.textColor }
					backgroundColor={ attributes.backgroundColor }
					fallbackBackgroundColor={ fallbackBackgroundColor }
					fallbackTextColor={ fallbackTextColor }
				/>
				<SelectControl
					value={ attributes.fontFamily }
					label={ __( 'Choose font', 'crowdsignal-forms' ) }
					options={ [
						{
							label: __(
								'Default theme font',
								'crowdsignal-forms'
							),
							value: FontFamilyType.THEME_DEFAULT,
						},
						{
							label: 'Alegreya Sans',
							value: FontFamilyType.ALEGREYA_SANS,
						},
						{
							label: 'Arial',
							value: FontFamilyType.ARIAL,
						},
						{
							label: 'Cabin',
							value: FontFamilyType.CABIN,
						},
						{
							label: 'Chivo',
							value: FontFamilyType.CHIVO,
						},
						{
							label: 'Courier',
							value: FontFamilyType.COURIER,
						},
						{
							label: 'Fira Sans',
							value: FontFamilyType.FIRA_SANS,
						},
						{
							label: 'Georgia',
							value: FontFamilyType.GEORGIA,
						},
						{
							label: 'Impact',
							value: FontFamilyType.IMPACT,
						},
						{
							label: 'Josefin Sans',
							value: FontFamilyType.JOSEFIN_SANS,
						},
						{
							label: 'Lato',
							value: FontFamilyType.LATO,
						},
						{
							label: 'Libre Franklin',
							value: FontFamilyType.LIBRE_FRANKLIN,
						},
						{
							label: 'Lucida',
							value: FontFamilyType.LUCIDA,
						},
						{
							label: 'Montserrat',
							value: FontFamilyType.MONTSERRAT,
						},
						{
							label: 'Nunito',
							value: FontFamilyType.NUNITO,
						},
						{
							label: 'Open Sans',
							value: FontFamilyType.OPEN_SANS,
						},
						{
							label: 'Oswald',
							value: FontFamilyType.OSWALD,
						},
						{
							label: 'Overpass',
							value: FontFamilyType.OVERPASS,
						},
						{
							label: 'Palatino',
							value: FontFamilyType.PALATINO,
						},
						{
							label: 'Poppins',
							value: FontFamilyType.POPPINS,
						},
						{
							label: 'Raleway',
							value: FontFamilyType.RALEWAY,
						},
						{
							label: 'Roboto',
							value: FontFamilyType.ROBOTO,
						},
						{
							label: 'Rubik',
							value: FontFamilyType.RUBIK,
						},
						{
							label: 'Tahoma',
							value: FontFamilyType.TAHOMA,
						},
						{
							label: 'Times New Roman',
							value: FontFamilyType.TIMES_NEW_ROMAN,
						},
						{
							label: 'Trebuchet',
							value: FontFamilyType.TREBUCHET,
						},
						{
							label: 'Verdana',
							value: FontFamilyType.VERDANA,
						},
					] }
					onChange={ handleChangeFontFamily }
				/>
				{ attributes.align !== 'full' && (
					<div className="crowdsignal-forms__row">
						<TextControl
							type="number"
							label={ __( 'Width (%)', 'crowdsignal-forms' ) }
							value={ attributes.width }
							onChange={ handleChangeWidth }
						/>
						<Button
							isSmall
							className="crowdsignal-forms__reset-width-button"
							onClick={ handleResetWidth }
						>
							{ __( 'Reset', 'crowdsignal-forms' ) }
						</Button>
					</div>
				) }
				<div className="crowdsignal-forms__row">
					<TextControl
						label={ __( 'Border thickness', 'crowdsignal-forms' ) }
						value={ attributes.borderWidth }
						onChange={ handleChangeBorderWidth }
						type="number"
						className="crowdsignal-forms__small-text-input"
					/>
					<TextControl
						label={ __( 'Corner radius', 'crowdsignal-forms' ) }
						value={ attributes.borderRadius }
						onChange={ handleChangeBorderRadius }
						type="number"
						className="crowdsignal-forms__small-text-input"
					/>
				</div>
				<ToggleControl
					label={ __( 'Drop shadow', 'crowdsignal-forms' ) }
					checked={ attributes.hasBoxShadow }
					onChange={ handleChangeHasBoxShadow }
				/>
			</PanelColorSettings>
			<PanelColorSettings
				title={ __( 'Button styling', 'crowdsignal-forms' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.submitButtonTextColor,
						onChange: handleChangeSubmitButtonTextColor,
						label: __( 'Text color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.submitButtonBackgroundColor,
						onChange: handleChangeSubmitButtonBackgroundColor,
						label: __( 'Background color', 'crowdsignal-forms' ),
					},
				] }
			>
				<ContrastChecker
					textColor={ attributes.submitButtonTextColor }
					backgroundColor={ attributes.submitButtonBackgroundColor }
					fallbackBackgroundColor={
						fallbackSubmitButtonBackgroundColor
					}
					fallbackTextColor={ fallbackSubmitButtonTextColor }
				/>
				{ AnswerStyle.BUTTON === answerStyle && (
					<SelectControl
						value={ attributes.buttonAlignment }
						label={ __( 'Alignment', 'crowdsignal-forms' ) }
						options={ [
							{
								value: ButtonAlignment.LIST,
								label: __( 'List', 'crowdsignal-forms' ),
							},
							{
								value: ButtonAlignment.INLINE,
								label: __( 'Inline', 'crowdsignal-forms' ),
							},
						] }
						onChange={ handleChangeButtonAlignment }
					/>
				) }
			</PanelColorSettings>
			<PanelBody
				title={ __( 'Answer settings', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<CheckboxControl
					checked={ attributes.hasOneResponsePerComputer }
					label={ __(
						'One response per computer',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeHasOneResponsePerComputer }
				/>
				<CheckboxControl
					checked={ attributes.randomizeAnswers }
					label={ __(
						'Randomize answer order',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeRandomizeAnswers }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default SideBar;
