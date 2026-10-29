import type React from 'react';

// The open aperture and ascending trace express inspectable financial change.
export const EquityLensMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M30.9 9.1a15.4 15.4 0 1 0 0 21.8" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" />
    <path d="M33.5 13.2a15.3 15.3 0 0 1 0 13.6" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" />
    <path d="m10.5 24.6 6.1-5.2 4.7 2.7 8.1-9.3" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="29.4" cy="12.8" r="2.6" fill="currentColor" />
  </svg>
);
