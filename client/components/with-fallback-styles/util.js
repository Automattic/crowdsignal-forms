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
