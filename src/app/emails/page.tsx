'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ConfirmModal from '@/src/components/ConfirmModal';
import PermissionModal from '@/src/components/PermissionModal';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { ArrowLeft, Trash2, FileDown, Mail, Menu, X, MailCheck } from 'lucide-react';

type Subscription = {
  id: string;
  email: string;
  subscribed_at: string;
};

export default function SubscriptionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserRole(data.data.role);
    } catch {
      setUserRole(null);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscriptions(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchSubscriptions();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = Cookies.get('accessToken');
      await fetch(`${API_URL}/subscriptions/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(prev => prev.filter(s => s.id !== deleteId));
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleExport = async () => {
    const token = Cookies.get('accessToken');
    const res = await fetch(`${API_URL}/subscriptions/export/excel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.xlsx';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 bg-white rounded-full shadow border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <MailCheck size={22} className="mr-2" /> Subscriptions
              </h1>
            </div>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FileDown size={16} className="mr-2" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-10">

          {/* Desktop Table */}
          <div className="hidden md:block bg-white shadow-sm rounded-xl border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Subscribed At</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                    <td colSpan={3}>
                      <div className="py-8 flex justify-center items-center">
                        <LoadingSpinner className="h-6 w-6 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                  ) : subscriptions.length > 0 ? (
                    subscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(Date.parse(sub.subscribed_at)).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          {userRole === 'admin' && (
                            <button
                              onClick={() => {
                                setDeleteId(sub.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-500">
                        No subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 mt-4">
            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : subscriptions.length > 0 ? (
              subscriptions.map(sub => (
                <div key={sub.id} className="bg-white border shadow-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{sub.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sub.subscribed_at).toLocaleString()}
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setDeleteId(sub.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
                <p className="text-gray-500">No subscriptions found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        show={showDeleteModal}
        message="Delete this subscription?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <PermissionModal
        show={showUnauthorizedModal}
        message="You don’t have permission to perform this action."
        onClose={() => setShowUnauthorizedModal(false)}
      />
    </div>
  );
}
