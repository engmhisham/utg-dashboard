'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  BookUser,
  Mails,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ViewContactMessagePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');

      try {
        const res = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load message');
        const data = await res.json();
        setMessage(data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch contact message ❌');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
  }, [id]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 bg-white rounded-full border shadow-sm">
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/contact" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <Mails className="mr-2" size={22} /> View Contact Message
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 pb-24 md:pb-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : !message ? (
            <div className="text-center text-red-500 mt-10">Message not found.</div>
          ) : (
            <form className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-medium mb-4">Contact Message Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={message.fullName}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={message.email}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={message.phone || ''}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={message.subject}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={message.message}
                      rows={6}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={new Date(message.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      disabled
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
