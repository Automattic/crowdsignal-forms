/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const EditBar = ( { onEditClick } ) => {
	const handleEditClick = () => {
		onEditClick();
	};
	return (
		<div className="crowdsignal-forms-poll__edit-bar">
			<div className="crowdsignal-forms-poll__edit-bar-message">
				{ __(
					'Warning! This poll is published. Deleting or reordering answers may cause the loss of existing responses.'
				) }
			</div>
			<button
				className="crowdsignal-forms-poll__edit-bar-button"
				onClick={ handleEditClick }
			>
				{ __( 'Edit' ) }
			</button>
		</div>
	);
};

export default EditBar;
