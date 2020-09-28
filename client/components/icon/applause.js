export default ( { className, fillColor = 'black' } ) => (
	<svg
		className={ className }
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g clipPath="url(#clipThumbsUp)">
			<mask
				id="maskThumbsUp"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="-1"
				width="20"
				height="20"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M19.35 6.24998H13.5658L14.4366 2.06081L14.4641 1.76748C14.4641 1.39165 14.3083 1.04331 14.0608 0.795813L13.0891 -0.166687L7.05748 5.87415C6.71831 6.20415 6.51664 6.66248 6.51664 7.16665L2.84998 7.16665V16.425H6.51664V16.3333C6.51664 17.3416 7.34164 18.1666 8.34998 18.1666H16.6C17.3608 18.1666 18.0116 17.7083 18.2866 17.0483L21.055 10.5858C21.1375 10.375 21.1833 10.155 21.1833 9.91665V8.08331C21.1833 7.07498 20.3583 6.24998 19.35 6.24998ZM19.35 9.91665L16.6 16.3333H8.34998V7.16665L12.3283 3.18831L11.3108 8.08331H19.35V9.91665Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#maskThumbsUp)">
				<rect
					x="0.999878"
					y="-3.05176e-05"
					width="22"
					height="22"
					fill={ fillColor }
				/>
			</g>
		</g>
		<defs>
			<clipPath id="clipThumbsUp">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
);
