/**
 * External dependencies
 */
import { render } from 'react-dom';
import { camelCase, isEmpty, forEach } from 'lodash';

const MutationObserver = ( dataAttributeName, blockBuilder ) => {
	if ( 'complete' === document.readyState ) {
		return blockObserver( dataAttributeName, blockBuilder );
	}

	document.addEventListener( 'DOMContentLoaded', () =>
		blockObserver( dataAttributeName, blockBuilder )
	);
};

const initBlocks = ( dataAttributeName, blockBuilder ) =>
	forEach(
		document.querySelectorAll( `div[${ dataAttributeName }]` ),
		( element ) => {
			// Try-catch potentially prevents other blocks from breaking
			// when there's more then one on the page
			try {
				const attributes = JSON.parse(
					element.dataset[
						camelCase( dataAttributeName.substr( 'data-'.length ) )
					]
				);
				const block = blockBuilder( attributes, element );

				element.removeAttribute( dataAttributeName );

				render( block, element );
			} catch ( error ) {
				// eslint-disable-next-line
				console.error(
					'Crowdsignal Forms: Failed to parse block data for: %s',
					dataAttributeName
				);
			}
		}
	);

const blockObserver = ( dataAttributeName, blockBuilder ) => {
	if (
		! isEmpty( window.CrowdsignalMutationObservers ) &&
		true === window.CrowdsignalMutationObservers[ dataAttributeName ]
	) {
		return;
	}

	const observer = new window.MutationObserver( () =>
		initBlocks( dataAttributeName, blockBuilder )
	);

	observer.observe( document.body, {
		attributes: true,
		attributeFilter: [ dataAttributeName ],
		childList: true,
		subtree: true,
	} );

	if ( isEmpty( window.CrowdsignalMutationObservers ) ) {
		window.CrowdsignalMutationObservers = [];
	}

	window.CrowdsignalMutationObservers[ dataAttributeName ] = true;

	// Run the first pass on load
	initBlocks( dataAttributeName, blockBuilder );
};

export default MutationObserver;
