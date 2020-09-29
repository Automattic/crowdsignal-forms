/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ApplauseIcon from 'components/icon/applause';
import { isPollClosed } from 'blocks/poll/util';

const Applause = ( { attributes } ) => {
	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	const classes = classNames(
		'crowdsignal-forms-applause',
		attributes.className,
		`size-${ attributes.size }`,
		{
			'is-closed': isClosed,
		}
	);

	return (
		<div className={ classes }>
			<ApplauseIcon className="crowdsignal-forms-applause__icon" />
			<span className="crowdsignal-forms-applause__count">0 Claps</span>
		</div>
	);
};

Applause.propTypes = {
	className: PropTypes.string,
};

export default Applause;
