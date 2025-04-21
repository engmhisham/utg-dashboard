// app/(auth)/layout.tsx
'use client';

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left panel: will render the specific page’s form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 bg-white">
        {children}
      </div>

      {/* Right panel: shared illustration */}
      <div className="relative w-full md:w-3/4 h-96 md:h-screen overflow-hidden bg-purple-600 flex items-center justify-center">
        <div className="relative z-10 px-6 md:px-0 text-white text-center w-full">
          <img
            src="/login1.png"
            alt="Auth illustration"
            className="mx-auto w-full md:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
