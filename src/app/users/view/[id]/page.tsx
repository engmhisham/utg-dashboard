'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { ArrowLeft, Menu, X, ShieldUser } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserInfoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // detect mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // fetch user data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const json = await res.json();
        const user = json.data ?? json;
        setUser(user);
      } catch (e: any) {
        toast.error(e.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // format date as Day Month Year
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="mr-2 p-1 rounded-full border shadow-sm hover:bg-gray-100 transition"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-3"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="flex items-center text-xl md:text-2xl font-semibold text-gray-800">
                <ShieldUser size={20} className="mr-2 text-gray-600" />
                User Info
              </h1>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="mx-auto max-w-3xl px-4 py-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : !user ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <p>User not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* card header */}
              <div className="flex items-center px-6 py-4 border-b border-gray-100">
                <div className="w-14 h-14 flex items-center justify-center bg-orange-200 rounded-full text-2xl font-bold text-orange-800">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {user.username}
                  </h2>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* user details */}
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">
                      {user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Updated At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(user.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
