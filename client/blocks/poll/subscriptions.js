/**
 * External dependencies
 */
import { differenceBy, filter, forEach } from 'lodash';

/**
 * WordPress dependencies
 */
import { subscribe, select } from '@wordpress/data';
import { doAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { archivePoll } from './hooks';

const isPollBlock = ( block ) => block.name === 'crowdsignal-forms/poll';

let subsStarted = false;

const filterPollBlocks = ( blocks ) => filter( blocks, isPollBlock );

export const startSubscriptions = () => {
	if ( subsStarted ) {
		return;
	}
	subsStarted = true;

	const findDeletedPollBlocks = ( selectedBlocks, previousBlocks ) => {
		const deletedBlocks = differenceBy(
			previousBlocks,
			selectedBlocks,
			'clientId'
		);

		if ( deletedBlocks.length > 0 ) {
			forEach( deletedBlocks, ( pollBlock ) => {
				doAction( 'crowdsignalFormsPollDelete', pollBlock );
				if ( pollBlock.attributes && pollBlock.attributes.pollId ) {
					archivePoll( pollBlock.attributes.pollId );
				}
			} );
		}
	};

	const { getBlocks } = select( 'core/block-editor' );
	let previousBlocks = filterPollBlocks( getBlocks() );
	subscribe( () => {
		const selectedBlocks = filterPollBlocks( getBlocks() );
		findDeletedPollBlocks( selectedBlocks, previousBlocks );
		previousBlocks = selectedBlocks;
	} );
};
