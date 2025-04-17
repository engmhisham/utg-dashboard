'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  Search,
  Trash2,
  BookUser,
  Menu,
  X,
  PencilLine,
  EyeIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const res = await fetch(`${API_BASE_URL}/contact-messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setMessages(data.data.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load messages ❌');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    return (
      msg.fullName.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      setMessages(prev => prev.filter(msg => msg.id !== id));
      toast.success('Message deleted ✅');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete ❌');
    }
  };

  const toggleMessageSelection = (id: string) => {
    setSelectedMessages(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };
  const handleView = (id: string) => {
    router.push(`/contact/edit/${id}`);
  };
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 bg-white rounded-full shadow-md border">
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <BookUser className="mr-2" size={22} /> Contact Messages
              </h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map(message => (
                    <tr key={message.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleView(message.id)}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600"
                          checked={selectedMessages.includes(message.id)}
                          onChange={() => toggleMessageSelection(message.id)}
                        />
                      </td>
                      <td className="px-6 py-4">{message.fullName}</td>
                      <td className="px-6 py-4 text-blue-600">{message.email}</td>
                      <td className="px-6 py-4">{message.subject}</td>
                      <td className="px-6 py-4 truncate max-w-sm">{message.message}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(message.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredMessages.map(message => (
              <div key={message.id} className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer" onClick={() => handleView(message.id)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 mr-2"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                    />
                    <span className="text-sm font-medium text-gray-900">{message.fullName}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-blue-600">{message.email}</div>
                <div className="text-sm text-gray-700 mt-1"><strong>Subject:</strong> {message.subject}</div>
                <div className="text-sm text-gray-700 mt-1">{message.message}</div>
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && filteredMessages.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
              <p className="text-gray-500">No contact messages found.</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          )}
        </div>
      </main>
    </div>
  );
}
