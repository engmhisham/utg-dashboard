'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * A responsive Login page inspired by your provided design screenshot.
 * Tailwind CSS is assumed to be set up globally.
 */
export default function LoginPage() {
  const router = useRouter();
  
  // Local state for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Example login handler (replace with real auth logic)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    // TODO: call your API or auth service here
    router.push('/'); // navigate away on success, for example
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      
      {/* Left Panel: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 bg-white">
        {/* Logo or Brand Name */}
        <div className="mb-8 flex items-center gap-2">
          {/* Replace this text with your logo */}
          <span className="text-4xl font-bold text-purple-800">
            UTG 
          </span>
          <span className="text-2xl font-bold text-gray-800">
            Dashboard
          </span>
        </div>
        
        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Login
          </button>

          {/* Forgot Password */}
          <div className="mt-3 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-purple-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>

      {/* Right Panel: Illustration & Text */}
      <div className="relative w-full md:w-3/4 h-96 md:h-screen overflow-hidden bg-purple-600 flex items-center justify-center">
        {/* Content on top of the wave */}
        <div className="relative z-10 px-6 md:px-0 text-white text-center w-full">
          {/* <h2 className="text-xl md:text-3xl font-semibold mb-4">
            Welcome to UTG Admin Panel!
          </h2> */}
          {/* Placeholder illustration image */}
          <img
            src="/login1.png"
            alt="Login illustration"
            className="mx-auto w-full md:w-full"
          />
        </div>
      </div>

    </div>
  );
}
