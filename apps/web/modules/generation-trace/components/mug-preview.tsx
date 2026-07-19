'use client'

import { useId } from 'react'

export function MugPreview({ stage }: { stage: number }) {
  const uid = useId()
  const wrapOpacity = stage === 1 ? 0.2 : stage === 2 ? 0.48 : 1
  const patternOpacity = stage === 1 ? 0.12 : stage === 2 ? 0.65 : 1

  return (
    <svg
      className="pointer-events-none absolute top-[388px] right-[18px] left-auto z-[3] h-[152px] w-[132px] drop-shadow-[0_22px_22px_color-mix(in_srgb,var(--fg)_18%,transparent)] md:top-[169px] md:right-auto md:left-1/2 md:h-[220px] md:w-[192px] md:-translate-x-1/2"
      viewBox="0 0 220 250"
      role="img"
      aria-label="Ceramic mug with a rose wrap moving through the generation workflow"
      data-stage={stage}
    >
      <defs>
        <linearGradient id={`${uid}-ceramic`} x1="0" x2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--border) 40%, white)" />
          <stop offset=".23" stopColor="var(--bg-card)" />
          <stop offset=".78" stopColor="var(--bg)" />
          <stop offset="1" stopColor="var(--border-strong)" />
        </linearGradient>
        <linearGradient id={`${uid}-wrap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--accent) 40%, white)" />
          <stop offset=".5" stopColor="var(--accent)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--accent) 70%, black)" />
        </linearGradient>
        <clipPath id={`${uid}-body`}>
          <path d="M42 42 C43 23 156 23 158 42 L153 192 C151 218 55 218 49 192 Z" />
        </clipPath>
      </defs>
      <g className="origin-[50%_75%] animate-[product-settle_700ms_var(--ease)_both]">
        <path
          d="M153 67 C207 55 211 165 160 166"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="23"
          strokeLinecap="round"
        />
        <path
          d="M155 77 C190 69 191 151 159 153"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M42 42 C43 23 156 23 158 42 L153 192 C151 218 55 218 49 192 Z"
          fill={`url(#${uid}-ceramic)`}
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="42" rx="58" ry="17" fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="2" />
        <ellipse cx="100" cy="41" rx="49" ry="10" fill="var(--accent-2)" />
        <ellipse cx="94" cy="38" rx="33" ry="5" fill="var(--accent-warm)" opacity=".45" />
        <g clipPath={`url(#${uid}-body)`}>
          <path
            d="M42 78 C71 62 128 91 159 70 L157 165 C121 183 84 147 46 172 Z"
            fill={`url(#${uid}-wrap)`}
            opacity={wrapOpacity}
            className="transition-opacity duration-300"
          />
          <g fill="color-mix(in srgb, var(--bg-card) 90%, var(--secondary))" opacity={patternOpacity} className="transition-opacity duration-300">
            <circle cx="70" cy="104" r="13" />
            <circle cx="118" cy="137" r="18" opacity=".72" />
            <path
              d="M44 145 C76 109 109 92 158 98"
              fill="none"
              stroke="color-mix(in srgb, var(--accent) 20%, white)"
              strokeWidth="5"
            />
            <path
              d="M54 165 C88 135 115 120 156 121"
              fill="none"
              stroke="color-mix(in srgb, var(--accent) 70%, black)"
              strokeWidth="4"
              opacity=".7"
            />
          </g>
        </g>
        <path d="M51 189 C74 209 128 209 151 190" fill="none" stroke="white" strokeWidth="3" opacity=".7" />
        <ellipse cx="101" cy="219" rx="57" ry="8" fill="var(--fg)" opacity=".15" />
      </g>
      <style>{`@keyframes product-settle{from{opacity:.6;transform:translateY(6px) rotate(-1deg)}to{opacity:1;transform:translateY(0) rotate(0)}}`}</style>
    </svg>
  )
}
