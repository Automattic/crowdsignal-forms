/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

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
	viewResultsUrl,
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

	const resultsLinkEnabled = '' !== viewResultsUrl;
	const resultsLinkClasses = classnames(
		'wp-block-crowdsignal-forms__view-results',
		{
			'is-disabled': ! resultsLinkEnabled,
		}
	);

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Data Settings' ) } initialOpen={ true }>
				<div className={ resultsLinkClasses }>
					<p>
						{ resultsLinkEnabled
							? __( 'Manage results on: ' )
							: __( 'Save this poll to enable results.' ) }
						{ resultsLinkEnabled && (
							<ExternalLink href={ viewResultsUrl }>
								crowdsignal.com
							</ExternalLink>
						) }
					</p>

					<p>
						<Button
							href={ viewResultsUrl }
							isDefault
							target="_blank"
						>
							{ __( 'View Results' ) }
						</Button>
					</p>
				</div>

				<TextControl
					value={ attributes.title }
					label={ __( 'Title of the Poll Block' ) }
					onChange={ handleChangeTitle }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Confirmation Message' ) }
				initialOpen={ false }
			>
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
			<PanelBody title={ __( 'Poll Status' ) } initialOpen={ false }>
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
				title={ __( 'Block Styling' ) }
				initialOpen={ true }
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
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border Color' ),
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
				<div className="wp-block-crowdsignal-forms__row">
					<TextControl
						label={ __( 'Border Thickness' ) }
						value={ attributes.borderWidth }
						onChange={ handleChangeBorderWidth }
						className="wp-block-crowdsignal-forms__small-text-input"
					/>
					<TextControl
						label={ __( 'Corner Radius' ) }
						value={ attributes.borderRadius }
						onChange={ handleChangeBorderRadius }
						className="wp-block-crowdsignal-forms__small-text-input"
					/>
				</div>
				<CheckboxControl
					label={ __( 'Drop Shadow' ) }
					checked={ attributes.hasBoxShadow }
					onChange={ handleChangeHasBoxShadow }
				/>
			</PanelColorSettings>
			<PanelColorSettings
				title={ __( 'Button Styling' ) }
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
			>
				<ContrastChecker
					textColor={ attributes.submitButtonTextColor }
					backgroundColor={ attributes.submitButtonBackgroundColor }
					fallbackBackgroundColor={
						fallbackSubmitButtonBackgroundColor
					}
					fallbackTextColor={ fallbackSubmitButtonTextColor }
				/>
			</PanelColorSettings>
			<PanelBody title={ __( 'Answer Settings' ) } initialOpen={ false }>
				<CheckboxControl
					checked={ attributes.hasOneResponsePerComputer }
					label={ __( 'One Response Per Computer' ) }
					onChange={ handleChangeHasOneResponsePerComputer }
				/>
				<CheckboxControl
					checked={ attributes.randomizeAnswers }
					label={ __( 'Randomize Answer Order' ) }
					onChange={ handleChangeRandomizeAnswers }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default SideBar;
