// File: app/(dashboard)/blogs/create/page.tsx
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import Sidebar from '@/src/components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

import ReactQuill from 'react-quill';
import Quill, { RangeStatic } from 'quill';
import ImageUploader from 'quill-image-uploader';
import 'react-quill/dist/quill.snow.css';

// ─── register ImageUploader ───────────────────────────────────────────────────
Quill.register('modules/imageUploader', ImageUploader);

// ─── types ─────────────────────────────────────────────────────────────────────
type Lang = 'en' | 'ar';

// ─── component ────────────────────────────────────────────────────────────────
export default function BlogCreatePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>('en');

  // adjust mobile when window resizes
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─── form state ──────────────────────────────────────────────────────────────
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

  // ─── COVER image upload ──────────────────────────────────────────────────────
  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = Cookies.get('accessToken');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` || '' },
          body: fd,
        }
      );
      const data = await res.json();
      handle(
        'coverImageUrl',
        `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}`
      );
    } catch {
      toast.error('Upload failed');
    }
  };

  // ─── Quill ref & image‐upload handler ────────────────────────────────────────
  const quillRef = useRef<ReactQuill | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const token = Cookies.get('accessToken');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` || '' },
        body: fd,
      }
    );
    const data = await res.json();
    return `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}`;
  }, []);

  // ─── Custom Link‐dialog state ────────────────────────────────────────────────
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTooltip, setLinkTooltip] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const savedRange = useRef<RangeStatic | null>(null);

  // 1️⃣ Open the modal, stash the selection & prefill text
  const openLinkDialog = useCallback(() => {
    const editor = quillRef.current!.getEditor();
    const range = editor.getSelection();
    if (range) {
      savedRange.current = range;
      setLinkText(editor.getText(range.index, range.length));
    }
    setLinkModalOpen(true);
  }, []);

  // 2️⃣ Apply the link + attributes on Save
  const applyLink = useCallback(() => {
    const editor = quillRef.current!.getEditor();
    const range = savedRange.current;
    if (!range) {
      setLinkModalOpen(false);
      return;
    }
    // replace selected text with a link
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, linkText, 'link', linkUrl);

    // find the <a> node and set title/target
    const [leaf] = editor.getLeaf(range.index);
    const parent = (leaf as any).parent as { domNode?: HTMLElement };
    const anchor = parent.domNode as HTMLAnchorElement | undefined;
    if (anchor?.tagName === 'A') {
      anchor.setAttribute('title', linkTooltip);
      if (openInNewTab) anchor.setAttribute('target', '_blank');
      else anchor.removeAttribute('target');
    }

    setLinkModalOpen(false);
  }, [linkText, linkUrl, linkTooltip, openInNewTab]);

  // ─── Quill modules & formats ───────────────────────────────────────────────
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
        handlers: {
          link: openLinkDialog,
        },
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

  // ─── form submit ────────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` || '',
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      toast.success('Blog created ✅');
      router.push('/blogs');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
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
              <Link
                href="/blogs"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold">
                Create Blog
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
                  className="rounded-lg"
                  alt="Cover"
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
                        value={(form as any)[`description_${l}`]}
                        onChange={(e) =>
                          handle(`description_${l}`, e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                        dir={l === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>

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
            <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
              <h2 className="text-lg font-medium">Add/Edit Link</h2>

              <label className="block text-sm font-medium">URL</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />

              <label className="block text-sm font-medium">
                Display Text
              </label>
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
