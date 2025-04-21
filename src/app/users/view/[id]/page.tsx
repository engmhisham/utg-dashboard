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

  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load user');
        const json = await res.json();
        setUser(json.data);
      } catch (e: any) {
        toast.error(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="mr-2 p-1 rounded-full border shadow"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                <ShieldUser size={20} className="mr-2" />
                User Info
              </h1>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="mx-auto max-w-3xl px-4 pb-24">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : !user ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              User not found
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-medium">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              <dl className="divide-y">
                <div className="py-3 flex justify-between">
                  <dt className="font-medium text-gray-600">Email</dt>
                  <dd className="text-gray-900">{user.email}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="font-medium text-gray-600">Created</dt>
                  <dd className="text-gray-900">
                    {new Date(user.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="font-medium text-gray-600">Updated</dt>
                  <dd className="text-gray-900">
                    {new Date(user.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
