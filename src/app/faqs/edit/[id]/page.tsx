'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import {
  ArrowLeft, Menu, X, PencilLine
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Lang = 'en' | 'ar';

interface FaqForm {
  categoryId: string;
  status: 'active' | 'inactive';
  question_en: string;
  answer_en: string;
  question_ar: string;
  answer_ar: string;
}

export default function FaqEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState<FaqForm>({
    categoryId: '',
    status: 'active',
    question_en: '',
    answer_en: '',
    question_ar: '',
    answer_ar: ''
  });

  const handle = (field: keyof FaqForm, v: string) =>
    setForm(prev => ({ ...prev, [field]: v }));

  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories?type=faq`);
        const data = await res.json();
        setCategories(data.data || []);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');

        const enRes = await fetch(`${API_BASE_URL}/faqs/${id}?language=en`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const en = (await enRes.json()).data;

        const arRes = await fetch(`${API_BASE_URL}/faqs/${id}?language=ar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ar = (await arRes.json()).data;

        setForm({
          categoryId: en.category?.id || '',
          status: en.status,
          question_en: en.question,
          answer_en: en.answer,
          question_ar: ar?.question || '',
          answer_ar: ar?.answer || ''
        });
      } catch (e: any) {
        toast.error(e.message || 'Error loading FAQ');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      toast.success('FAQ updated');
      router.push('/faqs');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong!');
    }
  };

  const cancel = () => router.push('/faqs');

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading FAQ…</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 bg-white rounded-full border shadow-sm"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link href="/faqs" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold ml-2 flex items-center">
              <PencilLine size={20} className="mr-2" />
              Edit FAQ
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-20">
          <form onSubmit={submit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={e => handle('categoryId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="">Select category</option>
                  {Array.isArray(categories) && categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={e => handle('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* English section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-medium">English</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Question (EN)</label>
                <input
                  value={form.question_en}
                  onChange={e => handle('question_en', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer (EN)</label>
                <textarea
                  rows={5}
                  value={form.answer_en}
                  onChange={e => handle('answer_en', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>
            </div>

            {/* Arabic section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-medium">Arabic</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Question (AR)</label>
                <input
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg p-3 text-right"
                  value={form.question_ar}
                  onChange={e => handle('question_ar', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer (AR)</label>
                <textarea
                  dir="rtl"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3 text-right"
                  value={form.answer_ar}
                  onChange={e => handle('answer_ar', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
