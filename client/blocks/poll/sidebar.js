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
			<PanelBody title={ __( 'Results' ) } initialOpen={ true }>
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
							isSecondary
							target="_blank"
						>
							{ __( 'View results' ) }
						</Button>
					</p>
				</div>

				<TextControl
					value={ decodeEntities(
						attributes.title ?? attributes.question
					) }
					label={ __( 'Title of the poll block' ) }
					onChange={ handleChangeTitle }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Confirmation message' ) }
				initialOpen={ false }
			>
				<SelectControl
					value={ attributes.confirmMessageType }
					label={ __( 'On submission' ) }
					options={ [
						{
							label: __( 'Show results' ),
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
						label={ __( 'Message text' ) }
						placeholder={ __( 'Thanks for voting!' ) }
						onChange={ handleChangeCustomConfirmMessage }
					/>
				) }

				{ ConfirmMessageType.REDIRECT ===
					attributes.confirmMessageType && (
					<URLInput
						className="wp-block-crowdsignal-forms__redirect-url"
						value={ attributes.redirectAddress }
						label={ __( 'Redirect address' ) }
						onChange={ handleChangeRedirectAddress }
					/>
				) }
			</PanelBody>
			<PanelBody title={ __( 'Poll status' ) } initialOpen={ false }>
				<SelectControl
					value={ attributes.pollStatus }
					label={ __( 'Currently' ) }
					options={ [
						{
							label: __( 'Open' ),
							value: PollStatus.OPEN,
						},
						{
							label: __( 'Closed after' ),
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
								label: __( 'Show results' ),
								value: ClosedPollState.SHOW_RESULTS,
							},
							{
								label: __( 'Show poll with "Closed" banner' ),
								value: ClosedPollState.SHOW_CLOSED_BANNER,
							},
							{
								label: __( 'Hide poll' ),
								value: ClosedPollState.HIDDEN,
							},
						] }
						onChange={ handleChangeClosedPollState }
					/>
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Block styling' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text color' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background color' ),
					},
					{
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border color' ),
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
					label={ __( 'Choose font' ) }
					options={ [
						{
							label: __( 'Default theme font' ),
							value: FontFamilyType.THEME_DEFAULT,
						},
						{
							label: __( 'Alegreya Sans' ),
							value: FontFamilyType.ALEGREYA_SANS,
						},
						{
							label: __( 'Arial' ),
							value: FontFamilyType.ARIAL,
						},
						{
							label: __( 'Cabin' ),
							value: FontFamilyType.CABIN,
						},
						{
							label: __( 'Chivo' ),
							value: FontFamilyType.CHIVO,
						},
						{
							label: __( 'Courier' ),
							value: FontFamilyType.COURIER,
						},
						{
							label: __( 'Fira Sans' ),
							value: FontFamilyType.FIRA_SANS,
						},
						{
							label: __( 'Georgia' ),
							value: FontFamilyType.GEORGIA,
						},
						{
							label: __( 'Impact' ),
							value: FontFamilyType.IMPACT,
						},
						{
							label: __( 'Josefin Sans' ),
							value: FontFamilyType.JOSEFIN_SANS,
						},
						{
							label: __( 'Lato' ),
							value: FontFamilyType.LATO,
						},
						{
							label: __( 'Libre Franklin' ),
							value: FontFamilyType.LIBRE_FRANKLIN,
						},
						{
							label: __( 'Lucida' ),
							value: FontFamilyType.LUCIDA,
						},
						{
							label: __( 'Montserrat' ),
							value: FontFamilyType.MONTSERRAT,
						},
						{
							label: __( 'Nunito' ),
							value: FontFamilyType.NUNITO,
						},
						{
							label: __( 'Open Sans' ),
							value: FontFamilyType.OPEN_SANS,
						},
						{
							label: __( 'Oswald' ),
							value: FontFamilyType.OSWALD,
						},
						{
							label: __( 'Overpass' ),
							value: FontFamilyType.OVERPASS,
						},
						{
							label: __( 'Palatino' ),
							value: FontFamilyType.PALATINO,
						},
						{
							label: __( 'Poppins' ),
							value: FontFamilyType.POPPINS,
						},
						{
							label: __( 'Raleway' ),
							value: FontFamilyType.RALEWAY,
						},
						{
							label: __( 'Roboto' ),
							value: FontFamilyType.ROBOTO,
						},
						{
							label: __( 'Rubik' ),
							value: FontFamilyType.RUBIK,
						},
						{
							label: __( 'Tahoma' ),
							value: FontFamilyType.TAHOMA,
						},
						{
							label: __( 'Times New Roman' ),
							value: FontFamilyType.TIMES_NEW_ROMAN,
						},
						{
							label: __( 'Trebuchet' ),
							value: FontFamilyType.TREBUCHET,
						},
						{
							label: __( 'Verdana' ),
							value: FontFamilyType.VERDANA,
						},
					] }
					onChange={ handleChangeFontFamily }
				/>
				<div className="wp-block-crowdsignal-forms__row">
					<TextControl
						label={ __( 'Border thickness' ) }
						value={ attributes.borderWidth }
						onChange={ handleChangeBorderWidth }
						type="number"
						className="wp-block-crowdsignal-forms__small-text-input"
					/>
					<TextControl
						label={ __( 'Corner radius' ) }
						value={ attributes.borderRadius }
						onChange={ handleChangeBorderRadius }
						type="number"
						className="wp-block-crowdsignal-forms__small-text-input"
					/>
				</div>
				<ToggleControl
					label={ __( 'Drop shadow' ) }
					checked={ attributes.hasBoxShadow }
					onChange={ handleChangeHasBoxShadow }
				/>
			</PanelColorSettings>
			<PanelColorSettings
				title={ __( 'Button styling' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.submitButtonTextColor,
						onChange: handleChangeSubmitButtonTextColor,
						label: __( 'Text color' ),
					},
					{
						value: attributes.submitButtonBackgroundColor,
						onChange: handleChangeSubmitButtonBackgroundColor,
						label: __( 'Background color' ),
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
			<PanelBody title={ __( 'Answer settings' ) } initialOpen={ false }>
				<CheckboxControl
					checked={ attributes.hasOneResponsePerComputer }
					label={ __( 'One response per computer' ) }
					onChange={ handleChangeHasOneResponsePerComputer }
				/>
				<CheckboxControl
					checked={ attributes.randomizeAnswers }
					label={ __( 'Randomize answer order' ) }
					onChange={ handleChangeRandomizeAnswers }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default SideBar;
