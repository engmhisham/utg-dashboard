'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Cookies from 'js-cookie';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
  ArrowLeft,
  Search,
  Trash2,
  BookUser,
  Menu,
  X,
  PencilLine,
  Mails
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmModal from '@/src/components/ConfirmModal';

type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
};

export default function ContactPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const openDeleteModal = (id: string) => {
    setMsgToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setMsgToDelete(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = async () => {
    if (!msgToDelete) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-messages/${msgToDelete}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setMessages(prev => prev.filter(m => m.id !== msgToDelete));
      toast.success('Deleted!');
    } catch {
      toast.error('Delete failed!');
    } finally {
      closeDeleteModal();
    }
  };

  // viewport check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // fetch messages
  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const res = await fetch(`${API_BASE_URL}/contact-messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data.data.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load messages ❌');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = messages.filter(msg => {
    const q = searchQuery.toLowerCase();
    return (
      msg.fullName.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  const toggleMessageSelection = (id: string) =>
    setSelectedMessages(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    if (selectedMessages.length === filtered.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filtered.map(m => m.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Deleted!');
    } catch {
      toast.error('Delete failed!');
    }
  };

  const handleView = (id: string) => {
    router.push(`/contact/edit/${id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 bg-white rounded-full shadow-md border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <Mails size={22} className="mr-2" /> Contact Messages
              </h1>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map(msg => (
                      <tr
                        key={msg.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleView(msg.id)}
                      >
                        <td className="px-6 py-4">{msg.fullName}</td>
                        <td className="px-6 py-4 text-blue-600">{msg.email}</td>
                        <td className="px-6 py-4">{msg.subject}</td>
                        <td className="px-6 py-4 truncate max-w-sm">{msg.message}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(msg.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={e => {e.stopPropagation(); openDeleteModal(msg.id)}}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No contact messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(msg => (
                <div
                  key={msg.id}
                  className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer"
                  onClick={() => handleView(msg.id)}
                >
                  {/* card header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {msg.fullName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  {/* card body */}
                  <div className="text-sm text-blue-600">{msg.email}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    <strong>Subject:</strong> {msg.subject}
                  </div>
                  <div className="text-sm text-gray-700 mt-1 truncate">
                    {msg.message}
                  </div>
                  {/* card actions */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={e => {e.stopPropagation(); openDeleteModal(msg.id)}}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                <p className="text-gray-500">No contact messages found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ConfirmModal
        show={deleteModalOpen}
        message="Delete this message?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
