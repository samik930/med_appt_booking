export default function Logo() {
  return (
    <div className="logo-wrapper">
      <svg
        className="logo-svg"
        viewBox="0 0 48 48"
        width="32"
        height="32"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#5b63ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Pulse circle background */}
        <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" opacity="0.15" />

        {/* Main circle */}
        <circle cx="24" cy="24" r="20" fill="url(#logoGradient)" />

        {/* Healthcare cross / plus symbol styled as a modern heartbeat */}
        <g fill="white">
          {/* Vertical bar */}
          <rect x="21" y="12" width="6" height="24" rx="2" />
          {/* Horizontal bar */}
          <rect x="12" y="21" width="24" height="6" rx="2" />
          {/* Small dot accent top right */}
          <circle cx="34" cy="14" r="2" />
        </g>
      </svg>
      <span className="logo-text">MedLink</span>
    </div>
  )
}
