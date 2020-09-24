export default ( { className, fillColor = 'black' } ) => (
	<svg
		className={ className }
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g id="icon/action/thumb_up_24px">
			<mask
				id="maskThumbsUp"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="1"
				y="2"
				width="22"
				height="20"
			>
				<path
					id="icon/action/thumb_up_24px_2"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M9 22H18C18.83 22 19.54 21.5 19.84 20.78L22.86 13.73C22.95 13.5 23 13.26 23 13V11C23 9.9 22.1 9 21 9H14.69L15.64 4.43L15.67 4.11C15.67 3.7 15.5 3.32 15.23 3.05L14.17 2L7.58 8.59C7.22 8.95 7 9.45 7 10V20C7 21.1 7.9 22 9 22ZM9 10L13.34 5.66L12 11H21V13L18 20H9V10ZM5 10H1V22H5V10Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#maskThumbsUp)">
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
