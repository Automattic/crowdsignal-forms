/**
 * Traverses the parent chain of the given node to get a 'best guess' of
 * what the background color is if the provided node has a transparent background.
 * Algorithm for traversing parent chain "borrowed" from
 * https://github.com/WordPress/gutenberg/blob/0c6e369/packages/block-editor/src/components/colors/use-colors.js#L201-L216
 *
 * @param  {Element} backgroundColorNode The element to check for background color
 * @return {string}  The background colour of the node
 */
export const getBackgroundColor = ( backgroundColorNode ) => {
	let backgroundColor = window.getComputedStyle( backgroundColorNode )
		.backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType === window.Node.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor = window.getComputedStyle( backgroundColorNode )
			.backgroundColor;
	}
	return backgroundColor;
};

/**
 * Gets the border color for a node, if it appears valid.
 * If we get '0px' for the width, then we likely don't have a border and return null.
 * We use 'borderBlockStartWidth' because of FF: https://bugzilla.mozilla.org/show_bug.cgi?id=137688
 *
 * @param {Element} borderNode The element to check for a border color
 * @return {string|null} The border colour value of null if invalid
 */
export const getBorderColor = ( borderNode ) => {
	const borderWidth = window.getComputedStyle( borderNode )
		.borderBlockStartWidth;
	return borderWidth !== '0px'
		? window.getComputedStyle( borderNode ).borderBlockStartColor
		: null;
};

/**
 * External dependencies
 */
import fastDeepEqual from 'fast-deep-equal/es6';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';

export const withWordPressFallbackStyles = ( mapNodeToProps ) =>
	createHigherOrderComponent( ( WrappedComponent ) => {
		return class extends Component {
			constructor( props ) {
				super( props );
				this.nodeRef = this.props.node;
				this.state = {
					fallbackStyles: undefined,
					grabStylesCompleted: false,
				};

				this.bindRef = this.bindRef.bind( this );
			}

			bindRef( node ) {
				if ( ! node ) {
					return;
				}
				this.nodeRef = node;
			}

			componentDidMount() {
				this.grabFallbackStyles()
			}

			componentDidUpdate() {
				this.grabFallbackStyles()
			}

			grabFallbackStyles() {
				const { grabStylesCompleted, fallbackStyles } = this.state;
				if ( this.nodeRef && ! grabStylesCompleted ) {
					const newFallbackStyles = mapNodeToProps(
						this.nodeRef,
						this.props
					);

					if (
						! fastDeepEqual( newFallbackStyles, fallbackStyles )
					) {
						this.setState( {
							fallbackStyles: newFallbackStyles,
							grabStylesCompleted:
								Object.values( newFallbackStyles ).every(
									Boolean
								),
						} );
					}
				}
			}

			render() {
				const wrappedComponent = (
					<WrappedComponent
						{ ...this.props }
						{ ...this.state.fallbackStyles }
					/>
				);
				return this.props.node ? (
					wrappedComponent
				) : (
					<div ref={ this.bindRef }> { wrappedComponent } </div>
				);
			}
		};
	}, 'withFallbackStyles' );
