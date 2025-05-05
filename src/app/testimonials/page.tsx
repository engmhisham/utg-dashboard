'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Menu,
  X,
  PencilLine,
  Trash2,
  Users,
  BookCopy,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import ConfirmModal from '@/src/components/ConfirmModal';
import { getImgSrc } from '@/src/utils/getImgSrc';
import PermissionModal from '@/src/components/PermissionModal';

export default function TestimonialsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Helper to open modal
  function openDeleteModal(id: string) {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setTestimonialToDelete(id);
    setDeleteModalOpen(true);
  }

  // Helper to close modal
  function closeDeleteModal() {
    setTestimonialToDelete(null);
    setDeleteModalOpen(false);
  }

  // Actually perform delete
  async function confirmDelete() {
    if (!testimonialToDelete) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${testimonialToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete));
      toast.success('Deleted successfully');
    } catch {
      toast.error('Failed to delete');
    } finally {
      closeDeleteModal();
    }
  }
  // viewport check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showUnauthorizedPopup = () => setUnauthorizedModalOpen(true);
    const closeUnauthorizedPopup = () => setUnauthorizedModalOpen(false);
  
    useEffect(() => {
      const fetchUserRole = async () => {
        try {
          const token = Cookies.get('accessToken');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          setUserRole(data.data.role); // assuming the response includes { role: 'admin' | ... }
        } catch {
          setUserRole(null); // fallback
        }
      };
  
      fetchUserRole();
  }, []);

  // fetch testimonials
  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const params = new URLSearchParams();
        params.append('language', 'en');
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const res = await fetch(`${API_BASE_URL}/testimonials?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        const data = await res.json();
        setTestimonials(data.data?.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  // search & filter
  const filtered = testimonials.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.position || '').toLowerCase().includes(q) ||
      (t.company || '').toLowerCase().includes(q) ||
      (t.content || '').toLowerCase().includes(q)
    );
  });

  // selection helpers
  const toggleSelectAll = () => {
    if (selectedTestimonials.length === filtered.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filtered.map(t => t.id));
    }
  };
  const toggleSelect = (id: string) =>
    setSelectedTestimonials(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // actions
  const handleEdit = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    router.push(`/testimonials/edit/${id}`);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success('Deleted successfully');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex justify-between items-center">
            {isMobile ? (
              <>
                {/* Left group: toggle, back arrow, title */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(o => !o)}
                    className="p-1 bg-white rounded-full border shadow-sm"
                  >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <BookCopy size={20} />
                  {/* Title */}
                  <h1 className="text-xl font-medium ml-2">
                    Testimonials
                  </h1>
                </div>

                {/* Right group: “+” button */}
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/testimonials/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white rounded-xl hover:bg-blue-700'} p-2 rounded-xl`}
                >
                  <Plus size={18} />
                </button>
              </>
            ) : (
              <>
                {/* Left group: back arrow, title */}
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <BookCopy size={20} />
                  <h1 className="text-2xl font-semibold">
                    Testimonials
                  </h1>
                </div>

                {/* Right group: “Add Member” button */}
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/testimonials/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} flex items-center px-4 py-2 rounded-xl`}
                >
                  <Plus size={18} className="mr-2" /> Add Testimonial
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search testimonials..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
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
                </select>
                <div className="absolute right-3 top-3 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={18} className='text-gray-700' />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
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
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <div className="flex justify-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map(t => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEdit(t.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {t.coverImageUrl ? (
                              <img src={getImgSrc(t.coverImageUrl)} alt={t.name} className="h-full w-full object-cover" />
                            ) : (
                              <Users className="text-gray-500" size={20} />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{t.name}</div>
                            <div className="text-sm text-gray-500">{t.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{t.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`p-2 inline-flex text-xs font-semibold rounded-full ${
                            t.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td
                        className="px-6 py-4 text-right space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEdit(t.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openDeleteModal(t.id); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No testimonials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={() => handleEdit(t.id)}
                >
                  {/* inner padded card */}
                  <div className="p-4">
                    {/* header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {t.coverImageUrl ? (
                            <img
                              src={getImgSrc(t.coverImageUrl)}
                              alt={t.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="text-gray-400" size={20} />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {t.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(t.id); }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openDeleteModal(t.id); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* company */}
                    <p className="mt-2 text-sm text-gray-500">
                      <strong>Company:</strong> {t.company}
                    </p>

                    {/* content */}
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {t.content}
                    </p>

                    {/* footer */}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex font-semibold rounded-full ${t.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {t.status}
                      </span>
                      <span>
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
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
                <p className="text-gray-500">No testimonials found.</p>
                <button
                  onClick={() => router.push('/testimonials/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Testimonial
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
      <PermissionModal
        show={unauthorizedModalOpen}
        message="You don’t have permission to perform this action."
        onClose={closeUnauthorizedPopup}
      />
      <ConfirmModal
        show={deleteModalOpen}
        message="Delete this testimonial?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
