// Original illustration: a student in a graduation cap reading, with a CBT screen.
export default function HeroArt({ compact = false }) {
  return (
    <svg
      viewBox={compact ? '50 34 200 196' : '0 0 320 230'}
      className="hm-art"
      role="img"
      aria-label="A student in a graduation cap reading a book"
    >
      <circle cx="150" cy="122" r="94" fill="#d8f3e1" />
      <circle cx="40" cy="60" r="5" fill="#fbbf24" />
      <circle cx="292" cy="150" r="4" fill="#86efac" />
      <path d="M268 20l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fbbf24" />
      <path d="M66 226c0-48 32-72 84-72s84 24 84 72z" fill="#f97316" />
      <rect x="138" y="128" width="24" height="30" rx="10" fill="#a86b3c" />
      <circle cx="150" cy="106" r="34" fill="#b97a47" />
      <path d="M116 106c-2-20 12-30 34-30s36 10 34 30c-6-12-18-16-34-16s-28 4-34 16z" fill="#1f1a17" />
      <circle cx="138" cy="110" r="2.8" fill="#1f1a17" />
      <circle cx="162" cy="110" r="2.8" fill="#1f1a17" />
      <path d="M140 122q10 8 20 0" stroke="#1f1a17" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M124 72v14q26 12 52 0V72z" fill="#166534" />
      <path d="M96 66l54-24 54 24-54 22z" fill="#14532d" />
      <path d="M204 66v28" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <circle cx="204" cy="98" r="5" fill="#fbbf24" />
      <path d="M92 192l58-14 58 14v36l-58-14-58 14z" fill="#fff" stroke="#14532d" strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 178v36" stroke="#14532d" strokeWidth="3" />
      <path d="M106 200l34-8M106 210l34-8M160 192l34 8M160 202l34 8" stroke="#bbf7d0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="94" cy="196" r="9" fill="#b97a47" />
      <circle cx="206" cy="196" r="9" fill="#b97a47" />
      {!compact && (
        <g transform="rotate(5 262 74)">
          <rect x="216" y="36" width="92" height="76" rx="12" fill="#fff" stroke="#0f5a33" strokeWidth="3" />
          <rect x="216" y="36" width="92" height="16" rx="10" fill="#0f5a33" />
          <circle cx="232" cy="62" r="6" fill="#22c55e" /><path d="M229 62l2.4 2.4 4-4.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="244" y="59" width="50" height="6" rx="3" fill="#cbd5e1" />
          <circle cx="232" cy="82" r="6" fill="#22c55e" /><path d="M229 82l2.4 2.4 4-4.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="244" y="79" width="40" height="6" rx="3" fill="#cbd5e1" />
          <circle cx="232" cy="102" r="6" fill="#fbbf24" />
          <rect x="244" y="99" width="46" height="6" rx="3" fill="#cbd5e1" />
        </g>
      )}
    </svg>
  )
}
