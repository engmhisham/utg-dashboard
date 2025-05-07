// src/app/blogs/create/page.tsx
'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, Plus, X, Image as ImageIcon, Upload, Rss } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { MediaItem } from '@/src/lib/types';

// Dynamic import for EditorBlock (no SSR)
const EditorBlock = dynamic(
  () => import('@/src/components/EditorBlock'),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-3 h-64 bg-gray-50 flex items-center justify-center">
        Loading editor...
      </div>
    ),
  }
);

type Lang = 'en' | 'ar';

export default function BlogCreatePage() {
  const router = useRouter();

  // Sidebar + UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [activeLang, setActiveLang]   = useState<Lang>('en');
  const [loading, setLoading]         = useState(false);

  // Form state
  const [form, setForm] = useState({
    slug: '',
    status: 'draft',
    title_en: '',
    description_en: '',
    content_en: '{}',
    title_ar: '',
    description_ar: '',
    content_ar: '{}',
    coverImageUrl: '',
    categoryId: '',
  });

  // File state (deferred upload + preview)
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);

  // Content images for deferred upload
  const [contentImages, setContentImages] = useState<Map<string, File>>(new Map());
  const [categories, setCategories] = useState<any[]>([]);

  // Editor ref
  const editorInstanceRef = useRef<any>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/categories?type=blog`,
                      {
                          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
                      },
                  );
      const data = await res.json();
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  

  // Responsiveness
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Field updater
  const handle = (field: string, v: string) =>
    setForm(prev => ({ ...prev, [field]: v }));

  // Editor change
  const handleEditorChange = (data: any) => {
    const key = `content_${activeLang}`;
    setForm(prev => ({ ...prev, [key]: JSON.stringify(data) }));
  };

  // Handle image added to editor
  const handleImageAdd = (file: File, tempId: string) => {
    setContentImages(prev => new Map(prev).set(tempId, file));
  };

  // File select → preview only
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // Upload images to media endpoint
  const uploadImage = async (file: File, token: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'blogs');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/media`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Media upload failed');
    }
    
    const { data: media }: { data: MediaItem } = await response.json();
    
    console.log('Uploaded media path:', media.path);
    return media.path;
  };

  // Process content to replace temp URLs with real URLs
  const processContent = (content: string, urlMap: Map<string, string>): string => {
    try {
      const parsedContent = JSON.parse(content);
      
      // Replace URLs in image blocks
      if (parsedContent.blocks) {
        parsedContent.blocks = parsedContent.blocks.map((block: any) => {
          if (block.type === 'image' && block.data && block.data.file) {
            const tempId = block.data.file.tempId;
            if (tempId && urlMap.has(tempId)) {
              block.data.file.url = urlMap.get(tempId);
              delete block.data.file.tempId;
            }
          }
          return block;
        });
      }
      
      return JSON.stringify(parsedContent);
    } catch (error) {
      console.error('Error processing content:', error);
      return content;
    }
  };

  // Submit: upload files, then blog
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('accessToken');
      if (!token) throw new Error('Not authenticated');

      // 1️⃣ Upload cover image if pending
      let coverUrl = form.coverImageUrl;
      if (pendingFile) {
        coverUrl = await uploadImage(pendingFile, token);
      }

      // 2️⃣ Upload content images
      const urlMap = new Map<string, string>();
      const contentImagesArray = Array.from(contentImages.entries());
      for (const [tempId, file] of contentImagesArray) {
        const url = await uploadImage(file, token);
        urlMap.set(tempId, url);
      }

      // 3️⃣ Process content to replace temp URLs
      const processedForm = {
        ...form,
        coverImageUrl: coverUrl,
        content_en: processContent(form.content_en, urlMap),
        content_ar: processContent(form.content_ar, urlMap),
      };

      // 4️⃣ Create blog
      const rB = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(processedForm),
        }
      );
      if (!rB.ok) {
        const err = await rB.json();
        throw new Error(err.message || 'Blog creation failed');
      }

      toast.success('Blog created!');
      // router.push('/blogs');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Safe parse Editor content
  const parseEditorContent = (content: string): any => {
    try {
      return content && content !== '{}'
        ? JSON.parse(content)
        : { time: Date.now(), blocks: [], version: '2.28.0' };
    } catch {
      return { time: Date.now(), blocks: [], version: '2.28.0' };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="mr-2 p-1 rounded-full border shadow"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link
                href="/blogs"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft size={20} />
              </Link>
              <Rss size={24} className="mr-2" />
              <h1 className="text-xl md:text-2xl font-semibold">
                Create Blog
              </h1>
            </div>
            {!isMobile && (
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/blogs')}
                  className="border px-4 py-2 rounded-xl"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                  disabled={loading}
                >
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="mx-auto max-w-7xl px-4 pb-24 space-y-6"
        >
          {/* Meta */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Meta</h2>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-sm font-medium mb-1">
                  Slug *
                </label>
                <input
                  required
                  value={form.slug}
                  onChange={e => handle('slug', e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={e => handle('categoryId', e.target.value)}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => handle('status', e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Cover image</h2>
            <div className="border rounded-lg p-4 bg-gray-50 relative">
              {previewUrl || form.coverImageUrl ? (
                <div className="relative max-w-xs mx-auto">
                  {/* Preview */}
                  <img
                    src={
                      previewUrl
                        ?? `${process.env.NEXT_PUBLIC_API_URL}/${form.coverImageUrl}`
                    }
                    alt="Cover preview"
                    className="w-full rounded-lg"
                  />

                  {/* Re-upload & remove */}
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
                        onChange={onFile}
                        className="hidden"
                      />
                    </label>
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => {
                        setPendingFile(null);
                        setPreviewUrl(null);
                        handle('coverImageUrl', '');
                      }}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-2 py-1 rounded text-sm">
                    {form.title_en} Cover
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4 text-center">Upload cover</p>
                  <label
                    htmlFor="coverUpload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Upload Cover
                    <input
                      id="coverUpload"
                      type="file"
                      accept="image/*"
                      onChange={onFile}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>


          {/* Language Tabs & Editor */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex border-b mb-4 space-x-4">
              {(['en', 'ar'] as Lang[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`pb-2 ${
                    activeLang === l
                      ? 'border-b-2 border-blue-600 font-medium'
                      : ''
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {(['en', 'ar'] as Lang[]).map(l =>
              activeLang === l ? (
                <div key={l} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title ({l}) *
                    </label>
                    <input
                      required
                      value={form[`title_${l}`]}
                      onChange={e => handle(`title_${l}`, e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir={l === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description ({l}) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form[`description_${l}`]}
                      onChange={e => handle(`description_${l}`, e.target.value)}
                      className="w-full border rounded-lg p-3"
                      dir={l === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content ({l}) *
                    </label>
                    <EditorBlock
                      data={parseEditorContent(form[`content_${l}`])}
                      onChange={handleEditorChange}
                      holder={`editorjs-container-${l}`}
                      editorRef={editorInstanceRef}
                      dir={l === 'ar' ? 'rtl' : 'ltr'}
                      onImageAdd={handleImageAdd}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
        </form>

        {/* Mobile Save/Cancel */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex space-x-3">
            <button
              onClick={() => router.push('/blogs')}
              className="flex-1 border px-4 py-2 rounded-xl"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl"
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}