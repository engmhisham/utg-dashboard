'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Menu, X, Image as ImageIcon, PencilLine
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Lang = 'en' | 'ar';

export default function BlogEditPage() {
  /* ────────────────────────── routing & UI helpers ───────────────────────── */
  const { id }   = useParams<{ id: string }>();      // <-- param name = [id]
  const router   = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  /* ───────────────────────────── form state ─────────────────────────────── */
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [loading,    setLoading]    = useState(true);

  const [form, setForm] = useState({
    slug: '',
    status: 'draft',
    title_en: '', description_en: '', content_en: '',
    title_ar: '', description_ar: '', content_ar: '',
    coverImageUrl: ''
  });

  const handle = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  /* ───────────────────────── fetch existing blog ────────────────────────── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const r = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}?language=en`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error('Failed to fetch blog');
        const d = await r.json();

        setForm({
          slug:            d.data.slug,
          status:          d.data.status,
          title_en:        d.data.title,
          description_en:  d.data.description,
          content_en:      d.data.content,
          title_ar:        d.translation?.title        || '',
          description_ar:  d.translation?.description  || '',
          content_ar:      d.translation?.content      || '',
          coverImageUrl:   d.data.coverImageUrl        || ''
        });
      } catch {
        toast.error('Failed to load blog');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ─────────────────────────── image upload ─────────────────────────────── */
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get('accessToken');
    const fd    = new FormData();
    fd.append('file', file);

    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      if (!r.ok) throw new Error('Upload failed');
      const d = await r.json();
      handle('coverImageUrl', `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${d.data.url}`);
    } catch {
      toast.error('Upload failed');
    }
  };

  /* ───────────────────────────── submit ──────────────────────────────── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      );
      if (!r.ok) throw new Error((await r.json()).message || 'Failed');
      toast.success('Blog updated ✅');
      router.push('/blogs');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  /* ───────────────────────────── render ──────────────────────────────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading blog…
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
                  className="mr-2 rounded-full p-1 border shadow"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link
                href="/blogs"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                <PencilLine size={20} className="mr-2" />
                Edit Blog
              </h1>
            </div>

            {!isMobile && (
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/blogs')}
                  className="border px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* form */}
        <form
          onSubmit={submit}
          className="mx-auto max-w-7xl px-4 pb-24 space-y-6"
        >
          {/* meta */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Meta</h2>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={e => handle('slug', e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => handle('status', e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* cover image */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Cover image</h2>
            {form.coverImageUrl ? (
              <div className="relative max-w-xs">
                <img src={form.coverImageUrl} className="rounded-lg" />
                <button
                  type="button"
                  onClick={() => handle('coverImageUrl', '')}
                  className="absolute top-2 right-2 bg-white rounded-full shadow p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50 cursor-pointer">
                <ImageIcon size={32} className="text-gray-400 mb-2" />
                <span>Upload cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* language tabs */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex border-b mb-4 space-x-4">
              {(['en', 'ar'] as Lang[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`pb-2 ${
                    activeLang === l
                      ? 'border-b-2 border-blue-600 font-medium'
                      : ''
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {(['en', 'ar'] as Lang[]).map(
              l =>
                activeLang === l && (
                  <div key={l} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title ({l}) *
                      </label>
                      <input
                        required
                        value={(form as any)[`title_${l}`]}
                        onChange={e => handle(`title_${l}`, e.target.value)}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description ({l}) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={(form as any)[`description_${l}`]}
                        onChange={e =>
                          handle(`description_${l}`, e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Content ({l}) *
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={(form as any)[`content_${l}`]}
                        onChange={v => handle(`content_${l}`, v)}
                      />
                    </div>
                  </div>
                )
            )}
          </div>
        </form>

        {/* mobile save bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex space-x-3">
            <button
              onClick={() => router.push('/blogs')}
              className="flex-1 border px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Save
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
