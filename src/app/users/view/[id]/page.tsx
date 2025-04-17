'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
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
  const { id }     = useParams<{ id: string }>();
  const router      = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [user,        setUser]        = useState<User | null>(null);

  /* viewport helper */
  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  /* fetch user */
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!r.ok) throw new Error('Failed to load user');
        const d = await r.json();
        setUser(d.data);
      } catch (e: any) {
        toast.error(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">Loading user…</div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">User not found</div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="mr-2 p-1 rounded-full border shadow">
                  {sidebarOpen ? <X size={24}/> : <Menu size={24}/> }
                </button>
              )}
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20}/>
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                <ShieldUser size={20} className="mr-2"/>User Info
              </h1>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="mx-auto max-w-3xl px-4 pb-24">
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-medium">
              {user.username ? user.username[0].toUpperCase() : '?'}
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
                <dd className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="font-medium text-gray-600">Updated</dt>
                <dd className="text-gray-900">{new Date(user.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
