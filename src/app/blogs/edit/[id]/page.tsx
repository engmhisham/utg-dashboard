// File: app/(dashboard)/blogs/[id]/page.tsx  (or wherever your edit page lives)
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  X,
  Image as ImageIcon,
  PencilLine,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

import ReactQuill from 'react-quill';
import Quill, { RangeStatic } from 'quill';
import ImageUploader from 'quill-image-uploader';
import 'react-quill/dist/quill.snow.css';

// ─ register the image‑uploader module ────────────────────────────────────────
Quill.register('modules/imageUploader', ImageUploader);

type Lang = 'en' | 'ar';

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // layout / sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // form state
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    status: 'draft',
    title_en: '',
    description_en: '',
    content_en: '',
    title_ar: '',
    description_ar: '',
    content_ar: '',
    coverImageUrl: '',
  });
  const handle = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  // fetch existing blog
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const token = Cookies.get('accessToken');
  
        // fire both requests in parallel
        const [enRes, arRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}?language=en`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}?language=ar`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        if (!enRes.ok || !arRes.ok) throw new Error('Failed to load');
  
        const enJson = await enRes.json();
        const arJson = await arRes.json();
  
        setForm({
          slug:           enJson.data.slug,
          status:         enJson.data.status,
          title_en:       enJson.data.title,
          description_en: enJson.data.description,
          content_en:     enJson.data.content,
          title_ar:       arJson.data.title,
          description_ar: arJson.data.description,
          content_ar:     arJson.data.content,
          coverImageUrl:  enJson.data.coverImageUrl,
        });
      } catch {
        toast.error('Failed to load blog');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  

  // COVER‑image upload outside Quill
  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = Cookies.get('accessToken');
    const fd = new FormData();
    fd.append('file', file);

    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` || '' },
          body: fd,
        }
      );
      const d = await r.json();
      handle(
        'coverImageUrl',
        `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${d.data.url}`
      );
    } catch {
      toast.error('Upload failed');
    }
  };

  // QUILL ref & image‑upload handler
  const quillRef = useRef<ReactQuill | null>(null);
  const handleImageUpload = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const token = Cookies.get('accessToken');
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` || '' },
        body: fd,
      }
    );
    const d = await r.json();
    return `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${d.data.url}`;
  }, []);

  // CUSTOM LINK DIALOG state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTooltip, setLinkTooltip] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const savedRange = useRef<RangeStatic | null>(null);

  const openLinkDialog = useCallback(() => {
    const editor = quillRef.current!.getEditor();
    const range = editor.getSelection();
    if (range) {
      savedRange.current = range;
      setLinkText(editor.getText(range.index, range.length));
    }
    setLinkModalOpen(true);
  }, []);

  const applyLink = useCallback(() => {
    const editor = quillRef.current!.getEditor();
    const range = savedRange.current;
    if (!range) {
      setLinkModalOpen(false);
      return;
    }
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, linkText, 'link', linkUrl);

    // grab the <a> node from the blot and set attributes
    const [leaf] = editor.getLeaf(range.index);
    const parent = (leaf as any).parent as { domNode?: HTMLElement };
    const a = parent.domNode as HTMLAnchorElement | undefined;
    if (a?.tagName === 'A') {
      a.setAttribute('title', linkTooltip);
      if (openInNewTab) a.setAttribute('target', '_blank');
      else a.removeAttribute('target');
    }
    setLinkModalOpen(false);
  }, [linkText, linkUrl, linkTooltip, openInNewTab]);

  // stable modules & formats
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: { link: openLinkDialog },
      },
      imageUploader: { upload: handleImageUpload },
    }),
    [openLinkDialog, handleImageUpload]
  );
  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'link',
      'image',
    ],
    []
  );

  // PATCH submit
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` || '',
          },
          body: JSON.stringify(form),
        }
      );
      if (!r.ok) throw new Error((await r.json()).message || 'Failed');
      toast.success('Blog updated ✅');
      router.push('/blogs');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading blog…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-2 p-1 rounded-full border shadow"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/blogs" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                <PencilLine size={20} className="mr-2" />
                Edit Blog
              </h1>
            </div>
            {!isMobile && (
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/blogs')}
                  className="border px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* form */}
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
                  onChange={(e) => handle('slug', e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handle('status', e.target.value)}
                  className="border rounded-lg p-3"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Cover image</h2>
            {form.coverImageUrl ? (
              <div className="relative max-w-xs">
                <img
                  src={form.coverImageUrl}
                  alt="Cover"
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handle('coverImageUrl', '')}
                  className="absolute top-2 right-2 bg-white rounded-full shadow p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50 cursor-pointer">
                <ImageIcon size={32} className="text-gray-400 mb-2" />
                <span>Upload cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverFile}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Language Tabs + Editor */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex border-b mb-4 space-x-4">
              {(['en', 'ar'] as Lang[]).map((l) => (
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

            {(['en', 'ar'] as Lang[]).map(
              (l) =>
                activeLang === l && (
                  <div key={l} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title ({l}) *
                      </label>
                      <input
                        required
                        value={(form as any)[`title_${l}`]}
                        onChange={(e) =>
                          handle(`title_${l}`, e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description ({l}) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={(form as any)[`description_${l}`]}
                        onChange={(e) =>
                          handle(`description_${l}`, e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Content ({l}) *
                      </label>
                      <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        value={(form as any)[`content_${l}`]}
                        onChange={(v) => handle(`content_${l}`, v)}
                        className={l === 'ar' ? 'rtl' : ''}
                      />
                    </div>
                  </div>
                )
            )}
          </div>
        </form>

        {/* Mobile Save Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex space-x-3">
            <button
              onClick={() => router.push('/blogs')}
              className="flex-1 border px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Save
            </button>
          </div>
        )}

        {/* Custom Link Modal */}
        {linkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="relative z-60 bg-white p-6 rounded-lg max-w-md w-full space-y-4">
              <h2 className="text-lg font-medium">Add/Edit Link</h2>

              <label className="block text-sm font-medium">URL</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />

              <label className="block text-sm font-medium">Display Text</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />

              <label className="block text-sm font-medium">Tooltip</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={linkTooltip}
                onChange={(e) => setLinkTooltip(e.target.value)}
              />

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={() => setOpenInNewTab((f) => !f)}
                />
                <span>Open in new tab</span>
              </label>

              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setLinkModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={applyLink}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
