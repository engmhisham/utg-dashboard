// src/app/projects/create/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { ArrowLeft, X, Menu, Upload, Boxes } from 'lucide-react';
import Link from 'next/link';

type Lang = 'en' | 'ar';

export default function ProjectCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // bilingual form (no more images[] here)
  const [form, setForm] = useState({
    title_en:       '',
    description_en: '',
    title_ar:       '',
    description_ar: '',
    url:            '',
  });

  // deferred upload state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previews, setPreviews]         = useState<string[]>([]);

  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [loading, setLoading]       = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const setField = <K extends keyof typeof form>(
    key: K,
    value: typeof form[K]
  ) => setForm(f => ({ ...f, [key]: value }));

  // deferred‐select → preview only
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFiles(prev => [...prev, file]);
    setPreviews(prev => [...prev, URL.createObjectURL(file)]);
  };

  // remove one
  const handleRemove = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // upload helper
  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'projects');
    const res = await fetch(`${API_URL}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Media upload failed');
    }
    const { data: media } = await res.json();
    return media.path;
  };

  // submit: upload each pending file, then POST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      // 1️⃣ upload files in order
      const uploadedUrls: string[] = [];
      for (const file of pendingFiles) {
        const url = await uploadImage(file, token);
        uploadedUrls.push(url);
      }

      // 2️⃣ build payload
      const payload: Record<string, any> = {
        title_en:       form.title_en,
        description_en: form.description_en,
        title_ar:       form.title_ar,
        description_ar: form.description_ar,
        url_en:         form.url,
      };
      // image1Url…imageNUrl
      uploadedUrls.forEach((url, idx) => {
        payload[`image${idx + 1}Url`] = url;
      });

      // 3️⃣ create
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Create failed');
      }

      toast.success('Project created successfully!');
      router.push('/projects');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

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
            {isMobile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 rounded-full bg-white shadow border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/projects" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <Boxes size={24} className="text-gray-500 mr-2" />
                <h1 className="text-xl font-medium ml-2">Create Project</h1>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/projects"
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  <ArrowLeft size={20} />
                </Link>
                <Boxes size={24} className="text-gray-500 mr-2" />
                <h1 className="text-2xl font-semibold">Create Project</h1>
              </div>
            )}
          </div>
        </div>

        {/* form */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* bilingual title & description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex border-b mb-6 space-x-6">
                {(['en','ar'] as Lang[]).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActiveLang(l)}
                    className={`pb-2 ${
                      activeLang === l
                        ? 'border-b-2 border-blue-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {activeLang === 'en' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title (EN) <span className="text-blue-500">*</span>
                    </label>
                    <input
                      required
                      value={form.title_en}
                      onChange={e => setField('title_en', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description (EN)
                    </label>
                    <textarea
                      rows={4}
                      value={form.description_en}
                      onChange={e => setField('description_en', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-right">
                      Title (AR) <span className="text-blue-500">*</span>
                    </label>
                    <input
                      required
                      value={form.title_ar}
                      onChange={e => setField('title_ar', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-right">
                      Description (AR)
                    </label>
                    <textarea
                      rows={4}
                      value={form.description_ar}
                      onChange={e => setField('description_ar', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* URL */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL <span className="text-blue-500">*</span>
                </label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={e => setField('url', e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
            </div>

            {/* images */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Images (max 4)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group border border-gray-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`Project image ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {previews.length < 4 && (
                  <label className="flex flex-col items-center justify-center
                                     border-2 border-dashed border-gray-300
                                     rounded-lg cursor-pointer h-32 text-gray-400
                                     hover:border-blue-500">
                    <Upload size={24} />
                    <span className="text-xs mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 disabled:opacity-60 flex items-center"
              >
                {loading ? (
                  <LoadingSpinner className="h-5 w-5 text-white" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
