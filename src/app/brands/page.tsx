'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Box,
  Trash2,
  PencilLine,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/src/components/ConfirmModal';
import { getImgSrc } from '@/src/utils/getImgSrc';
import PermissionModal from '@/src/components/PermissionModal';

export default function BrandsPage() {
  const router = useRouter();

  const [brands, setBrands]               = useState<any[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all'|'active'|'inactive'>('all');
  const [language, setLanguage]           = useState<'en'|'ar'>('en');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isMobile, setIsMobile]           = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string|null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getLogoSrc = (url: string) => {
    if (!url) return '';  
    return url.startsWith('blob:')
      ? url
      : getImgSrc(url);
  };

  // Open modal for given id
  const openDeleteModal = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setBrandToDelete(id);
    setDeleteModalOpen(true);
  };
  // Close modal
  const closeDeleteModal = () => {
    setBrandToDelete(null);
    setDeleteModalOpen(false);
  };
  // When user confirms deletion
  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API}/brands/${brandToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setBrands(prev => prev.filter(b => b.id !== brandToDelete));
    } catch {
      alert('Delete failed');
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

  const showUnauthorizedPopup = () => setUnauthorizedModalOpen(true);
  const closeUnauthorizedPopup = () => setUnauthorizedModalOpen(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${API}/auth/profile`, {
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

  // fetch brands
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('language', language);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${API}/brands?${params.toString()}&sortBy=createdAt&sortOrder=DESC`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setBrands(data.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [statusFilter, language]);

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedBrands.length === filtered.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(filtered.map(b => b.id));
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

    const handleEdit = (id: string) => {
      if (userRole !== 'admin') return showUnauthorizedPopup();
      router.push(`/brands/edit/${id}`);
    };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API}/brands/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setBrands(prev => prev.filter(b => b.id !== id));
    } catch {
      alert('Delete failed');
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
                    <Box size={22} className="mr-2" /> Brands
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/brands/create');
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
                {/* Back button */}
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Box size={22} className="mr-2" /> Brands
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/brands/create');
                  }}
                  disabled={isLoading || userRole !== 'admin'}
                  className={`${isLoading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} flex items-center px-4 py-2 rounded-xl`}
                >
                  <Plus size={18} className="mr-2" /> Add Brand
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
                placeholder="Search brands..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400"/>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute right-3 top-3 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={18} className='text-gray-700' />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto"/>
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map(brand => (
                      <tr
                        key={brand.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEdit(brand.id)}
                      >
                        <td className="px-6 py-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                            {brand.logoUrl ? (
                              <img src={getLogoSrc(brand.logoUrl)} alt="" className="h-full w-full object-cover"/>
                            ) : (
                              <Box size={20} className="text-gray-400 m-2"/>
                            )}
                          </div>
                          <span className="ml-4 text-sm font-medium text-gray-900">{brand.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{brand.description}</td>
                        <td className="px-6 py-4">
                          <span className={`p-2 inline-flex text-xs font-semibold rounded-full ${
                            brand.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {brand.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEdit(brand.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            <PencilLine size={16}/>
                          </button>
                          <button
                            onClick={e => {e.stopPropagation(); openDeleteModal(brand.id)}}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No brands found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(brand => (
                <div
                  key={brand.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={() => handleEdit(brand.id)}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {brand.logoUrl ? (
                            <img
                              src={getLogoSrc(brand.logoUrl)}
                              alt={brand.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Box size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {brand.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(brand.id); }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openDeleteModal(brand.id); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {brand.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex font-semibold rounded-full ${brand.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {brand.status}
                      </span>
                      <span>
                        {new Date(brand.createdAt).toLocaleDateString('en-US', {
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
                <p className="text-gray-500">No brands found.</p>
                <button
                  onClick={() => router.push('/brands/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add New Brand
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
        message="Delete this brand?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
