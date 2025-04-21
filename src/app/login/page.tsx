'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged‑in
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Login failed');

      const { accessToken, user } = json.data || {};
      if (accessToken && user) {
        Cookies.set('accessToken', accessToken, { expires: 1 });
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard';              // full reload
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);                                  // ⬅️ ALWAYS clear
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 bg-white">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-4xl font-bold text-purple-800">UTG</span>
          <span className="text-2xl font-bold text-gray-800">Dashboard</span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          {/* email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500
              ${loading
                ? 'bg-purple-600 opacity-60 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'}
            `}
          >
            {loading ? (
              // Accessible spinner (Tailwind)
              <svg
                aria-hidden="true"
                className="animate-spin h-5 w-5 text-white"
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
            ) : (
              'Login'
            )}
          </button>

          <div className="mt-3 text-center">
            <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>

      {/* Right panel */}
      <div className="relative w-full md:w-3/4 h-96 md:h-screen overflow-hidden bg-purple-600 flex items-center justify-center">
        <div className="relative z-10 px-6 md:px-0 text-white text-center w-full">
          <img src="/login1.png" alt="Login illustration" className="mx-auto w-full md:w-full" />
        </div>
      </div>
    </div>
  );
}
