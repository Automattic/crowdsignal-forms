/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';

const Applause = ( { className } ) => (
	<div className={ className }>
		<ApplauseIcon className="crowdsignal-forms-applause__icon" />
		<span className="crowdsignal-forms-applause__count">0 Claps</span>
	</div>
);

Applause.propTypes = {
	className: PropTypes.string,
};

export default Applause;
