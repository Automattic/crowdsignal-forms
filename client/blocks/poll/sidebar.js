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
import { ConfirmMessageType, FontFamilyType } from './constants';
import { __ } from 'lib/i18n';

const SideBar = ( { attributes, setAttributes } ) => {
	const {
		title,
		confirmMessageType,
		redirectAddress,
		customConfirmMessage,
		textColor,
		backgroundColor,
		fontFamily,
		hasCaptchaProtection,
		hasOneResponsePerComputer,
		hasRandomOrderOfAnswers,
	} = attributes;

	// todo: get fallback colors -- see https://github.com/Automattic/jetpack/blob/master/extensions/shared/submit-button.js

	const handleChangeTitle = ( title ) =>
		setAttributes( { title } );

	const handleChangeConfirmMessageType = ( type ) =>
		includes( ConfirmMessageType, type ) && setAttributes( { confirmMessageType: type } );

	const handleChangeCustomConfirmMessage = ( customConfirmMessage ) =>
		setAttributes( { customConfirmMessage } );

	const handleChangeRedirectAddress = ( redirectAddress ) =>
		setAttributes( { redirectAddress } );

	const handleChangeTextColor = ( textColor ) =>
		setAttributes( { textColor } );

	const handleChangeBackgroundColor = ( backgroundColor ) =>
		setAttributes( { backgroundColor } );

	const handleChangeFontFamily = ( font ) =>
		includes( FontFamilyType, font ) && setAttributes( { fontFamily: font } );

	const handleChangeHasCaptchaProtection = ( hasCaptchaProtection ) =>
		setAttributes( { hasCaptchaProtection } );

	const handleChangeHasOneResponsePerComputer = ( hasOneResponsePerComputer ) =>
		setAttributes( { hasOneResponsePerComputer } );

	const handleChangeHasRandomOrderOfAnswers = ( hasRandomOrderOfAnswers ) =>
		setAttributes( { hasRandomOrderOfAnswers } );

	const handleChangeSubmitButtonTextColor = ( submitButtonTextColor ) =>
		setAttributes( { submitButtonTextColor } );

	const handleChangeSubmitButtonBackgroundColor = ( submitButtonBackgroundColor ) =>
		setAttributes( { submitButtonBackgroundColor } );

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
					value={ title }
					label={ __( 'Title of the Poll Block' ) }
					onChange={ handleChangeTitle }
				/>

				<p className="wp-block-crowdsignal-forms__more-info-link">
					<ExternalLink
						href="http://www.crowdsignal.com"
						style={ { color: 'rgb( 159, 164, 169 )' } }
					>
						{ __( 'What is Crowdsignal?' ) }
					</ExternalLink>
				</p>
			</PanelBody>
			<PanelBody title={ __( 'Confirmation Message' ) }>
				<SelectControl
					value={ confirmMessageType }
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

				{ ConfirmMessageType.CUSTOM_TEXT === confirmMessageType && (
					<TextareaControl
						value={ customConfirmMessage }
						label={ __( 'Message Text' ) }
						placeholder={ __( 'Thank you for your submission!' ) }
						onChange={ handleChangeCustomConfirmMessage }
					/>
				) }

				{ ConfirmMessageType.REDIRECT === confirmMessageType && (
					<URLInput
						className="wp-block-crowdsignal-forms__redirect-url"
						value={ redirectAddress }
						label={ __( 'Redirect Address' ) }
						onChange={ handleChangeRedirectAddress }
					/>
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Color Settings' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text Color' ),
					},
					{
						value: backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background Color' ),
					},
				] }
			/>
			<ContrastChecker
				textColor={ textColor }
				backgroundColor={ backgroundColor }
				fallbackBackgroundColor
				fallbackTextColor
			/>
			<PanelBody title={ __( 'Text Settings' ) } initialOpen={ false }>
				<SelectControl
					value={ fontFamily }
					label={ __( 'Choose Font-Family' ) }
					options={ [
						{
							label: __( 'Default Theme Font' ),
							value: FontFamilyType.THEME_DEFAULT,
						},
						{
							label: __( 'Comic Sans' ),
							value: FontFamilyType.COMIC_SANS,
						},
					] }
					onChange={ handleChangeFontFamily }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Answer Settings' ) }>
				<CheckboxControl
					checked={ hasCaptchaProtection }
					label={ __( 'Enable Captcha Protection' ) }
					onChange={ handleChangeHasCaptchaProtection }
				/>
				<CheckboxControl
					checked={ hasOneResponsePerComputer }
					label={ __( 'One Response Per Computer' ) }
					onChange={ handleChangeHasOneResponsePerComputer }
				/>
				<CheckboxControl
					checked={ hasRandomOrderOfAnswers }
					label={ __( 'Random Order of Answers' ) }
					onChange={ handleChangeHasRandomOrderOfAnswers }
				/>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Submit Button Color Settings' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.submitButtonTextColor,
						onChange: handleChangeSubmitButtonTextColor,
						label: __( 'Text Color' ),
					},
					{
						value: attributes.submitButtonBackgroundColor,
						onChange: handleChangeSubmitButtonBackgroundColor,
						label: __( 'Background Color' ),
					},
				] }
			/>
			<ContrastChecker
				textColor={ attributes.submitButtonTextColor }
				backgroundColor={ attributes.submitButtonBackgroundColor }
				fallbackBackgroundColor
				fallbackTextColor
			/>
		</InspectorControls>
	);
};

export default SideBar;
