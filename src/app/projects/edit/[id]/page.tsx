// src/app/projects/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
  ArrowLeft,
  Menu,
  X,
  Upload,
  Check,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getImgSrc } from '@/src/utils/getImgSrc';

type Lang = 'en' | 'ar';

export default function ProjectEditPage() {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // bilingual form fields
  const [form, setForm] = useState({
    title_en:       '',
    description_en: '',
    url_en:         '',
    title_ar:       '',
    description_ar: '',
  });

  // existing & pending files/previews
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles]     = useState<File[]>([]);
  const [previews, setPreviews]             = useState<string[]>([]);

  const [activeLang, setActiveLang]         = useState<Lang>('en');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [isMobile, setIsMobile]             = useState(false);

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // fetch project
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const { data } = await res.json();

        setForm({
          title_en:       data.title,
          description_en: data.description,
          url_en:         data.url,
          title_ar:       data.title,
          description_ar: data.description,
        });

        // initialize existingImages
        const imgs = [
          data.imageUrl,
          data.image1Url,
          data.image2Url,
          data.image3Url,
          data.image4Url,
        ].filter((u: any) => typeof u === 'string');
        setExistingImages(imgs);
      } catch {
        toast.error('Failed to load project ❌');
        router.push('/projects');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [projectId, API_URL, router]);

  // select file → preview only
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFiles(p => [...p, file]);
    setPreviews(p => [...p, URL.createObjectURL(file)]);
    e.target.value = ''; // reset so same file can be re-selected
  };

  // combined display arrays, filtered non-empty
  const filteredExisting = existingImages.filter(Boolean);
  const filteredPreviews = previews.filter(Boolean);
  const displayImages = [...filteredExisting, ...filteredPreviews].slice(0, 4);

  // remove by display index
  const handleRemoveAt = (i: number) => {
    if (i < filteredExisting.length) {
      setExistingImages(imgs => imgs.filter((_, idx) => idx !== i));
    } else {
      const pi = i - filteredExisting.length;
      setPendingFiles(files => files.filter((_, idx) => idx !== pi));
      setPreviews(ps => ps.filter((_, idx) => idx !== pi));
    }
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

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
  
    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');
  
      // 🧩 Remove deleted existing images (if removed in UI)
      const removedImages = existingImages.filter((url) => !filteredExisting.includes(url));
      for (const url of removedImages) {
        const cleanPath = url.startsWith('http')
          ? new URL(url).pathname.replace(/^\/+/, '')
          : url.replace(/^\/+/, '');
        try {
          await fetch(`${API_URL}/media/remove-by-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url: cleanPath }),
          });
        } catch (err) {
          console.warn('⚠️ Failed to remove old image:', cleanPath);
        }
      }
  
      // 🆕 Upload new images
      const newUrls: string[] = [];
      for (const file of pendingFiles) {
        const url = await uploadImage(file, token);
        newUrls.push(url);
      }
  
      // ✅ Prepare final payload
      const payload: Record<string, any> = {
        title_en:       form.title_en,
        description_en: form.description_en,
        url_en:         form.url_en,
        title_ar:       form.title_ar,
        description_ar: form.description_ar,
        url_ar:         form.url_en,
      };
  
      const all = [...filteredExisting, ...newUrls].slice(0, 4);
      for (let j = 0; j < 4; j++) {
        payload[`image${j + 1}Url`] = all[j] || '';
      }
  
      // 📨 PATCH request
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error();
      toast.success('Project updated');
      router.push('/projects');
    } catch (err: any) {
      toast.error(err.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };
  

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
            <Link href="/projects" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold ml-2 flex items-center">
              <UsersRound size={22} className="mr-2" /> Edit Project
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-7xl space-y-6 px-4 pb-24"
        >
          {/* Bilingual fields */}
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
                    Title (EN) *
                  </label>
                  <input
                    required
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                    value={form.title_en}
                    onChange={e => setField('title_en', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                    rows={4}
                    value={form.description_en}
                    onChange={e => setField('description_en', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL (EN) *
                  </label>
                  <input
                    required
                    type="url"
                    className="w-full border rounded-lg p-3"
                    dir="ltr"
                    value={form.url_en}
                    onChange={e => setField('url_en', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-right">
                    العنوان (AR) *
                  </label>
                  <input
                    required
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                    value={form.title_ar}
                    onChange={e => setField('title_ar', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-right">
                    الوصف (AR)
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-3"
                    dir="rtl"
                    rows={4}
                    value={form.description_ar}
                    onChange={e => setField('description_ar', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Images (max 4)</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayImages.map((src, i) => (
                <div
                  key={i}
                  className="relative group border border-gray-300 rounded-lg overflow-hidden"
                >
                  <img
                    src={getImgSrc(src)}
                    alt={`Project image ${i+1}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAt(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {displayImages.length < 4 && (
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

          {/* Actions */}
          <div className="hidden md:flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/projects')}
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
                <>
                  <Check size={16} className="mr-1" /> Save
                </>
              )}
            </button>
          </div>

          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex space-x-3">
              <button
                type="button"
                onClick={() => router.push('/projects')}
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
                  <>
                    <Check size={16} className="mr-1" /> Save
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
