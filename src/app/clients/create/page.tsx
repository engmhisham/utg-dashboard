// src/app/clients/create/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
  ArrowLeft,
  UsersRound,
  Menu,
  X,
  ImageIcon,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';

type Lang = 'en' | 'ar';

export default function ClientCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // form state
  const [formData, setFormData] = useState({
    status:         'active',
    logoUrl:        '',
    title_en:       '',
    description_en: '',
    url_en:         '',
    title_ar:       '',
    description_ar: '',
  });

  // deferred upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);

  const [activeLang, setActiveLang]   = useState<Lang>('en');
  const [loading, setLoading]         = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const setField = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => setFormData(f => ({ ...f, [key]: value }));

  // 1️⃣ deferred select → preview only
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // 2️⃣ upload helper (identical to blogs/brands)
  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'clients');
    const res = await fetch(`${API_URL}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Media upload failed');
    }
    const { data: media } = await res.json();
    return media.path;
  };

  // 3️⃣ submit: upload logo if needed, then POST client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      // upload pending logo
      let logoUrl = formData.logoUrl;
      if (pendingFile) {
        logoUrl = await uploadImage(pendingFile, token);
      }

      const payload = {
        status:          formData.status,
        logoUrl,
        title_en:        formData.title_en,
        description_en:  formData.description_en,
        url_en:          formData.url_en,
        title_ar:        formData.title_ar,
        description_ar:  formData.description_ar,
      };

      const res = await fetch(`${API_URL}/clients`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || res.statusText);
      }

      toast.success('Client created!');
      router.push('/clients');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/clients');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center">
            {isMobile ? (
              <>
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 rounded-full bg-white shadow border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link
                  href="/clients"
                  className="text-gray-500 hover:text-gray-700 ml-3"
                >
                  <ArrowLeft size={20} />
                </Link>
                <UsersRound size={24} className="ml-2" />
                <h1 className="text-xl font-medium ml-2">Create New Client</h1>
              </>
            ) : (
              <>
                <Link
                  href="/clients"
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  <ArrowLeft size={20} />
                </Link>
                <UsersRound size={24} className="mr-2" />
                <h1 className="text-2xl font-semibold">Create New Client</h1>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center space-x-4">
                {['active', 'inactive'].map(s => (
                  <label key={s} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={e => setField('status', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData.status === s
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.status === s && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="ml-2 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo (deferred) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Logo</h2>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {(previewUrl || formData.logoUrl) ? (
                  <div className="relative max-w-xs mx-auto">
                    <img
                      src={previewUrl ?? formData.logoUrl}
                      alt="Logo preview"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {/* Re-upload */}
                      <label
                        htmlFor="logoUpload"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <Upload size={16} className="text-gray-600" />
                        <input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => {
                          setPendingFile(null);
                          setPreviewUrl(null);
                          setField('logoUrl', '');
                        }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-2 py-1 rounded text-sm">
                      {formData.title_en || 'Client'} Logo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Drag & drop your logo here, or click to browse
                    </p>
                    <label
                      htmlFor="logoUpload"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Upload Logo
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info (bilingual) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex border-b mb-6 space-x-6">
                {(['en', 'ar'] as Lang[]).map(l => (
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
                      name="title_en"
                      value={formData.title_en}
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
                      name="description_en"
                      value={formData.description_en}
                      onChange={e => setField('description_en', e.target.value)}
                      rows={3}
                      className="w-full border rounded-lg p-3"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL (EN) <span className="text-blue-500">*</span>
                    </label>
                    <input
                      required
                      type="url"
                      name="url_en"
                      value={formData.url_en}
                      onChange={e => setField('url_en', e.target.value)}
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
                      name="title_ar"
                      value={formData.title_ar}
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
                      name="description_ar"
                      value={formData.description_ar}
                      onChange={e => setField('description_ar', e.target.value)}
                      rows={3}
                      className="w-full border rounded-lg p-3"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center"
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
