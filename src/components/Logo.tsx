export function Logo({ size = 32, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Document Outline */}
        <path
          d="M44 14 H68 C76 14 78 16 78 24 V68"
          stroke="#1E1E1E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 4-pointed Star */}
        <path
          d="M60 20 C60 28 58 30 50 30 C58 30 60 32 60 40 C60 32 62 30 70 30 C62 30 60 28 60 20 Z"
          fill="#8C1D18"
        />

        {/* Lines */}
        <line x1="45" y1="50" x2="75" y2="50" stroke="#1E1E1E" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="45" y1="58" x2="75" y2="58" stroke="#1E1E1E" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="45" y1="66" x2="65" y2="66" stroke="#1E1E1E" strokeWidth="3.5" strokeLinecap="round" />

        {/* Swoops / Curved page folds at the bottom */}
        <path
          d="M26 88 C48 88 68 84 76 66 C73 78 52 88 26 88 Z"
          fill="#8C1D18"
        />
        <path
          d="M36 90 C56 90 74 86 81 74 C77 82 58 90 36 90 Z"
          fill="#8C1D18"
        />
        <path
          d="M46 92 C64 92 80 90 85 82 C80 90 66 92 46 92 Z"
          fill="#8C1D18"
        />

        {/* "L" Serif Letter */}
        <text
          x="12"
          y="88"
          fontFamily="'Source Serif 4', Georgia, serif"
          fontWeight="700"
          fontSize="84"
          fill="#8C1D18"
        >
          L
        </text>
      </svg>
      {withWordmark && (
        <span className="font-serif text-xl font-semibold tracking-editorial text-ink-800">
          Lumora
        </span>
      )}
    </div>
  );
}
