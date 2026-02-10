/**
 * WordPress dependencies
 */
import { useEffect, useState } from 'react';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

/**
 * Fetches the integer survey ID for a given survey client ID (UUID)
 * from the REST API after the post has been saved.
 *
 * @param {string} surveyClientId The UUID assigned to the survey block.
 * @param {string} surveyType     The survey type ('feedback' or 'nps').
 * @return {number|null} The resolved integer survey ID, or null if not yet available.
 */
const useSurveyId = ( surveyClientId, surveyType ) => {
	const [ surveyId, setSurveyId ] = useState( null );

	const { isSaving, isDirty, isNew } = useSelect( ( select ) => {
		const editor = select( 'core/editor' );
		return {
			isSaving: editor.isSavingPost(),
			isDirty: editor.isEditedPostDirty(),
			isNew: editor.isCleanNewPost() || editor.isEditedPostNew(),
		};
	} );

	useEffect( () => {
		if ( ! surveyClientId || surveyId || isSaving || isDirty || isNew ) {
			return;
		}

		apiFetch( {
			path: `/crowdsignal-forms/v1/${ surveyType }/${ surveyClientId }`,
			method: 'GET',
		} ).then(
			( response ) => {
				if ( response && response.id ) {
					setSurveyId( response.id );
				}
			},
			() => {
				// Survey not synced yet — will resolve after next save.
			}
		);
	}, [ surveyClientId, surveyType, isSaving, isDirty, isNew, surveyId ] );

	return surveyId;
};

export default useSurveyId;
