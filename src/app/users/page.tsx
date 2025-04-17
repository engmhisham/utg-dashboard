'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Menu, X, ShieldUser, Trash2, PencilLine
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [users,       setUsers]       = useState<User[]>([]);
  const handleEdit = (id: string) => router.push(`/users/edit/${id}`);

  /* viewport */
  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  /* fetch users */
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!r.ok) throw new Error('Failed to fetch users');
        const d = await r.json();
        setUsers(d.data);
      } catch (e: any) {
        toast.error(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* delete */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error('Delete failed');
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading users…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
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
                <ShieldUser size={22} className="mr-2" />
                Users
              </h1>
            </div>

            <button
              onClick={() => router.push('/users/create')} // 👈 HERE
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* table */}
        <div className="mx-auto max-w-5xl px-4 pb-24">
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                    <tr
                        key={u.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEdit(u.id)}
                    >
                    <td className="px-6 py-4">{u.username}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.role}</td>
                    <td className="px-6 py-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/users/${u.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
