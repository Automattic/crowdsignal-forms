/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import QuizIcon from '../../components/icon/quiz';
export default [
	{
		name: 'crowdsignal-forms/quiz',
		isDefault: false,
		title: __( 'Quiz', 'crowdsignal-forms' ),
		description: __(
			'Create a multipage quiz on crowdsignal.com and embed it.',
			'crowdsignal-forms'
		),
		icon: <QuizIcon />,
		attributes: {
			createLink: 'https://crowdsignal.com/support/create-a-quiz/',
			createText: __( 'Create a new Quiz', 'crowdsignal-forms' ),
			placeholderTitle: __( 'Quiz Embed', 'crowdsignal-forms' ),
			typeText: __( 'quiz', 'crowdsignal-forms' ),
			editText: createInterpolateElement(
				__(
					'Edit your quizzes on <a>crowdsignal.com</a>',
					'crowdsignal-forms'
				),
				{
					a: (
						// eslint-disable-next-line jsx-a11y/anchor-has-content
						<a
							href="https://app.crowdsignal.com"
							target="_blank"
							rel="external noreferrer noopener"
						/>
					),
				}
			),
			dashboardLink: 'https://app.crowdsignal.com/?ref=quizmbedblock',
			embedMessage: __(
				'Paste a link to the quiz you want to display on your site',
				'crowdsignal-forms'
			),
		},
		keywords: [
			__( 'quiz', 'crowdsignal-forms' ),
			__( 'quizzes', 'crowdsignal-forms' ),
		],
		isActive: ( blockAttributes, variationAttributes ) =>
			blockAttributes.typeText === variationAttributes.typeText,
	},
];
