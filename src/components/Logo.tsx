type LogoProps = {
  className?: string
}

/**
 * The Stackt wordmark: "ST" + "CKT" in ink, with the "A" replaced by a
 * four-tier tapering pyramid in accent red (peak at cap-height, base at the
 * baseline), plus a thin accent underline. Text uses the app's real font via
 * SVG <text> (not hand-drawn letter paths) so it always matches --font-sans.
 */
function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 82 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stackt"
    >
      <g className="fill-ink" fontFamily="Poppins, system-ui, sans-serif" fontWeight="600">
        <text x="0" y="18" fontSize="20" letterSpacing="-0.3">
          ST
        </text>
        <text x="39" y="18" fontSize="20" letterSpacing="-0.3">
          CKT
        </text>
      </g>
      <g className="fill-accent">
        <polygon points="31.13,4 29.83,6.98 32.43,6.98" />
        <polygon points="29.6,7.5 32.66,7.5 33.96,10.48 28.3,10.48" />
        <polygon points="28.07,11 34.19,11 35.49,13.98 26.77,13.98" />
        <polygon points="26.54,14.5 35.72,14.5 37.26,18 25,18" />
      </g>
      <rect x="0" y="22" width="82" height="1.4" className="fill-accent" />
    </svg>
  )
}

export default Logo
