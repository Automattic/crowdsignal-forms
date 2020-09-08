/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { ConfirmMessageType } from 'blocks/poll/constants';
import CloseIcon from 'components/icon/close';
import CheckCircleIcon from 'components/icon/check-circle';
import ThankYouIcon from 'components/icon/thank-you';
import FooterBranding from './footer-branding';
import { __ } from 'lib/i18n';

const toggleAnimationPlayPause = ( event ) => {
	const player = event.target;

	if ( ! player ) {
		return;
	}

	if ( player.paused ) {
		player.play();
	} else {
		player.pause();
	}
};

const SubmitMessage = ( {
	confirmMessageType,
	customConfirmMessage,
	setDismissSubmitMessage,
	hideBranding,
} ) => (
	<div className="crowdsignal-forms-poll__submit-message-container">
		<div className="crowdsignal-forms-poll__submit-message">
			{ ConfirmMessageType.THANK_YOU === confirmMessageType && (
				<>
					<video
						muted
						autoPlay
						loop
						playsInline
						poster="https://crowdsignal.files.wordpress.com/2020/02/thumbs-up-video-placeholder.jpg"
						width="100%"
						onClick={ toggleAnimationPlayPause }
					>
						<source
							src="https://crowdsignal.files.wordpress.com/2019/08/thumbs-up-cs.mp4"
							type="video/mp4"
						/>
					</video>
					<ThankYouIcon className="crowdsignal-forms-poll__thank-you-sticker" />
					{ ! hideBranding && (
						<img
							className="crowdsignal-forms-poll__thank-you-cs-sticker"
							src="https://app.crowdsignal.com/images/svg/cs-logo-dots.svg"
							alt="Crowdsignal sticker"
						/>
					) }
				</>
			) }
			{ ConfirmMessageType.CUSTOM_TEXT === confirmMessageType && (
				<>
					<div className="crowdsignal-forms-poll__custom-message-check">
						<CheckCircleIcon />
					</div>
					<div className="crowdsignal-forms-poll__custom-message">
						{ isEmpty( customConfirmMessage )
							? __( 'Thanks for voting!' )
							: customConfirmMessage }
					</div>
				</>
			) }
			<button
				className="crowdsignal-forms-poll__dismiss-submit-message"
				onClick={ () => setDismissSubmitMessage( true ) }
			>
				<CloseIcon />
			</button>
		</div>
		<div className="crowdsignal-forms-poll__submit-message-footer">
			{ ! hideBranding && (
				<FooterBranding
					showLogo={
						ConfirmMessageType.THANK_YOU !== confirmMessageType
					}
				/>
			) }
		</div>
	</div>
);

export default SubmitMessage;
