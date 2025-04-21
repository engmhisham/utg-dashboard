// app/(auth)/reset-password/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/src/components/LoadingSpinner';

type VerifyState = 'checking' | 'invalid' | 'valid';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [verifyState, setVerifyState] = useState<VerifyState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setVerifyState('invalid');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error();
        setVerifyState('valid');
      } catch {
        setVerifyState('invalid');
      }
    })();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Reset failed');
      }
      router.push('/login?reset=success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  if (verifyState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="text-purple-600 h-8 w-8" />
      </div>
    );
  }

  if (verifyState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Invalid or expired link</h1>
          <button
            className="text-purple-600 hover:underline"
            onClick={() => router.push('/forgot-password')}
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  // verifyState === 'valid'
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Set a new password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
          >
            {submitting && <LoadingSpinner />}
            <span>Reset password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
