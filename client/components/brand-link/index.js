/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

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
					{ __( 'Powered by Crowdsignal', 'crowdsignal-forms' ) }
				</a>
			) }
			{ ! showBranding && (
				<span className="crowdsignal-forms__branding-link">&nbsp;</span>
			) }
		</div>
	);
};

BrandLink.propTypes = {
	showBranding: PropTypes.bool,
	referralCode: PropTypes.string.isRequired,
};

export default BrandLink;
