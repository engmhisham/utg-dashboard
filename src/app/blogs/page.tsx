// src/app/blogs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  UsersRound,
  PencilLine,
  Trash2,
  Menu,
  X,
  Image as ImageIcon,
  Rss
} from 'lucide-react';
import Link from 'next/link';
import { Blog, BlogStatus } from '@/src/lib/types';
import { getImgSrc } from '@/src/utils/getImgSrc';
import ConfirmModal from '@/src/components/ConfirmModal';

export default function BlogsPage() {
  const router = useRouter();

  const [blogs, setBlogs]               = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [selected, setSelected]         = useState<string[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isMobile, setIsMobile]         = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  // modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const openDeleteModal = (id: string) => {
    setBlogToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setBlogToDelete(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogToDelete}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.filter(b => b.id !== blogToDelete));
    } catch {
      alert('Delete failed!');
    } finally {
      closeDeleteModal();
    }
  };


  // viewport check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // fetch blogs
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs?language=en&sortBy=createdAt&sortOrder=DESC`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const r = await res.json();
        setBlogs(r.data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filter & select helpers
  const toggleSelect = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    if (selected.length === filtered.length && filtered.length > 0) {
      setSelected([]);
    } else {
      setSelected(filtered.map(b => b.id));
    }
  };

  const filtered = blogs.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesQ = b.title.toLowerCase().includes(q) ||
                     b.description.toLowerCase().includes(q);
    const matchesS = statusFilter === 'all' || b.status === statusFilter;
    return matchesQ && matchesS;
  });

  const handleEdit   = (id: string) => router.push(`/blogs/edit/${id}`);
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Delete failed');
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (e: any) {
      alert(e.message || 'Unknown error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(o => !o)}
                    className="p-1 bg-white rounded-full shadow border"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Rss size={22} className="mr-2" /> Blogs
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/blogs/create')}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} />
                </button>
              </>
            ) : (
              <>
                {/* Back button */}
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Rss size={22} className="mr-2" /> Blogs
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/blogs/create')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" /> Add Blog
                </button>
              </>
            )}


          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search blogs…"
                  className="pl-10 pr-4 py-2 w-full rounded-lg border"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="border rounded-lg py-2 px-3"
                >
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map(b => (
                      <tr
                        key={b.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEdit(b.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                              {b.coverImageUrl ? (
                                <img
                                  src={getImgSrc(b.coverImageUrl)}
                                  alt={b.title}
                                  className="object-cover h-full w-full"
                                />
                              ) : (
                                <ImageIcon className="text-gray-400 m-2" />
                              )}
                            </div>
                            <span className="ml-3 text-sm font-medium">{b.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                          {b.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600">{b.slug}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`p-2 inline-flex text-xs font-semibold rounded-full ${
                              b.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : b.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEdit(b.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            onClick={e => {e.stopPropagation(); openDeleteModal(b.id)}}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No blogs match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(b => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={() => handleEdit(b.id)}
                >
                  <div className="p-4">
                    {/* Header row: cover image (or icon), title, edit/delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {b.coverImageUrl ? (
                            <img
                              src={getImgSrc(b.coverImageUrl)}
                              alt={b.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{b.title}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(b.id); }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openDeleteModal(b.id); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {b.description}
                    </p>

                    {/* Footer row: status badge & date */}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex font-semibold rounded-full ${b.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {b.status}
                      </span>
                      <span>
                        {new Date(b.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
                <p className="text-gray-500">No blogs match your filters.</p>
                <button
                  onClick={() => router.push('/blogs/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Blog
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
      <ConfirmModal
        show={deleteModalOpen}
        message="Delete this blog?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
