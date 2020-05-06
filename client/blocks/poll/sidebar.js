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
} from '@wordpress/components';
import {
	InspectorControls,
	URLInput,
	PanelColorSettings,
	ContrastChecker,
} from '@wordpress/block-editor';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ConfirmMessageType,
	FontFamilyType,
	PollStatus,
	ClosedPollState,
} from './constants';
import { __ } from 'lib/i18n';

const SideBar = ( {
	attributes,
	setAttributes,
	fallbackBackgroundColor,
	fallbackTextColor,
	fallbackSubmitButtonBackgroundColor,
	fallbackSubmitButtonTextColor,
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

	const handleChangeFontFamily = ( font ) =>
		includes( FontFamilyType, font ) &&
		setAttributes( { fontFamily: font } );

	const handleChangeHasCaptchaProtection = ( hasCaptchaProtection ) =>
		setAttributes( { hasCaptchaProtection } );

	const handleChangeHasOneResponsePerComputer = (
		hasOneResponsePerComputer
	) => setAttributes( { hasOneResponsePerComputer } );

	const handleChangeHasRandomOrderOfAnswers = ( hasRandomOrderOfAnswers ) =>
		setAttributes( { hasRandomOrderOfAnswers } );

	const handleChangeSubmitButtonTextColor = ( submitButtonTextColor ) =>
		setAttributes( { submitButtonTextColor } );

	const handleChangeSubmitButtonBackgroundColor = (
		submitButtonBackgroundColor
	) => setAttributes( { submitButtonBackgroundColor } );

	const handleChangePollStatus = ( pollStatus ) =>
		includes( PollStatus, pollStatus ) && setAttributes( { pollStatus } );

	const handleChangeClosedPollState = ( closedPollState ) =>
		includes( ClosedPollState, closedPollState ) &&
		setAttributes( { closedPollState } );

	const handleChangeCloseAfterDateTime = ( closedAfterDateTime ) => {
		const dateTime = new Date( closedAfterDateTime );
		setAttributes( { closedAfterDateTime: dateTime.toISOString() } );
	};

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Data Settings' ) }>
				<p>
					{ __( 'Manage and view the poll results on: ' ) }
					<ExternalLink href="https://www.crowdsignal.com">
						crowdsignal.com
					</ExternalLink>
				</p>

				<p>
					<Button
						href="https://app.crowdsignal.com/polls/null/results"
						isDefault
						target="_blank"
					>
						{ __( 'View Results' ) }
					</Button>
				</p>

				<TextControl
					value={ attributes.title }
					label={ __( 'Title of the Poll Block' ) }
					onChange={ handleChangeTitle }
				/>

				<p className="wp-block-crowdsignal-forms__more-info-link">
					<ExternalLink
						href="http://www.crowdsignal.com"
						className="wp-block-crowdsiglan-forms__more-info-link-text"
					>
						{ __( 'What is Crowdsignal?' ) }
					</ExternalLink>
				</p>
			</PanelBody>
			<PanelBody title={ __( 'Confirmation Message' ) }>
				<SelectControl
					value={ attributes.confirmMessageType }
					label={ __( 'On Submission' ) }
					options={ [
						{
							label: __( 'Show Results' ),
							value: ConfirmMessageType.RESULTS,
						},
						{
							label: __( 'Show "Thank You" message' ),
							value: ConfirmMessageType.THANK_YOU,
						},
						{
							label: __( 'Show a custom text message' ),
							value: ConfirmMessageType.CUSTOM_TEXT,
						},
						{
							label: __( 'Redirect to another webpage' ),
							value: ConfirmMessageType.REDIRECT,
						},
					] }
					onChange={ handleChangeConfirmMessageType }
				/>

				{ ConfirmMessageType.CUSTOM_TEXT ===
					attributes.confirmMessageType && (
					<TextareaControl
						value={ attributes.customConfirmMessage }
						label={ __( 'Message Text' ) }
						placeholder={ __( 'Thank you for your submission!' ) }
						onChange={ handleChangeCustomConfirmMessage }
					/>
				) }

				{ ConfirmMessageType.REDIRECT ===
					attributes.confirmMessageType && (
					<URLInput
						className="wp-block-crowdsignal-forms__redirect-url"
						value={ attributes.redirectAddress }
						label={ __( 'Redirect Address' ) }
						onChange={ handleChangeRedirectAddress }
					/>
				) }
			</PanelBody>
			<PanelBody title={ __( 'Poll Status' ) }>
				<SelectControl
					value={ attributes.pollStatus }
					label={ __( 'Currently' ) }
					options={ [
						{
							label: __( 'Open' ),
							value: PollStatus.OPEN,
						},
						{
							label: __( 'Closed After' ),
							value: PollStatus.CLOSED_AFTER,
						},
						{
							label: __( 'Closed' ),
							value: PollStatus.CLOSED,
						},
					] }
					onChange={ handleChangePollStatus }
				/>

				{ PollStatus.CLOSED_AFTER === attributes.pollStatus && (
					<TimePicker
						currentTime={ attributes.closedAfterDateTime }
						label={ __( 'Close poll on' ) }
						onChange={ handleChangeCloseAfterDateTime }
						is12Hour={ true }
					/>
				) }

				{ PollStatus.OPEN !== attributes.pollStatus && (
					<SelectControl
						value={ attributes.closedPollState }
						label={ __( 'When poll is closed' ) }
						options={ [
							{
								label: __( 'Show Results' ),
								value: ClosedPollState.SHOW_RESULTS,
							},
							{
								label: __( 'Show Poll With "Closed" Banner' ),
								value: ClosedPollState.SHOW_CLOSED_BANNER,
							},
							{
								label: __( 'Hide Poll' ),
								value: ClosedPollState.HIDDEN,
							},
						] }
						onChange={ handleChangeClosedPollState }
					/>
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Color Settings' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text Color' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background Color' ),
					},
					{
						value: attributes.submitButtonTextColor,
						onChange: handleChangeSubmitButtonTextColor,
						label: __( 'Submit Button Text Color' ),
					},
					{
						value: attributes.submitButtonBackgroundColor,
						onChange: handleChangeSubmitButtonBackgroundColor,
						label: __( 'Submit Button Background Color' ),
					},
				] }
			/>
			<ContrastChecker
				textColor={ attributes.textColor }
				backgroundColor={ attributes.backgroundColor }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
			<ContrastChecker
				textColor={ attributes.submitButtonTextColor }
				backgroundColor={ attributes.submitButtonBackgroundColor }
				fallbackBackgroundColor={ fallbackSubmitButtonBackgroundColor }
				fallbackTextColor={ fallbackSubmitButtonTextColor }
			/>
			<PanelBody title={ __( 'Text Settings' ) } initialOpen={ false }>
				<SelectControl
					value={ attributes.fontFamily }
					label={ __( 'Choose Font-Family' ) }
					options={ [
						{
							label: __( 'Default Theme Font' ),
							value: FontFamilyType.THEME_DEFAULT,
						},
						{
							label: __( 'Georgia' ),
							value: FontFamilyType.GEORGIA,
							style: { color: 'red' },
						},
						{
							label: __( 'Palatino' ),
							value: FontFamilyType.PALATINO,
						},
						{
							label: __( 'Times New Roman' ),
							value: FontFamilyType.TIMES_NEW_ROMAN,
						},
						{
							label: __( 'Arial' ),
							value: FontFamilyType.ARIAL,
						},
						{
							label: __( 'Comic Sans' ),
							value: FontFamilyType.COMIC_SANS,
						},
						{
							label: __( 'Impact' ),
							value: FontFamilyType.IMPACT,
						},
						{
							label: __( 'Lucida' ),
							value: FontFamilyType.LUCIDA,
						},
						{
							label: __( 'Tahoma' ),
							value: FontFamilyType.TAHOMA,
						},
						{
							label: __( 'Trebuchet' ),
							value: FontFamilyType.TREBUCHET,
						},
						{
							label: __( 'Verdana' ),
							value: FontFamilyType.VERDANA,
						},
						{
							label: __( 'Courier' ),
							value: FontFamilyType.COURIER,
						},
					] }
					onChange={ handleChangeFontFamily }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Answer Settings' ) }>
				<CheckboxControl
					checked={ attributes.hasCaptchaProtection }
					label={ __( 'Enable Captcha Protection' ) }
					onChange={ handleChangeHasCaptchaProtection }
				/>
				<CheckboxControl
					checked={ attributes.hasOneResponsePerComputer }
					label={ __( 'One Response Per Computer' ) }
					onChange={ handleChangeHasOneResponsePerComputer }
				/>
				<CheckboxControl
					checked={ attributes.hasRandomOrderOfAnswers }
					label={ __( 'Random Order of Answers' ) }
					onChange={ handleChangeHasRandomOrderOfAnswers }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default SideBar;
