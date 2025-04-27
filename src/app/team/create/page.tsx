// src/app/team/create/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Image as ImageIcon,
  UsersRound,
  Menu,
} from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

type Lang = 'en' | 'ar';

export default function TeamCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // 1️⃣ form state
  const [formData, setFormData] = useState({
    status:   'active',
    coverUrl: '',      // final to send
    name_en:  '',
    title_en: '',
    name_ar:  '',
    title_ar: '',
  });

  // 2️⃣ deferred‐upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);

  const [activeLang, setActiveLang]   = useState<Lang>('en');
  const [loading, setLoading]         = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // generic setter
  const setField = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => {
    setFormData(f => ({ ...f, [key]: value }));
  };

  // 3️⃣ deferred file select → preview only
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // 4️⃣ upload helper (POST to /media)
  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);

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
    return `${API_URL}/${media.path}`;
  };

  // 5️⃣ submit: upload cover if needed, then create member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      // upload cover if selected
      let coverUrl = formData.coverUrl;
      if (pendingFile) {
        coverUrl = await uploadImage(pendingFile, token);
      }

      const payload = {
        status:         formData.status,
        coverImageUrl:  coverUrl,
        name_en:        formData.name_en,
        title_en:       formData.title_en,
        name_ar:        formData.name_ar,
        title_ar:       formData.title_ar,
      };

      const res = await fetch(`${API_URL}/team-members`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create team member');
      }

      toast.success('Team member created successfully!');
      router.push('/team');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Creation failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/team');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center">
            {isMobile ? (
              <>
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/team" className="text-gray-500 hover:text-gray-700 ml-3">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                  <UsersRound size={22} className="mr-2" />
                  Create Member
                </h1>
              </>
            ) : (
              <>
                <Link href="/team" className="text-gray-500 hover:text-gray-700 mr-2">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-semibold flex items-center">
                  <UsersRound size={22} className="mr-2" />
                  Create Member
                </h1>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex gap-4">
                {['active', 'inactive'].map(s => (
                  <label key={s} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={e => setField('status', e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData.status === s
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.status === s && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image (deferred) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Cover Image</h2>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {(previewUrl || formData.coverUrl) ? (
                  <div className="relative max-w-xs mx-auto">
                    <img
                      src={previewUrl ?? formData.coverUrl}
                      alt="Cover preview"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {/* Re-upload */}
                      <label
                        htmlFor="coverUpload"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <Upload size={16} className="text-gray-600" />
                        <input
                          id="coverUpload"
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
                          setField('coverUrl', '');
                        }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-2 py-1 rounded text-sm">
                      {formData.name_en || 'Member'} Cover
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Upload a cover image
                    </p>
                    <label
                      htmlFor="coverUpload"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Upload Cover
                      <input
                        id="coverUpload"
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

            {/* Bilingual Name & Title */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
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
                      Name (EN) <span className="text-blue-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.name_en}
                      onChange={e => setField('name_en', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title (EN)
                    </label>
                    <input
                      value={formData.title_en}
                      onChange={e => setField('title_en', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-right">
                      Name (AR) <span className="text-blue-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.name_ar}
                      onChange={e => setField('name_ar', e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-right">
                      Title (AR)
                    </label>
                    <input
                      value={formData.title_ar}
                      onChange={e => setField('title_ar', e.target.value)}
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
