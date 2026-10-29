import React from 'react';

interface KamatelaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export const KamatelaLogo: React.FC<KamatelaLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  animated = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Vector SVG Icon */}
      <div
        className={`relative shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/10 transition-transform ${
          animated ? 'hover:scale-105 active:scale-95' : ''
        }`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          viewBox="0 0 192 192"
          width="100%"
          height="100%"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="klBg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stop-color="#182338" />
              <stop offset="60%" stop-color="#0c1220" />
              <stop offset="100%" stop-color="#060911" />
            </radialGradient>
            <linearGradient id="klEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="50%" stop-color="#06D6A0" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
            <linearGradient id="klViolet" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366F1" />
              <stop offset="50%" stop-color="#8B5CF6" />
              <stop offset="100%" stop-color="#A855F7" />
            </linearGradient>
            <linearGradient id="klCoral" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F43F5E" />
              <stop offset="50%" stop-color="#FB7185" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
            <linearGradient id="klShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.38" />
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          {/* Squircle Base */}
          <rect x="6" y="6" width="180" height="180" rx="46" fill="url(#klBg)" />
          <rect x="7" y="7" width="178" height="178" rx="45" fill="none" stroke="url(#klShine)" stroke-width="1.8" />

          {/* Glow lights */}
          <circle cx="60" cy="96" r="48" fill="#10B981" opacity="0.16" />
          <circle cx="130" cy="70" r="45" fill="#8B5CF6" opacity="0.18" />
          <circle cx="135" cy="130" r="45" fill="#F43F5E" opacity="0.16" />

          {/* Sculpted Monogram "K" */}
          <g>
            {/* Left Pillar + KAMATELA Chat Speech Bubble Tail */}
            <path
              d="M48 48 C48 42, 53 38, 59 38 L68 38 C74 38, 79 43, 79 49 L79 143 C79 149, 74 154, 68 154 L59 154 C53 154, 48 149, 48 143 Z"
              fill="url(#klEmerald)"
            />
            <path d="M51 133 L38 145 C35 148, 38 152, 42 151 L53 148 Z" fill="url(#klEmerald)" />

            {/* Upper Wing (Music & Voice stream) */}
            <path
              d="M85 102 C81 97, 81 90, 86 85 L120 46 C125 41, 132 40, 137 45 L144 51 C149 55, 149 63, 144 68 L112 101 C107 106, 100 106, 95 102 Z"
              fill="url(#klViolet)"
            />

            {/* Lower Wing (Video pulse) */}
            <path
              d="M88 93 C93 89, 99 89, 104 94 L141 132 C146 137, 146 145, 141 150 L134 156 C129 161, 121 160, 116 155 L84 113 C79 108, 81 100, 88 93 Z"
              fill="url(#klCoral)"
            />

            {/* Center Glowing Hub */}
            <circle cx="95" cy="98" r="7.5" fill="#FFFFFF" />

            {/* Sound Wave Micro-bars */}
            <g fill="#FFFFFF" opacity="0.95">
              <rect x="58" y="88" width="2" height="10" rx="1" />
              <rect x="62" y="83" width="2" height="20" rx="1" />
              <rect x="66" y="86" width="2" height="14" rx="1" />
              <rect x="70" y="90" width="2" height="6" rx="1" />
            </g>
          </g>

          {/* Sparkle Accent */}
          <path d="M148 30 L150 35 L155 37 L150 39 L148 44 L146 39 L141 37 L146 35 Z" fill="#F59E0B" />
        </svg>
      </div>

      {/* Modern Wordmark Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-wider font-black text-sm md:text-base leading-none">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
              KAMATELA
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 animate-pulse shadow-sm shadow-emerald-400/80" />
          </div>
          <span className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase mt-0.5">
            Super App
          </span>
        </div>
      )}
    </div>
  );
};
