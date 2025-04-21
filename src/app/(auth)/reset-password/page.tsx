// app/(auth)/reset-password/page.tsx
'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import LoadingSpinner from '@/src/components/LoadingSpinner';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="text-purple-600 h-8 w-8" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
