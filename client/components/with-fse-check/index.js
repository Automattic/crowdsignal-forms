/**
 * External dependencies
 */
import React from 'react';

import ErrorBanner from 'components/poll/error-banner';
import { __ } from '@wordpress/i18n';

const withFseCheck = ( Element ) => {
	return ( props ) => {
		const { context } = props;
		const { postId, queryId } = context;

		// Prevent block from loading in FSE or a query loop because save handlers don't support those contexts.
		// - double == instead of triple === used because we need to test for both null and undefined
		if ( null == postId ) {
			return <ErrorBanner>{ __( 'Crowdsignal blocks cannot be used outside of a post or page. The Site Editor is not supported.', 'crowdsignal-forms' ) }</ErrorBanner>;
		} else if ( null != queryId ) {
			return <ErrorBanner>{ __( 'Crowdsignal blocks are not supported inside a query loop.', 'crowdsignal-forms' ) }</ErrorBanner>;
		}

		return <Element { ...props } />;
	};
};

export default withFseCheck;
