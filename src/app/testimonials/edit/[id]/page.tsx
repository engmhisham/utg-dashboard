// src/app/testimonials/[id]/edit/page.tsx
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Menu,
  Image as ImageIcon,
  BookCopy,
} from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getImgSrc } from '@/src/utils/getImgSrc';

type Lang = 'en' | 'ar';

export default function TestimonialEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const testimonialId = params.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // 1️⃣ Form state (final URLs go here)
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

  // 2️⃣ Deferred‐upload state
  const [pendingLogo, setPendingLogo]     = useState<File | null>(null);
  const [previewLogo, setPreviewLogo]     = useState<string | null>(null);
  const [pendingCover, setPendingCover]   = useState<File | null>(null);
  const [previewCover, setPreviewCover]   = useState<string | null>(null);

  const [activeLang, setActiveLang]         = useState<Lang>('en');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [isMobile, setIsMobile]             = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  // Generic setter
  const setField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) =>
    setFormData(f => ({ ...f, [key]: value }));

  // Responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch existing testimonial in both langs, initialize form & previews
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const [resEn, resAr] = await Promise.all([
          fetch(`${API_URL}/testimonials/${testimonialId}?language=en`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/testimonials/${testimonialId}?language=ar`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!resEn.ok || !resAr.ok) throw new Error();

        const en = await resEn.json();
        const ar = await resAr.json();
        setFormData({
          status:         en.data.status || 'draft',
          logoUrl:        en.data.logoUrl || '',
          coverImageUrl:  en.data.coverImageUrl || '',
          name_en:        en.data.name || '',
          position_en:    en.data.position || '',
          company_en:     en.data.company || '',
          content_en:     en.data.content || '',
          name_ar:        ar.data.name || '',
          position_ar:    ar.data.position || '',
          company_ar:     ar.data.company || '',
          content_ar:     ar.data.content || '',
        });
        // set initial previews
        setPreviewLogo(en.data.logoUrl || null);
        setPreviewCover(en.data.coverImageUrl || null);
      } catch {
        toast.error('Failed to load testimonial');
        router.push('/testimonials');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [testimonialId, router, API_URL]);

  // Handle text/select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setField(name as any, value as any);
  };

  // Deferred select → preview only
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0] ?? null;
    if (isLogo) {
      setPendingLogo(file);
      setPreviewLogo(file ? URL.createObjectURL(file) : formData.logoUrl || null);
    } else {
      setPendingCover(file);
      setPreviewCover(file ? URL.createObjectURL(file) : formData.coverImageUrl || null);
    }
  };

  // Shared upload helper
  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'testimonials');
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

  // Remove preview & clear field
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

  // Submit: upload pending files then PATCH
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      let logoUrl  = formData.logoUrl;
      let coverUrl = formData.coverImageUrl;

      if (pendingLogo)  logoUrl  = await uploadImage(pendingLogo, token);
      if (pendingCover) coverUrl = await uploadImage(pendingCover, token);

      const payload = {
        ...formData,
        logoUrl,
        coverImageUrl: coverUrl,
      };

      const res = await fetch(`${API_URL}/testimonials/${testimonialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Testimonial updated');
      router.push('/testimonials');
    } catch (err: any) {
      toast.error(err.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push('/testimonials');
  if (initialLoading) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />

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
              Edit Testimonial
            </h1>
          </div>
        </div>

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
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData.status === s
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.status === s && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo & Avatar Upload */}
            {(['logoUrl', 'coverImageUrl'] as const).map(field => (
              <div key={field} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-4">
                  {field === 'logoUrl' ? 'Company Logo' : 'Person Avatar'}
                </h2>
                <div className="relative bg-gray-50 border rounded-lg p-6 text-center">
                  {(field === 'logoUrl' ? previewLogo : previewCover) || formData[field] ? (
                    <div className="relative inline-block">
                      <img
                        src={getImgSrc(
                          (field === 'logoUrl' ? previewLogo : previewCover) ?? formData[field]
                        )}
                        alt="Preview"
                        className="max-w-full h-auto max-h-64 mx-auto"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {/* Re-upload */}
                        <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                          <Upload size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileSelect(e, field === 'logoUrl')}
                          />
                        </label>
                        {/* Remove */}
                        <button
                          type="button"
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                          onClick={() => handleRemove(field === 'logoUrl')}
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
                      <p className="text-gray-500 mb-4">Drag & drop or click to upload</p>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileSelect(e, field === 'logoUrl')}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Bilingual Inputs */}
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
                    onChange={handleChange}
                    placeholder="Name (EN)"
                    required
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                  <input
                    name="position_en"
                    value={formData.position_en}
                    onChange={handleChange}
                    placeholder="Position (EN)"
                    required
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                  <input
                    name="company_en"
                    value={formData.company_en}
                    onChange={handleChange}
                    placeholder="Company (EN)"
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                  <textarea
                    name="content_en"
                    value={formData.content_en}
                    onChange={handleChange}
                    placeholder="Content (EN)"
                    required
                    rows={4}
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleChange}
                    placeholder="Name (AR)"
                    required
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                  <input
                    name="position_ar"
                    value={formData.position_ar}
                    onChange={handleChange}
                    placeholder="Position (AR)"
                    required
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                  <input
                    name="company_ar"
                    value={formData.company_ar}
                    onChange={handleChange}
                    placeholder="Company (AR)"
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                  <textarea
                    name="content_ar"
                    value={formData.content_ar}
                    onChange={handleChange}
                    placeholder="Content (AR)"
                    required
                    rows={4}
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="hidden md:flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center"
              >
                {saving ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
              </button>
            </div>

            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center"
                >
                  {saving ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
