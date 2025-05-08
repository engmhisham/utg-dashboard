'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, Plus, MapPin, Trash2, PencilLine, Menu, X, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/src/components/ConfirmModal';
import PermissionModal from '@/src/components/PermissionModal';
import { getImgSrc } from '@/src/utils/getImgSrc';

export default function LocationsPage() {
  const router = useRouter();

  const [locations, setLocations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const showUnauthorizedPopup = () => setUnauthorizedModalOpen(true);
  const closeUnauthorizedPopup = () => setUnauthorizedModalOpen(false);

  const fetchUserRole = async () => {
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserRole(data.data.role);
    } catch {
      setUserRole(null);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchUserRole(); }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('language', language);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const token = Cookies.get('accessToken');
        const res = await fetch(`${API}/locations?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLocations(data.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [statusFilter, language]);

  const filtered = locations.filter(loc =>
    loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDeleteModal = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setLocationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API}/locations/${locationToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setLocations(prev => prev.filter(l => l.id !== locationToDelete));
    } catch {
      alert('Delete failed');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleEdit = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    router.push(`/locations/edit/${id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 bg-white rounded-full shadow border">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <MapPin size={22} className="mr-2" /> Locations
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/locations/create');
                  }}
                  disabled={isLoading || userRole !== 'admin'}
                  className={`${isLoading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} p-2 rounded-xl`}
                >
                  <Plus size={18} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <MapPin size={22} className="mr-2" /> Locations
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/locations/create');
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" /> Add Location
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search locations..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
                  <ChevronDown size={18} className="text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map(loc => (
                    <tr key={loc.id} onClick={() => handleEdit(loc.id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{loc.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{loc.city}</td>
                      <td className="px-6 py-4">
                        <span className={`p-2 inline-flex text-xs font-semibold rounded-full ${
                          loc.status === 'published' ? 'bg-green-100 text-green-800'
                          : loc.status === 'draft' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(loc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(loc.id)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                          <PencilLine size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(loc.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No locations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(loc => (
                <div
                  key={loc.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={() => handleEdit(loc.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{loc.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${loc.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : loc.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {loc.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{loc.city}</p>
                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                      <span>{new Date(loc.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-3">
                        <button onClick={e => { e.stopPropagation(); handleEdit(loc.id); }}>
                          <PencilLine size={16} className="text-indigo-600" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); openDeleteModal(loc.id); }}>
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
                <p className="text-gray-500">No locations found.</p>
                <button
                  onClick={() => router.push('/locations/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add New Location
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
        message="Delete this location?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
