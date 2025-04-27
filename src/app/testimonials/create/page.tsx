// src/app/testimonials/create/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Menu,
  BookCopy,
} from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

type Lang = 'en' | 'ar';

export default function TestimonialCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // Form state
  const [formData, setFormData] = useState({
    status:         'draft',
    logoUrl:        '',
    coverImageUrl:  '',
    name_en:        '',
    position_en:    '',
    company_en:     '',
    content_en:     '',
    name_ar:        '',
    position_ar:    '',
    company_ar:     '',
    content_ar:     '',
  });

  // Deferred‐upload state
  const [pendingLogo, setPendingLogo]     = useState<File | null>(null);
  const [previewLogo, setPreviewLogo]     = useState<string | null>(null);
  const [pendingCover, setPendingCover]   = useState<File | null>(null);
  const [previewCover, setPreviewCover]   = useState<string | null>(null);

  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [loading, setLoading]       = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Generic setter
  const setField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) =>
    setFormData(f => ({ ...f, [key]: value }));

  // Handle text inputs & selects
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setField(name as any, value as any);
  };

  // Deferred select → preview only helper
  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>,
    isLogo: boolean
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (isLogo) {
      setPendingLogo(file);
      setPreviewLogo(file ? URL.createObjectURL(file) : null);
    } else {
      setPendingCover(file);
      setPreviewCover(file ? URL.createObjectURL(file) : null);
    }
  };

  // Upload helper
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

  // Remove preview & deferred file
  const handleRemove = (isLogo: boolean) => {
    if (isLogo) {
      setPendingLogo(null);
      setPreviewLogo(null);
      setField('logoUrl', '');
    } else {
      setPendingCover(null);
      setPreviewCover(null);
      setField('coverImageUrl', '');
    }
  };

  // Submit: upload files then POST testimonial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      let logoUrl   = formData.logoUrl;
      let coverUrl  = formData.coverImageUrl;

      if (pendingLogo) {
        logoUrl = await uploadImage(pendingLogo, token);
      }
      if (pendingCover) {
        coverUrl = await uploadImage(pendingCover, token);
      }

      const payload = {
        ...formData,
        logoUrl,
        coverImageUrl: coverUrl,
      };

      const res = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create testimonial');
      }

      toast.success('Testimonial created successfully!');
      router.push('/testimonials');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/testimonials');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="p-1 rounded-full bg-white shadow-md border border-gray-200"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <Link href="/testimonials" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
              <BookCopy size={22} className="mr-2" />
              Create Testimonial
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex gap-6">
                {['published', 'draft'].map(s => (
                  <label key={s} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData.status === s
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.status === s && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language Tabs & Inputs */}
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
                  <input
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleInputChange}
                    placeholder="Name (EN)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="ltr"
                  />
                  <input
                    name="position_en"
                    value={formData.position_en}
                    onChange={handleInputChange}
                    placeholder="Position (EN)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="ltr"
                  />
                  <input
                    name="company_en"
                    value={formData.company_en}
                    onChange={handleInputChange}
                    placeholder="Company (EN)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="ltr"
                  />
                  <textarea
                    name="content_en"
                    value={formData.content_en}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Content (EN)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="ltr"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleInputChange}
                    placeholder="Name (AR)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="rtl"
                  />
                  <input
                    name="position_ar"
                    value={formData.position_ar}
                    onChange={handleInputChange}
                    placeholder="Position (AR)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="rtl"
                  />
                  <input
                    name="company_ar"
                    value={formData.company_ar}
                    onChange={handleInputChange}
                    placeholder="Company (AR)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="rtl"
                  />
                  <textarea
                    name="content_ar"
                    value={formData.content_ar}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Content (AR)"
                    required
                    className="w-full p-3 border rounded-lg"
                    dir="rtl"
                  />
                </div>
              )}
            </div>

            {/* Company Logo Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Company Logo</h2>
              <div className="relative bg-gray-50 border rounded-lg p-4 text-center">
                {(previewLogo || formData.logoUrl) ? (
                  <div className="relative inline-block">
                    <img
                      src={previewLogo ?? formData.logoUrl}
                      alt="Logo"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileSelect(e, true)}
                        />
                      </label>
                      <button
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                        onClick={() => handleRemove(true)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Upload company logo
                    </p>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileSelect(e, true)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Person Avatar Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Person Avatar</h2>
              <div className="relative bg-gray-50 border rounded-lg p-4 text-center">
                {(previewCover || formData.coverImageUrl) ? (
                  <div className="relative inline-block">
                    <img
                      src={previewCover ?? formData.coverImageUrl}
                      alt="Avatar"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileSelect(e, false)}
                        />
                      </label>
                      <button
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                        onClick={() => handleRemove(false)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Upload person avatar
                    </p>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      Upload Avatar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileSelect(e, false)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
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
