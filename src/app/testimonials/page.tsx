'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
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
  BookCopy
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function TestimonialsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const params = new URLSearchParams();
        params.append('language', 'en');
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const res = await fetch(`${API_BASE_URL}/testimonials?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setTestimonials(data.data?.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [statusFilter]);

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch =
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedTestimonials(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTestimonials.length === filteredTestimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filteredTestimonials.map(t => t.id));
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/testimonials/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this testimonial?');
    if (!confirmed) return;

    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 bg-white rounded-full border shadow-sm">
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <BookCopy className="mr-2" size={22} />
                Testimonials
              </h1>
            </div>
            <button
              onClick={() => router.push('/testimonials/create')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Add Testimonial
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search testimonials..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Testimonials Table - Desktop View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTestimonials.map(testimonial => (
                  <tr
                    key={testimonial.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(testimonial.id)}
                  >
                    <td className="px-6 py-4 flex justify-center align-middle" onClick={(e) => { e.stopPropagation(); toggleSelect(testimonial.id); }}>
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(testimonial.id)}
                        onChange={() => { }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {testimonial.coverImageUrl ? (
                            <img src={testimonial.coverImageUrl} alt={testimonial.name} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="text-gray-500" size={20} />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{testimonial.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${testimonial.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {testimonial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(testimonial.id)} className="text-indigo-600 hover:text-indigo-900">
                          <PencilLine size={16} />
                        </button>
                        <button onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredTestimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
                onClick={() => handleEdit(testimonial.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {testimonial.coverImageUrl ? (
                          <img src={testimonial.coverImageUrl} alt={testimonial.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="text-gray-500" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.position}</div>
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${testimonial.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {testimonial.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Company:</strong> {testimonial.company}
                  </div>
                  <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {testimonial.content}
                  </div>
                  <div className="flex justify-end items-center pt-3 border-t border-gray-200 space-x-3">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(testimonial.id);
                      }}
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(testimonial.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>

  );
}
