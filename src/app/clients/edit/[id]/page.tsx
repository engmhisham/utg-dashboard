// src/app/clients/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Sidebar from '../../../../components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { get } from 'http';
import { getImgSrc } from '@/src/utils/getImgSrc';

type Lang = 'en' | 'ar';

export default function ClientEditPage() {
  const router = useRouter();
  const { id: clientId } = useParams<{id:string}>();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // 1️⃣ Form state
  const [form, setForm] = useState({
    status:         'active',
    logoUrl:        '',
    title_en:       '',
    description_en: '',
    url_en:         '',
    title_ar:       '',
    description_ar: '',
  });

  // 2️⃣ Deferred‐upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);

  const [activeLang, setActiveLang]       = useState<Lang>('en');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]               = useState(false);
  const [isMobile, setIsMobile]           = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // Generic setter
  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  // Responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch existing client → initialize form & previewUrl
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${API_URL}/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch client');
        const { data: client } = await res.json();

        setForm({
          status:         client.status,
          logoUrl:        client.logoUrl,
          title_en:       client.title,
          description_en: client.description,
          url_en:         client.url,
          title_ar:       client.title,
          description_ar: client.description,
        });
        setPreviewUrl(client.logoUrl);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load client data');
        router.push('/clients');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [clientId, router, API_URL]);

  // 1️⃣ Deferred‐select → preview only
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : form.logoUrl || null);
  };

  // 2️⃣ Shared upload helper
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

  // 3️⃣ Submit: upload pending logo then PATCH
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      // upload if new
      let logoUrl = form.logoUrl;
      // 🧩 Remove old logo if there's a new one
      if (pendingFile && form.logoUrl) {
        try {
          const cleanPath = form.logoUrl.startsWith('http')
            ? new URL(form.logoUrl).pathname.replace(/^\/+/, '')
            : form.logoUrl.replace(/^\/+/, '');
          console.log('🧩 Deleting old logo:', cleanPath);
          await fetch(`${API_URL}/media/remove-by-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url: cleanPath }),
          });
        } catch (err) {
          console.warn('⚠️ Failed to remove old logo:', err);
        }

        // Upload new image
        logoUrl = await uploadImage(pendingFile, token);
      }

      const payload = {
        status:         form.status,
        logoUrl,
        title_en:       form.title_en,
        description_en: form.description_en,
        url_en:         form.url_en,
        title_ar:       form.title_ar,
        description_ar: form.description_ar,
      };

      const res = await fetch(`${API_URL}/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Client updated successfully!');
      router.push('/clients');
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push('/clients');
  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
        <LoadingSpinner className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto relative">
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
            <Link href="/clients" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold ml-2 flex items-center">
              <UsersRound size={22} className="mr-2" />
              Edit Client
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-4xl space-y-6 px-4 pb-24"
        >
          {/* Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Status</h2>
            <div className="flex items-center space-x-4">
              {['active','inactive'].map(s => (
                <label key={s} className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={e => setField('status', e.target.value as any)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    form.status === s
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {form.status === s && <Check size={12} className="text-white" />}
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
              {(previewUrl) ? (
                <div className="relative max-w-xs mx-auto">
                  <img
                    src={getImgSrc(previewUrl)}
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
                    {activeLang === 'en' ? form.title_en : form.title_ar} Logo
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4 text-center">Upload your logo</p>
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

          {/* Bilingual Info */}
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

            {activeLang==='en' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title (EN)</label>
                  <input
                    name="title_en"
                    value={form.title_en}
                    onChange={e => setField('title_en', e.target.value as any)}
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (EN)</label>
                  <textarea
                    name="description_en"
                    value={form.description_en}
                    onChange={e => setField('description_en', e.target.value as any)}
                    rows={3}
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL (EN)</label>
                  <input
                    name="url_en"
                    value={form.url_en}
                    onChange={e => setField('url_en', e.target.value as any)}
                    type="url"
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-right">العنوان (AR)</label>
                  <input
                    name="title_ar"
                    value={form.title_ar}
                    onChange={e => setField('title_ar', e.target.value as any)}
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-right">الوصف (AR)</label>
                  <textarea
                    name="description_ar"
                    value={form.description_ar}
                    onChange={e => setField('description_ar', e.target.value as any)}
                    rows={3}
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                  />
                </div>
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
              {saving ? (
                <LoadingSpinner className="h-5 w-5 text-white" />
              ) : (
                'Save'
              )}
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
                {saving ? (
                  <LoadingSpinner className="h-5 w-5 text-white" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
