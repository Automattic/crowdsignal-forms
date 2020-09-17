export default ( { className, fillColor = 'black' } ) => (
	<svg
		className={ className }
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g clipPath="url(#clipThumbsDown)">
			<mask
				id="maskThumbsDown"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="5"
				width="20"
				height="20"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M4.65002 17.75H10.4342L9.56336 21.9392L9.53586 22.2325C9.53586 22.6083 9.69169 22.9567 9.93919 23.2042L10.9109 24.1667L16.9425 18.1258C17.2817 17.7958 17.4834 17.3375 17.4834 16.8333L21.15 16.8333L21.15 7.57499H17.4834V7.66666C17.4834 6.65832 16.6584 5.83332 15.65 5.83332H7.40003C6.63919 5.83332 5.98836 6.29165 5.71336 6.95166L2.94503 13.4142C2.86253 13.625 2.81669 13.845 2.81669 14.0833V15.9167C2.81669 16.925 3.64169 17.75 4.65002 17.75ZM4.65002 14.0833L7.40002 7.66666H15.65L15.65 16.8333L11.6717 20.8117L12.6892 15.9167H4.65002V14.0833Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#maskThumbsDown)">
				<rect
					x="23.0001"
					y="24"
					width="22"
					height="22"
					transform="rotate(-180 23.0001 24)"
					fill={ fillColor }
				/>
			</g>
		</g>
		<defs>
			<clipPath id="clipThumbsDown">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
);
