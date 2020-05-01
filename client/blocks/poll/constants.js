export const ConfirmMessageType = Object.freeze( {
	THANK_YOU: 'thank-you',
	CUSTOM_TEXT: 'custom-text',
	REDIRECT: 'redirect',
	RESULTS: 'results',
} );

export const FontFamilyType = Object.freeze( {
	THEME_DEFAULT: 'theme-default',
	COMIC_SANS: 'comic-sans',
} );

export const PollStatus = Object.freeze( {
	OPEN: 'open',
	CLOSED: 'closed',
	CLOSED_AFTER: 'closed-after',
} );

export const ClosedPollState = Object.freeze( {
	SHOW_RESULTS: 'show-results',
	SHOW_CLOSED_BANNER: 'show-closed-banner',
	HIDDEN: 'hidden',
} );
