// app/(auth)/forgot-password/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'loading'>('idle');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      setStatus('sent');
    } catch (err) {
      setStatus('sent'); //Same message for success and error to avoid leaking info
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>

        {status === 'sent' ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              إذا وجدنا حسابًا يطابق هذا البريد، فسوف نرسل رسالة تحتوي على رابط إعادة التعيين.
            </p>
            <button
              className="text-purple-600 hover:underline"
              onClick={() => router.push('/login')}
            >
              الرجوع إلى تسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {status === 'loading' && <LoadingSpinner />}
              <span>Send reset link</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
