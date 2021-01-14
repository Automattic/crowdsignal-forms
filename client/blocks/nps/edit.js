/**
 * External dependencies
 */
import React from 'react';
import { pick, times } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { updateNps } from 'data/nps';
import Sidebar from './sidebar';

const EditNpsBlock = ( props ) => {
	const { attributes, clientId, setAttributes } = props;

	const handleChangeAttribute = ( attribute ) => ( value ) =>
		setAttributes( {
			[ attribute ]: value,
		} );

	const handleSaveNPS = async () => {
		dispatch( 'core/editor' ).lockPostSaving( clientId );

		try {
			const { surveyId } = await updateNps(
				pick( attributes, [
					'feedbackQuestion',
					'ratingQuestion',
					'surveyId',
					'title',
				] )
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

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal NPS', 'crowdsignal-forms' ) }
		>
			<Sidebar { ...props } />

			<button onClick={ handleSaveNPS }>
				{ __( 'Save', 'crowdsignal-forms' ) }
			</button>

			<RichText
				tagName="h3"
				className="crowdsignal-forms-nps__title"
				placeholder={ __( 'Title', 'crowdsignal-forms' ) }
				onChange={ handleChangeAttribute( 'title' ) }
				value={ attributes.title }
				allowedFormats={ [] }
			/>

			<div className="crowdsignal-forms-nps">
				<RichText
					tagName="p"
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
							placeholder={ __( 'Low', 'crowdsignal-forms' ) }
							onChange={ handleChangeAttribute(
								'lowRatingLabel'
							) }
							value={ attributes.lowRatingLabel }
							allowedFormats={ [] }
						/>
						<RichText
							tagName="span"
							placeholder={ __( 'High', 'crowdsignal-forms' ) }
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

			<div className="crowdsignal-forms-nps">
				<div className="crowdsignal-forms-nps__feedback">
					<RichText
						tagName="p"
						className="crowdsignal-forms-nps__question"
						placeholder={ __(
							'Enter your feedback question',
							'crowdsignal-forms'
						) }
						onChange={ handleChangeAttribute( 'feedbackQuestion' ) }
						value={ attributes.feedbackQuestion }
						allowedFormats={ [] }
					/>

					<textarea
						className="crowdsignal-forms-nps__feedback-text"
						rows={ 6 }
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
		</ConnectToCrowdsignal>
	);
};

export default EditNpsBlock;
