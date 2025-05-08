'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Menu, X, Check, ImageIcon, Upload,
} from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

type Lang = 'en' | 'ar';
type Status = 'published' | 'draft' | 'archived';

export default function LocationCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const [formData, setFormData] = useState({
    status: 'draft' as Status,
    cover: '',
    slug: '',
    title_en: '',
    description_en: '',
    content_en: '',
    working_hours_en: '',
    city_en: '',
    phone_en: '',
    title_ar: '',
    description_ar: '',
    content_ar: '',
    working_hours_ar: '',
    city_ar: '',
    phone_ar: '',
    map_url: '',
  });

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const setField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) =>
    setFormData(f => ({ ...f, [key]: value }));

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return setPendingFile(null);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'locations');
    const res = await fetch(`${API_URL}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
    const { data } = await res.json();
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');
      let cover = formData.cover;
      if (pendingFile) cover = await uploadImage(pendingFile, token);

      const payload = { ...formData, cover };
      const res = await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create');

      toast.success('Location created');
      router.push('/locations');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/locations');

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
            <Link href="/locations" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
              <MapPin size={22} className="mr-2" />
              Create Location
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center space-x-4">
                {['published', 'draft', 'archived'].map(s => (
                  <label key={s} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={e => setField('status', e.target.value as Status)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.status === s ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                      {formData.status === s && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Cover Image</h2>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {previewUrl ? (
                  <div className="relative max-w-xs mx-auto">
                    <img src={previewUrl} alt="Cover preview" className="max-w-full max-h-64 mx-auto" />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <label htmlFor="coverUpload" className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer">
                        <Upload size={16} className="text-gray-600" />
                        <input id="coverUpload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                      <button type="button" onClick={() => { setPendingFile(null); setPreviewUrl(null); setField('cover', ''); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Upload a cover image</p>
                    <label htmlFor="coverUpload" className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                      Upload
                      <input id="coverUpload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            
            {/* Slug Field */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                className="w-full border rounded-lg p-3"
                placeholder="example-slug"
                value={formData.slug}
                onChange={e => setField('slug', e.target.value)}
                dir="ltr"
              />
            </div>

            {/* Map URL */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <input className="w-full border rounded-lg p-3" placeholder="Google Map URL" value={formData.map_url} onChange={e => setField('map_url', e.target.value)} />
            </div>

            {/* Lang Tabs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex border-b mb-6 space-x-6">
                {(['en', 'ar'] as Lang[]).map(l => (
                  <button key={l} type="button" onClick={() => setActiveLang(l)} className={`pb-2 ${activeLang === l ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {activeLang === 'en' ? (
                <div className="space-y-4">
                  <input className="w-full border rounded-lg p-3" placeholder="Title (EN)" value={formData.title_en} onChange={e => setField('title_en', e.target.value)} />
                  <textarea className="w-full border rounded-lg p-3" rows={3} placeholder="Description (EN)" value={formData.description_en} onChange={e => setField('description_en', e.target.value)} />
                  <textarea className="w-full border rounded-lg p-3" rows={3} placeholder="Content (EN)" value={formData.content_en} onChange={e => setField('content_en', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="City (EN)" value={formData.city_en} onChange={e => setField('city_en', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="Phone (EN)" value={formData.phone_en} onChange={e => setField('phone_en', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="Working Hours (EN)" value={formData.working_hours_en} onChange={e => setField('working_hours_en', e.target.value)} />
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  <input className="w-full border rounded-lg p-3" placeholder="العنوان (AR)" value={formData.title_ar} onChange={e => setField('title_ar', e.target.value)} />
                  <textarea className="w-full border rounded-lg p-3" rows={3} placeholder="الوصف (AR)" value={formData.description_ar} onChange={e => setField('description_ar', e.target.value)} />
                  <textarea className="w-full border rounded-lg p-3" rows={3} placeholder="المحتوى (AR)" value={formData.content_ar} onChange={e => setField('content_ar', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="المدينة (AR)" value={formData.city_ar} onChange={e => setField('city_ar', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="الهاتف (AR)" value={formData.phone_ar} onChange={e => setField('phone_ar', e.target.value)} />
                  <input className="w-full border rounded-lg p-3" placeholder="ساعات العمل (AR)" value={formData.working_hours_ar} onChange={e => setField('working_hours_ar', e.target.value)} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="hidden md:flex justify-end space-x-3">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center">
                {loading ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
              </button>
            </div>

            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex space-x-3">
                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center">
                  {loading ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
