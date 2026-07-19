export function MugArt() {
  return (
    <svg
      className="pointer-events-none absolute top-[-7%] right-[-8%] z-[3] h-auto w-[min(82%,470px)] drop-shadow-[0_28px_22px_color-mix(in_srgb,var(--fg)_17%,transparent)] transition-transform duration-200 [transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px))_rotate(-3deg)] group-hover:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(-1deg)] group-focus-within:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(-1deg)] max-md:top-[-3%] max-md:right-[-9%] max-md:w-[min(75%,390px)] max-[420px]:max-w-[340px]"
      viewBox="0 0 520 520"
      role="img"
    >
      <defs>
        <linearGradient id="cat-mug-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bg-card)" />
          <stop offset=".5" stopColor="var(--secondary)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
        <linearGradient id="cat-mug-wrap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset=".48" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
      </defs>
      <ellipse cx="249" cy="426" rx="142" ry="26" fill="color-mix(in srgb, var(--fg) 9%, transparent)" />
      <path
        d="M352 181c69-17 112 13 112 74 0 61-44 102-116 102v-49c38 0 60-20 60-52 0-29-18-40-56-31z"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="25"
      />
      <path
        d="M98 142h268l-17 245c-2 34-28 55-61 59H181c-39-2-61-23-64-59z"
        fill="url(#cat-mug-body)"
        stroke="var(--accent-2)"
        strokeWidth="4"
      />
      <ellipse cx="232" cy="142" rx="134" ry="33" fill="var(--bg-card)" stroke="var(--accent-2)" strokeWidth="4" />
      <ellipse cx="232" cy="146" rx="111" ry="20" fill="var(--accent-2)" />
      <path d="M111 253c66-27 164-24 247 11l-8 103c-76-35-155-39-240-9z" fill="url(#cat-mug-wrap)" />
      <path
        d="M146 198c13-14 23-20 31-17 11 4 5 20 18 22 10 1 18-8 26-27"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M147 325c50-16 109-15 167 4"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CaseArt() {
  return (
    <svg
      className="pointer-events-none absolute bottom-[-13%] left-[-9%] z-[3] h-auto w-[min(69%,390px)] drop-shadow-[0_28px_22px_color-mix(in_srgb,var(--fg)_17%,transparent)] transition-transform duration-200 [transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px))_rotate(8deg)] group-hover:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(5deg)] group-focus-within:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(5deg)] max-md:bottom-[-10%] max-md:left-[-3%] max-md:w-[min(59%,330px)] max-[420px]:max-w-[340px]"
      viewBox="0 0 420 600"
      role="img"
    >
      <defs>
        <linearGradient id="cat-case-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset=".55" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
        <pattern
          id="cat-case-lines"
          width="38"
          height="38"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(22)"
        >
          <rect width="38" height="38" fill="none" />
          <path d="M0 8h38M0 18h38" stroke="rgba(255,255,255,0.72)" strokeWidth="2" />
        </pattern>
      </defs>
      <ellipse cx="205" cy="558" rx="155" ry="26" fill="color-mix(in srgb, var(--fg) 9%, transparent)" />
      <rect x="53" y="24" width="316" height="520" rx="56" fill="var(--accent-2)" transform="translate(12 12)" />
      <rect
        x="53"
        y="24"
        width="316"
        height="520"
        rx="56"
        fill="url(#cat-case-body)"
        stroke="var(--accent-2)"
        strokeWidth="5"
      />
      <rect x="72" y="43" width="278" height="482" rx="39" fill="url(#cat-case-lines)" opacity=".86" />
      <rect
        x="83"
        y="54"
        width="104"
        height="134"
        rx="31"
        fill="var(--accent-2)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="4"
      />
      <circle cx="119" cy="91" r="20" fill="var(--bg-card)" />
      <circle cx="156" cy="145" r="20" fill="var(--bg-card)" />
      <circle cx="118" cy="91" r="10" fill="var(--fg)" />
      <circle cx="155" cy="145" r="10" fill="var(--fg)" />
      <path
        d="M102 376c55-79 108-87 160-25 28 34 53 31 76-10"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  )
}
