'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import {
  ArrowLeft, Plus, Menu, X, UsersRound
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function FaqCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    category: 'general',
    status: 'active',
    question_en: '',
    answer_en: '',
    question_ar: '',
    answer_ar: ''
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');

      const res = await fetch(`${API_BASE_URL}/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create FAQ');
      toast.success('FAQ created successfully');
      router.push('/faqs');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/faqs');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 bg-white rounded-full border shadow-sm">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link href="/faqs" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold ml-2">Create New FAQ</h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category & Status */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* English Fields */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-medium">English</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Question (EN)</label>
                <input
                  type="text"
                  name="question_en"
                  value={formData.question_en}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer (EN)</label>
                <textarea
                  name="answer_en"
                  value={formData.answer_en}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                ></textarea>
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-medium">Arabic</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Question (AR)</label>
                <input
                  type="text"
                  name="question_ar"
                  value={formData.question_ar}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer (AR)</label>
                <textarea
                  name="answer_ar"
                  value={formData.answer_ar}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
