export default ( { className, fillColor = 'black' } ) => (
	<svg
		className={ className }
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g id="icon/action/thumb_down_24px">
			<mask
				id="maskThumbsDown"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="1"
				y="2"
				width="22"
				height="20"
			>
				<path
					id="icon/action/thumb_down_24px_2"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M15 2H6C5.17 2 4.46 2.5 4.16 3.22L1.14 10.27C1.05 10.5 1 10.74 1 11V13C1 14.1 1.9 15 3 15H9.31L8.36 19.57L8.33 19.89C8.33 20.3 8.5 20.68 8.77 20.95L9.83 22L16.42 15.41C16.78 15.05 17 14.55 17 14V4C17 2.9 16.1 2 15 2ZM15 14L10.66 18.34L12 13H3V11L6 4H15V14ZM23 2H19V14H23V2Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#maskThumbsDown)">
				<rect
					id="Rectangle"
					width="24"
					height="24"
					fill={ fillColor }
				/>
			</g>
		</g>
	</svg>
);
