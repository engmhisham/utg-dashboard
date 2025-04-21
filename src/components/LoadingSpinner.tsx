// src/components/LoadingSpinner.tsx
export default function LoadingSpinner({ className = '' }: { className?: string }) {
    return (
      <svg
        aria-hidden="true"
        className={`animate-spin h-5 w-5 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
        />
      </svg>
    );
  }
  