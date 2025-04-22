'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, Plus, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import for EditorBlock component
const EditorBlock = dynamic(() => import('@/src/components/EditorBlock'), { 
  ssr: false,
  loading: () => <div className="border rounded-lg p-3 h-64 bg-gray-50 flex items-center justify-center">Loading editor...</div>
});

type Lang = 'en'|'ar';

export default function BlogCreatePage() {
  
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    const fx = () => setIsMobile(window.innerWidth < 768);
    fx();
    window.addEventListener('resize', fx);
    return () => window.removeEventListener('resize', fx);
  }, []);

  const [form, setForm] = useState({
    slug: '', 
    status: 'draft',
    title_en: '', 
    description_en: '', 
    content_en: '{}',
    title_ar: '', 
    description_ar: '', 
    content_ar: '{}',
    coverImageUrl: ''
  });

  const handle = (field: string, v: string) => {
    setForm(p => ({...p, [field]: v}));
  };

  const handleEditorChange = (data: any) => {
    try {
      const contentField = `content_${activeLang}`;
      setForm(prev => ({...prev, [contentField]: JSON.stringify(data)}));
    } catch (error) {
      console.error("Editor change error:", error);
    }
  };

  const onFile = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if(!file) return;
    
    const token = Cookies.get('accessToken');
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: fd
      });
      const d = await r.json();
      handle('coverImageUrl', `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${d.data.url}`);
    } catch(e) {
      toast.error('Upload failed');
    }
  };

  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      if(!r.ok) throw new Error((await r.json()).message || 'Failed');
      toast.success('Blog created ✅');
      router.push('/blogs');
    } catch(err: any) {
      toast.error(err.message || 'Error');
    }
  };

  // Helper to safely parse editor content
  const parseEditorContent = (content: string): any => {
    try {
      if (!content || content === '{}') {
        return { time: Date.now(), blocks: [], version: '2.28.0' };
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing editor content:', error);
      return { time: Date.now(), blocks: [], version: '2.28.0' };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="mr-2 p-1 rounded-full border shadow">
                  {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
              )}
              <Link href="/blogs" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20}/>
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                Create Blog
              </h1>
            </div>
            {!isMobile && (
              <div className="flex space-x-3">
                <button onClick={() => router.push('/blogs')}
                        className="border px-4 py-2 rounded-xl">Cancel</button>
                <button onClick={submit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl">Save</button>
              </div>
            )}
          </div>
        </div>

        {/* form */}
        <form onSubmit={submit} className="mx-auto max-w-7xl px-4 pb-24 space-y-6">
          {/* status & slug */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Meta</h2>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input required value={form.slug} onChange={e => handle('slug', e.target.value)}
                       className="w-full border rounded-lg p-3"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={e => handle('status', e.target.value)}
                        className="border rounded-lg p-3">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* cover image */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Cover image</h2>
            {form.coverImageUrl
              ? <div className="relative max-w-xs">
                  <img src={form.coverImageUrl} className="rounded-lg"/>
                  <button type="button" onClick={() => handle('coverImageUrl', '')}
                          className="absolute top-2 right-2 bg-white rounded-full shadow p-1"><X size={16}/></button>
                </div>
              : <label className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50 cursor-pointer">
                  <ImageIcon size={32} className="text-gray-400 mb-2"/>
                  <span>Upload cover</span>
                  <input type="file" accept="image/*" onChange={onFile} className="hidden"/>
                </label>}
          </div>

          {/* language tabs */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex border-b mb-4 space-x-4">
              {(['en', 'ar'] as Lang[]).map(l => (
                <button key={l} type="button" onClick={() => setActiveLang(l)}
                        className={`pb-2 ${activeLang === l ? 'border-b-2 border-blue-600 font-medium' : ''}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {(['en', 'ar'] as Lang[]).map(l => (
              activeLang === l && (
                <div key={l} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title ({l}) *</label>
                    <input required value={form[`title_${l}`]}
                           onChange={e => handle(`title_${l}`, e.target.value)}
                           className="w-full border rounded-lg p-3"
                           dir={l === 'ar' ? 'rtl' : 'ltr'}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description ({l}) *</label>
                    <textarea required rows={3}
                              value={form[`description_${l}`]}
                              onChange={e => handle(`description_${l}`, e.target.value)}
                              className="w-full border rounded-lg p-3"
                              dir={l === 'ar' ? 'rtl' : 'ltr'}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Content ({l}) *</label>
                    <div>
                      <EditorBlock
                        data={parseEditorContent(form[`content_${l}`])}
                        onChange={handleEditorChange}
                        holder={`editorjs-container-${l}`}
                        editorRef={editorInstanceRef}
                        dir={l === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </form>

        {/* mobile fixed save */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex space-x-3">
            <button onClick={() => router.push('/blogs')}
                    className="flex-1 border px-4 py-2 rounded-xl">Cancel</button>
            <button onClick={submit}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl">Save</button>
          </div>
        )}
      </main>
    </div>
  );
}