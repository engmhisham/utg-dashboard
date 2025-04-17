'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import {
  ArrowLeft, Plus, X, Menu, Upload
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', description: '', url: '', images: [] as string[],
  });
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---------- handlers ---------- */
  const setField = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
    
      const token = Cookies.get('accessToken');
      const formData = new FormData();
      formData.append('file', file);
    
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Add token
          },
          body: formData,
        });
    
        const data = await response.json();
        console.log('Upload result:', data);
        setForm(prev => ({ ...prev, logo: `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}` }));
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title_en: form.title, description_en: form.description, url_en: form.url,
          title_ar: form.title, description_ar: form.description, url_ar: form.url,
          images: form.images,
        }),
      });
      if (!res.ok) throw new Error('create fail');
      toast.success('Project created 🎉');
      router.push('/projects');
    } catch (e) { toast.error('Create failed'); }
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)}
                          className="p-1 rounded-full bg-white shadow-md border border-gray-200">
                    {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
                  </button>
                  <Link href="/projects" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20}/></Link>
                  <h1 className="text-xl font-medium ml-2">Create Project</h1>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Link href="/projects" className="text-gray-500 hover:text-gray-700 mr-2"><ArrowLeft size={20}/></Link>
                  <h1 className="text-2xl font-semibold">Create Project</h1>
                </div>
              </>
            )}
          </div>
        </div>

        {/* form */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={submit} className="space-y-6">
            {/* basic info */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="block font-medium mb-1">Title *</label>
                <input required value={form.title}
                       onChange={e => setField('title', e.target.value)}
                       className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea rows={4} value={form.description}
                          onChange={e => setField('description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block font-medium mb-1">URL *</label>
                <input required type="url" value={form.url}
                       onChange={e => setField('url', e.target.value)}
                       className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            {/* images */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Images (max 4)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group border rounded-lg overflow-hidden">
                    <img src={img} className="w-full h-32 object-cover"/>
                    <button type="button"
                            onClick={() => setField('images', form.images.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                      <X size={14}/>
                    </button>
                  </div>
                ))}
                {form.images.length < 4 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed
                                     rounded-lg cursor-pointer h-32 text-gray-400 hover:border-blue-500">
                    <Upload size={24}/>
                    <span className="text-xs">Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                  </label>
                )}
              </div>
            </div>

            {/* actions */}
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.push('/projects')}
                      className="px-4 py-2 border border-gray-300 rounded-xl">Cancel</button>
              <button type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
