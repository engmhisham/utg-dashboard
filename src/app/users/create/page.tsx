'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, Menu, X, Plus, ShieldUser } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserCreatePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'content_support'
  });

  const handle = (field: string, v: string) =>
    setForm(prev => ({ ...prev, [field]: v }));

  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!r.ok) throw new Error((await r.json()).message || 'Failed');
      toast.success('User created ✅');
      router.push('/users');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

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
                href="/users"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                Create User
              </h1>
            </div>
          </div>
        </div>

        {/* form */}
        <form
          onSubmit={submit}
          className="mx-auto max-w-xl px-4 pb-24 space-y-6"
        >
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input
                required
                value={form.username}
                onChange={e => handle('username', e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => handle('email', e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => handle('password', e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <select
                value={form.role}
                onChange={e => handle('role', e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="admin">admin</option>
                <option value="content_support">content_support</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
