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
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ConfirmModal from '@/src/components/ConfirmModal';

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
  const [forbidden,   setForbidden]   = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete,    setUserToDelete]    = useState<string | null>(null);

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
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (r.status === 403) {
          // ليس لديك صلاحية لعرض المستخدمين
          setForbidden(true);
          return;
        }
        if (!r.ok) {
          throw new Error('Failed to fetch users');
        }

        const d = await r.json();
        setUsers(d.data);
      } catch (e: any) {
        toast.error(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // فتح/إغلاق مودال الحذف
  const openDeleteModal = (id: string) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setUserToDelete(null);
    setDeleteModalOpen(false);
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.status === 403) {
        toast.error("You don’t have permission to delete this user.");
        return;
      }
      if (!r.ok) throw new Error('Delete failed');
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      toast.success('User deleted');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      closeDeleteModal();
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/users/edit/${id}`);
  };

  // --- Render ---
  // حالة لا صلاحية
  // if (!loading && forbidden) {
  //   return (
  //     <div className="flex h-screen bg-gray-50">
  //       <Sidebar
  //         isOpen={sidebarOpen}
  //         toggleSidebar={() => setSidebarOpen(o => !o)}
  //       />
  //       <main className="flex-1 flex items-center justify-center">
  //         <div className="bg-white p-6 rounded-xl shadow text-center">
  //           <p className="text-lg font-medium text-red-600">
  //             You don’t have permission to view users.
  //           </p>
  //           <button
  //             onClick={() => router.back()}
  //             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //           >
  //             Go Back
  //           </button>
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

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
                <ShieldUser size={22} className="mr-2" />
                Users
              </h1>
            </div>
            <button
              onClick={() => router.push('/users/create')}
              disabled={forbidden || loading}
              className={`flex items-center px-4 py-2 rounded-xl 
              ${(forbidden || loading)
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'}`
              }>
              <Plus size={18} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* table */}
        <div className="hidden md:block mx-auto max-w-5xl px-4 pb-24">
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <div className="flex justify-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : forbidden ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-red-600">
                      You don’t have permission to view users data.
                    </td>
                  </tr>
                ): users.length > 0 ? (
                  users.map(u => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEdit(u.id)}
                    >
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4 text-blue-600">{u.email}</td>
                      <td className="px-6 py-4">{u.role}</td>
                      <td className="px-6 py-4">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleEdit(u.id); }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); openDeleteModal(u.id); }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 px-4 pb-24">
          {loading ? (
            <div className="py-8 text-center">
              <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
            </div>
          ) : forbidden ? (
            <div className="py-12 bg-white rounded-xl border shadow-sm text-center text-red-600">
              You don’t have permission to view users.
            </div>
          ): users.length > 0 ? (
            users.map(u => (
              <div
                key={u.id}
                className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer"
                onClick={() => handleEdit(u.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-900">{u.username}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-blue-600 mb-2">{u.email}</div>
                <div className="text-sm text-gray-700 mb-4">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {u.role}
                  </span>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={e => { e.stopPropagation(); handleEdit(u.id); }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilLine size={16} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); openDeleteModal(u.id); }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </div>

        <ConfirmModal
          show={deleteModalOpen}
          message="Delete this user?"
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      </main>
    </div>
  );
}
