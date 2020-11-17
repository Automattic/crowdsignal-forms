/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const EditBar = ( { onEditClick } ) => {
	const handleEditClick = () => {
		onEditClick();
	};
	return (
		<div className="crowdsignal-forms-poll__edit-bar">
			<div className="crowdsignal-forms-poll__edit-bar-message">
				{ __(
					'Warning! This poll is published. Deleting or reordering answers may cause the loss of existing responses.',
					'crowdsignal-forms'
				) }
			</div>
			<button
				className="crowdsignal-forms-poll__edit-bar-button"
				onClick={ handleEditClick }
			>
				{ __( 'Edit', 'crowdsignal-forms' ) }
			</button>
		</div>
	);
};

export default EditBar;
