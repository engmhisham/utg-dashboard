// src/app/media/[folder]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import Cookies from 'js-cookie';
import axios from 'axios';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronRight,
  Clipboard,
  Image as ImageIcon,
  Loader2,
  Menu,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  alt_en?: string;
  title?: string;
  title_en?: string;
  alt_ar?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  createdAt: string;
}

export default function FolderImagesPage() {
  const { folder } = useParams<{ folder: string }>();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // loading overlay until every thumbnail finishes
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(0);

  // modal
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState('');
  const [titleText, setTitleText] = useState('');

  // copy-feedback
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------ */
  /* API helpers                                                         */
  /* ------------------------------------------------------------------ */
  const fetchMedia = async (pageNum = 1) => {
    setLoading(true);
    setShowOverlay(true);
    setImageLoaded(0);
    try {
      const token = Cookies.get('accessToken');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/media?page=${pageNum}&limit=24&category=${folder}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = (res.data as any).data ?? res.data;
      const { items = [], totalPages: tp = 1 } = payload;
      setMedia(items);
      setTotalPages(tp);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('category', folder);

    try {
      const token = Cookies.get('accessToken');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/media`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      fetchMedia(1);
    } catch (err) {
      console.error(err);
    }
  };

  const saveMetadata = async () => {
    if (!selected) return;
    try {
      const token = Cookies.get('accessToken');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/${selected.id}`,
        { alt_en: altText, title_en: titleText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMedia(page);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const token = Cookies.get('accessToken');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/media/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nextPage = media.length === 1 && page > 1 ? page - 1 : page;
      fetchMedia(nextPage);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Effects                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchMedia(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  useEffect(() => {
    if (!loading && (media.length === 0 || imageLoaded === media.length)) {
      setShowOverlay(false);
    }
  }, [imageLoaded, media.length, loading]);

  // reset "Copied" label whenever new modal opens/closes
  useEffect(() => setCopied(false), [selected]);

  /* ------------------------------------------------------------------ */
  /* Drag-and-drop                                                       */
  /* ------------------------------------------------------------------ */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  /* ------------------------------------------------------------------ */
  /* Modal helpers                                                       */
  /* ------------------------------------------------------------------ */
  const openModal = (item: MediaItem) => {
    setSelected(item);
    setAltText(item.alt || '');
    setTitleText(item.title || '');
  };
  const closeModal = () => setSelected(null);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* JSX                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main
        className="relative flex-1 overflow-y-auto"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {showOverlay && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b bg-white border-gray-200 p-4 md:p-7 flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900 lg:hidden"
            onClick={() => setSidebarOpen(o => !o)}
          >
            <Menu size={22} />
          </button>

          <button
            onClick={() => router.push('/media')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <ImageIcon size={22} className="text-gray-600" />
            Media
            {folder && (
              <>
                <ChevronRight size={16} className="text-gray-500" />
                <span className="capitalize text-gray-700">{folder}</span>
              </>
            )}
          </h1>

          <div className="flex-1" />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
        </header>

        {/* Images grid */}
        <section className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {loading ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-lg bg-gray-200 aspect-square"
              />
            ))
          ) : media.length ? (
            media.map(item => (
              <button
                key={item.id}
                onClick={() => openModal(item)}
                className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-indigo-400 transition group"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_UPLOAD_BASE}/${item.path}`}
                  width={item.width || 300}
                  height={item.height || 300}
                  alt={item.alt_en || item.originalname}
                  className="object-cover w-full h-full aspect-square group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  blurDataURL="/placeholder.png"
                  onLoadingComplete={() =>
                    setImageLoaded(count => count + 1)
                  }
                  onError={() => 
                    setImageLoaded(c => c + 1)
                  }
                />
                <span className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs font-medium px-2 py-1 truncate">
                  {item.originalname.replace(/\.[^/.]+$/, '')}
                </span>
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-10 text-center text-gray-500">
              <ImageIcon size={48} className="mb-3 text-gray-300" />
              <p>No media found in this folder.</p>
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 pb-6">
          <button
            onClick={() => fetchMedia(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchMedia(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg rounded-lg bg-white shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
            >
              <X size={20} />
            </button>

            <Image
              src={`${process.env.NEXT_PUBLIC_UPLOAD_BASE}/${selected.path}`}
              alt={selected.alt_en || selected.originalname}
              width={selected.width || 800}
              height={selected.height || 600}
              className="w-full h-72 object-contain bg-gray-100"
            />

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <Info label="Filename" value={selected.filename} />
                <Info
                  label="Original"
                  value={selected.originalname.replace(/\.[^/.]+$/, '')}
                />
                <Info
                  label="Size"
                  value={
                    selected.size
                      ? `${(selected.size / 1024).toFixed(2)} KB`
                      : 'N/A'
                  }
                />
                <Info
                  label="Dimensions"
                  value={
                    selected.width && selected.height
                      ? `${selected.width} × ${selected.height}px`
                      : 'N/A'
                  }
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Title"
                  value={titleText}
                  onChange={e => setTitleText(e.target.value)}
                />
                <Input
                  label="Alt text"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${process.env.NEXT_PUBLIC_UPLOAD_BASE}/${selected.path}`
                    )
                  }
                  className="inline-flex items-center gap-1 rounded bg-gray-100 hover:bg-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition"
                >
                  <Clipboard size={14} />
                  {copied ? 'Copied' : 'Copy URL'}
                </button>
                <button
                  onClick={() => deleteMedia(selected.id)}
                  className="inline-flex items-center gap-1 rounded bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  onClick={saveMetadata}
                  className="inline-flex items-center gap-1 rounded bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition"
                >
                  <Plus size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* Helpers                                                                   */
/* ========================================================================= */

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-semibold text-gray-600">{label}</p>
    <p className="mt-0.5 truncate">{value}</p>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-600">{label}</span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-3 py-2 text-sm"
    />
  </label>
);
