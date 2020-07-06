/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const EditBar = ( { onEditClick, unlocked } ) => {
	const handleEditClick = () => {
		onEditClick();
	};
	return (
		<div className="wp-block-crowdsignal-forms-poll__edit-bar">
			<div className="wp-block-crowdsignal-forms-poll__edit-bar-message">
				{ ! unlocked ? (
					<>
						{ __(
							'Warning! This poll is published and may have responses.'
						) }
						<br />
						{ __(
							'Deleting or reordering options may cause data loss.'
						) }
					</>
				) : (
					<>
						{ __(
							'Warning! Changes made here will apply to the published poll.'
						) }
					</>
				) }
			</div>
			{ ! unlocked && (
				<button
					className="wp-block-crowdsignal-forms-poll__edit-bar-button"
					onClick={ handleEditClick }
				>
					{ __( 'Edit' ) }
				</button>
			) }
		</div>
	);
};

export default EditBar;
