/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { __ } from 'lib/i18n';
import withClientId from 'components/with-client-id';
import useNumberedTitle from 'components/use-numbered-title';
import Applause from 'components/applause';
import withPollBase from 'components/with-poll-base';

const EditApplauseBlock = ( props ) => {
	const { attributes, setAttributes, className } = props;

	useNumberedTitle(
		props.name,
		__( 'Untitled Applause' ),
		attributes,
		setAttributes
	);

	const classes = classNames( className, 'crowdsignal-forms-applause' );

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Applause' ) }
		>
			<Applause className={ classes } />
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withPollBase ] )(
	withClientId( EditApplauseBlock, [ 'pollId', 'answerId' ] )
);
