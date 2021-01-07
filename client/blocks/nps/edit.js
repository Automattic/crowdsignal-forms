/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';

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

	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const handleChangeRatingQuestion = ( ratingQuestion ) =>
		setAttributes( {
			ratingQuestion,
		} );

	const handleChangeFeedbackQuestion = ( feedbackQuestion ) =>
		setAttributes( {
			feedbackQuestion,
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

			<div className="crowdsignal-forms-nps">
				<button onClick={ handleSaveNPS }>
					{ __( 'Save', 'crowdsignal-forms' ) }
				</button>

				<RichText
					tagName="h3"
					className="crowdsignal-forms-nps__title"
					placeholder={ __( 'Title', 'crowdsignal-forms' ) }
					onChange={ handleChangeTitle }
					value={ attributes.title }
					allowedFormats={ [] }
				/>

				<RichText
					tagName="p"
					className="crowdsignal-forms-nps__question"
					placeholder={ __(
						'Enter your rating question',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeRatingQuestion }
					value={ attributes.ratingQuestion }
					allowedFormats={ [] }
				/>

				<RichText
					tagName="p"
					className="crowdsignal-forms-nps__question"
					placeholder={ __(
						'Enter your feedback question',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeFeedbackQuestion }
					value={ attributes.feedbackQuestion }
					allowedFormats={ [] }
				/>
			</div>
		</ConnectToCrowdsignal>
	);
};

export default EditNpsBlock;
