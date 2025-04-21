'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
  ArrowLeft, X, Menu, Upload
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // helper
  const setField = (k: keyof typeof form, v: any) =>
    setForm(f => ({ ...f, [k]: v }));

  // upload one file, push its URL into form.images[]
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get('accessToken');
    const data  = new FormData();
    data.append('file', file);

    try {
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        }
      );
      const json = await res.json();
      const url  = `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${json.data.url}`;

      setForm(f => ({
        ...f,
        images: [...f.images, url],
      }));
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Image upload failed');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');

      // Build your payload WITHOUT a raw "images" array:
      const payload: Record<string, any> = {
        title_en:        form.title,
        description_en:  form.description,
        url_en:          form.url,
        title_ar:        form.title,
        description_ar:  form.description,
        url_ar:          form.url,
      };

      // Instead, sprinkle in image1Url, image2Url, ... up to image4Url
      form.images.forEach((img, i) => {
        payload[`image${i + 1}Url`] = img;
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Create failed');
      }

      toast.success('Project created 🎉');
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
                <Link
                  href="/projects"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </Link>
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
                <h1 className="text-2xl font-semibold">Create Project</h1>
              </div>
            )}
          </div>
        </div>

        {/* form */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={submit} className="space-y-6">
            {/* basic info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={e => setField('url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* images */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Images (max 4)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group border border-gray-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Project image ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          'images',
                          form.images.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {form.images.length < 4 && (
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
