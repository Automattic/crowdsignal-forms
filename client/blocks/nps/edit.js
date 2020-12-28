/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import Sidebar from './sidebar';

const EditNpsBlock = ( props ) => {
	const { attributes, setAttributes } = props;

	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const handleChangeRatingQuestion = ( ratingQuestion ) =>
		setAttributes( {
			ratingQuestion,
		} );

	const handleChangeFeedbackQuestion = ( feedbackQuestion ) =>
		setAttributes( {
			feedbackQuestion,
		} );

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal NPS', 'crowdsignal-forms' ) }
		>
			<Sidebar { ...props } />

			<div className="crowdsignal-forms-nps">
				<RichText
					tagName="h3"
					className="crowdsignal-forms-nps__title"
					placeholder={ __(
						'Title',
						'crowdsignal-forms'
					) }
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
