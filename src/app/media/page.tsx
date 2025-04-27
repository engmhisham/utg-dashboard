// src/app/media/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/src/components/Sidebar';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';

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
  title?: string;
  createdAt: string;
}

export default function MediaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [media, setMedia]           = useState<MediaItem[]>([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);

  // Modal state
  const [selected, setSelected]     = useState<MediaItem | null>(null);
  const [altText, setAltText]       = useState('');
  const [titleText, setTitleText]   = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch page of media
  const fetchMedia = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/media?page=${pageNum}&limit=24`,
      { headers: { Authorization: `Bearer ${token}` } }
      );
      // if your API wraps every response in a 'data' field, unwrap it:
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

  useEffect(() => {
    fetchMedia();
  }, []);

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const form = new FormData();
    form.append('file', file);
    // you can also append alt/title here if you have inputs
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
      fetchMedia(page);
    } catch (err) {
      console.error(err);
    } finally {
      // reset input so same file can be re‐selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open modal
  const openModal = (item: MediaItem) => {
    setSelected(item);
    setAltText(item.alt || '');
    setTitleText(item.title || '');
  };
  const closeModal = () => setSelected(null);

  // Save metadata
  const saveMetadata = async () => {
    if (!selected) return;
    try {
      const token = Cookies.get('accessToken');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/${selected.id}`,
        { alt: altText, title: titleText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMedia(page);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete media
  const deleteMedia = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const token = Cookies.get('accessToken');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/media/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // if you deleted the last item on the page, go back a page
      const nextPage = media.length === 1 && page > 1 ? page - 1 : page;
      fetchMedia(nextPage);
      closeModal();
    } catch (err) {
      console.error(err);
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
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Media Library</h1>
          {/* <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" /> Upload Media
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
          </div> */}
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded" />
              ))
            : media.map(item => (
                <div
                  key={item.id}
                  className="cursor-pointer border rounded overflow-hidden"
                  onClick={() => openModal(item)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_UPLOAD_BASE}/${item.path}`}
                    width={item.width || 200}
                    height={item.height || 200}
                    alt={item.alt || item.originalname}
                    className="object-cover w-full h-32"
                  />
                  <div className="p-3 text-sm text-center font-bold text-blue-900 truncate">{item.originalname.replace(/\.[^/.]+$/, "")}</div>
                </div>
              ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center py-4 space-x-4">
          <button
            onClick={() => fetchMedia(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchMedia(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div
          className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">{selected.title?.replace(/\.[^/.]+$/, "")}</h2>
              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <img
                src={`${process.env.NEXT_PUBLIC_UPLOAD_BASE}/${selected.path}`}
                alt={selected.alt}
                className="w-full object-contain h-64"
              />
              {/* File Information - Read Only */}
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="block text-sm font-bold text-blue-700">Filename</label>
                  <div className="mt-1 text-sm">{selected.filename}</div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-700">Original Name</label>
                  <div className="mt-1 text-sm">{selected.originalname.replace(/\.[^/.]+$/, "")}</div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-700">Size</label>
                  <div className="mt-1 text-sm">
                    {selected.size ? `${(selected.size / 1024).toFixed(2)} KB` : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-700">Dimensions</label>
                  <div className="mt-1 text-sm">
                    {selected.width && selected.height 
                      ? `${selected.width} × ${selected.height} px` 
                      : 'N/A'}
                  </div>
                </div>
              </div>
              {/* Editable Fields */}
              <div className='px-4'>
                <label className="block text-sm font-bold text-blue-700">Title</label>
                <input
                  type="text"
                  value={titleText}
                  onChange={e => setTitleText(e.target.value)}
                  className="mt-1 block w-full border rounded px-2 py-1"
                />
              </div>
              <div className='px-4'>
                <label className="block text-sm font-bold text-blue-700">Alt Tag</label>
                <input
                  type="text"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  className="mt-1 block w-full border rounded px-2 py-1"
                />
              </div>

              <div className="flex justify-end space-x-2 px-4">
                <button
                  onClick={() => deleteMedia(selected.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={saveMetadata}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
