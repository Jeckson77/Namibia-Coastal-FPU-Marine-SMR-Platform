import React from 'react';

const NamibiaReactorLogo = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
    <defs>
      <linearGradient id="namibia-reactor-core" x1="18" y1="8" x2="48" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c3f5ff" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>

    <path
      d="M34.5 5.5L26 10.5L24.5 18L19 22L20.5 30L16 37L18.5 43.5L23.5 46L24.5 53L31 58.5L36.5 55L42 56L47 50L46.5 42.5L50.5 36L48 29L50 21.5L45.5 16.5L40 15L34.5 5.5Z"
      fill="url(#namibia-reactor-core)"
      fillOpacity="0.18"
      stroke="#c3f5ff"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    <circle cx="32" cy="32" r="6" fill="#c3f5ff" />
    <path d="M32 18C36.4 18 40 21.6 40 26" stroke="#c3f5ff" strokeWidth="3" strokeLinecap="round" />
    <path d="M44.1 39C41.9 42.8 37.1 44.1 33.3 41.9" stroke="#c3f5ff" strokeWidth="3" strokeLinecap="round" />
    <path d="M19.9 39C17.7 35.2 19 30.4 22.8 28.2" stroke="#c3f5ff" strokeWidth="3" strokeLinecap="round" />

    <circle cx="40.5" cy="26.5" r="2.2" fill="#fbbf24" />
    <circle cx="24.2" cy="26.5" r="2.2" fill="#fbbf24" />
    <circle cx="32" cy="40.8" r="2.2" fill="#fbbf24" />
  </svg>
);

export default NamibiaReactorLogo;