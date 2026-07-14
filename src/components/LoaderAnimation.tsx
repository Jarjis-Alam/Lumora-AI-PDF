import { memo } from 'react';

export const LoaderAnimation = memo(function LoaderAnimation() {
  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      {/* Soft spotlight behind the loader */}
      <div 
        className="absolute w-80 h-32 rounded-full blur-[72px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(192, 57, 43, 0.15) 0%, rgba(192, 57, 43, 0.04) 60%, transparent 100%)',
        }}
      />

      <div className="loader relative z-10 flex items-center justify-center">
        {/* Middle Concentric circles pl Loader (by Nawsome) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          height="128px"
          width="128px"
          className="pl inline-block"
        >
          <circle
            strokeDashoffset="-376.4"
            strokeDasharray="377 377"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="8"
            stroke="#C0392B"
            fill="none"
            r="60"
            cy="64"
            cx="64"
            className="pl__ring1"
          />
          <circle
            strokeDashoffset="-329.3"
            strokeDasharray="329.9 329.9"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="7"
            stroke="#A93226"
            fill="none"
            r="52.5"
            cy="64"
            cx="64"
            className="pl__ring2"
          />
          <circle
            strokeDashoffset="-288.6"
            strokeDasharray="289 289"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="6"
            stroke="#8B2A20"
            fill="none"
            r="46"
            cy="64"
            cx="64"
            className="pl__ring3"
          />
          <circle
            strokeDashoffset="-254"
            strokeDasharray="254.5 254.5"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="5"
            stroke="#6E2219"
            fill="none"
            r="40.5"
            cy="64"
            cx="64"
            className="pl__ring4"
          />
          <circle
            strokeDashoffset="-225.8"
            strokeDasharray="226.2 226.2"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="4"
            stroke="#561B14"
            fill="none"
            r="36"
            cy="64"
            cx="64"
            className="pl__ring5"
          />
          <circle
            strokeDashoffset="-203.9"
            strokeDasharray="204.2 204.2"
            strokeLinecap="round"
            transform="rotate(-90,64,64)"
            strokeWidth="3"
            stroke="#3C100B"
            fill="none"
            r="32.5"
            cy="64"
            cx="64"
            className="pl__ring6"
          />
        </svg>
      </div>
    </div>
  );
});
