'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import LoadingSpinner from '@/src/components/LoadingSpinner';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full w-full">
          <LoadingSpinner className="text-purple-600 h-8 w-8" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
