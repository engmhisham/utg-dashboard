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
  Rss,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');


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
      console.error('Failed to fetch categories');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  

  // fetch blogs
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('language', 'en');
        params.append('sortBy', 'createdAt');
        params.append('sortOrder', 'DESC');
        if (selectedCategory) params.append('category', selectedCategory);
        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs?${params.toString()}`,
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
  }, [selectedCategory]);

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
              <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="appearance-none w-full pl-3 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="absolute right-3 top-3 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={18} className='text-gray-700' />
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="flex justify-between flex-wrap gap-2 mb-6 items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {cat.name_en}
              </button>
            ))}
          </div>
          <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-200 text-sm"
            >
              + Add Category
            </button>
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
                      Category
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
                        <td className="px-6 py-4">
                          <span
                            className={`p-2 inline-flex text-sm font-semibold rounded-full ${
                              b.category?.name === `${b.category?.name}`
                                ? 'text-green-800'
                                : b.category?.name === 'Uncategorized'
                                  ? 'text-yellow-800'
                                  : 'text-gray-800'
                            }`}
                          >
                            {b.category?.name || 'Uncategorized'}
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
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Blog Category</h2>
            <input
              type="text"
              placeholder="Category name (English)"
              value={newCategoryNameEn}
              onChange={(e) => setNewCategoryNameEn(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Category name (Arabic)"
              value={newCategoryNameAr}
              onChange={(e) => setNewCategoryNameAr(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const token = Cookies.get('accessToken');
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ name_en: newCategoryNameEn, name_ar: newCategoryNameAr, type: 'blog' }),
                    });
                    if (!res.ok) throw new Error();
                    toast.success('Category added');
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    await fetchCategories(); // reload
                  } catch {
                    toast.error('Failed to add category');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        show={deleteModalOpen}
        message="Delete this blog?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
