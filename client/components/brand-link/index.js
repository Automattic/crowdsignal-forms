/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const BrandLink = ( { showBranding, referralCode } ) => {
	return (
		<div className="crowdsignal-forms__branding">
			{ showBranding && (
				<a
					className="crowdsignal-forms__branding-link with-external-icon"
					href={ `https://crowdsignal.com?ref=${ referralCode }` }
					target="blank"
					rel="noopener noreferrer"
				>
					{ __( 'Powered by Crowdsignal' ) }
				</a>
			) }
			{ ! showBranding && (
				<span className="crowdsignal-forms__branding-link">&nbsp;</span>
			) }
		</div>
	);
};

export default BrandLink;
