/**
 * External dependencies
 */
import React, { useCallback, useEffect, useState } from 'react';
import { get, isEmpty, includes, noop, pick } from 'lodash';

/**
 * This is used as a registry to hold references to each blocks
 * internal setBlockOffset function.
 *
 * @type {Object}
 */
const setOffset = {};

/**
 * The list of blocks for which the HoC will be enabled
 *
 * @type {Array}
 */
const enabledBlocks = [
	'crowdsignal-forms/feedback',
];

/**
 * Applies the fixed positions settings to the block list wrapper.
 * This is necessary as we need to reposition the wrapper if we
 * want to move the block controls/hitbox as well.
 *
 * @param  {Function} BlockListBlock Block list wrapper componnet
 * @return {Function}                Enhanced BlockListBlock
 */
export const withFixedPosition = ( BlockListBlock ) => {
	return ( props ) => {
		if ( ! includes( enabledBlocks, props.name ) ) {
			return <BlockListBlock { ...props } />;
		}

		const [ offset, setBlockOffset ] = useState( {} );

		// Expose the setBlockOffset handler immediately...
		setOffset[ props.clientId ] = setBlockOffset;

		// ...but make sure to clean it up when the block is removed.
		useEffect( () => {
			return () => {
				setOffset[ props.clientId ] = null;
			};
		}, [ setOffset, props.clientId ] );

		const style = {
			...get( props, [ 'wrapperProps', 'style' ], {} ),
			...offset,
			position: ! isEmpty( offset ) ? 'fixed' : null,
		};

		props.wrapperProps = {
			...props.wrapperProps,
			style,
		};

		return <BlockListBlock { ...props } />
	};
};

/**
 * Injects a setPosition prop into its child for controlling
 * the blocks position.
 * Unfortunately we can't inject things into BlockEdit directly
 * through BlockListBlock hence the necessary roundtrip.
 *
 * @param  {Function} BlockEdit Block edit component
 * @return {Function}           Enhanced BlockEdit
 */
export const withFixedPositionControl = ( BlockEdit ) => {
	return ( props ) => {
		if ( ! includes( enabledBlocks, props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		const setPosition = useCallback( ( value ) => {
			setOffset[ props.clientId ]( pick( value, [
				'top',
				'left',
				'right',
				'bottom',
			] ) );
		}, [ props.clientId ] );

		return <BlockEdit { ...props } setPosition={ setPosition } />
	};
};
