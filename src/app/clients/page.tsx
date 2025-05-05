'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Menu,
  X,
  UsersRound,
  PencilLine,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Client } from '@/src/lib/types';
import ConfirmModal from '@/src/components/ConfirmModal';
import { getImgSrc } from '@/src/utils/getImgSrc';
import PermissionModal from '@/src/components/PermissionModal';

export default function ClientsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen]   = useState(false);
  const [clientToDelete, setClientToDelete]     = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  // open / close / confirm logic
  const openDeleteModal = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setClientToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };
  const confirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${clientToDelete}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Delete failed');
      setClients(prev => prev.filter(c => c.id !== clientToDelete));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    } finally {
      closeDeleteModal();
    }
  };

  // detect mobile viewport
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
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

  // fetch clients
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/clients?sortBy=createdAt&sortOrder=DESC`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch clients');
        const json = await res.json();
        setClients(json.data.items || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filter clients
  const filteredClients = clients.filter(client => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      client.title.toLowerCase().includes(q) ||
      client.description.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.status === 'active') ||
      (statusFilter === 'inactive' && client.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  // selection helpers
  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };
  const toggleSelect = (id: string) =>
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // actions
  const handleEdit = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    router.push(`/clients/edit/${id}`);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />

      <main className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <div className="flex items-center justify-between w-full px-4 py-2">
              {/* Left group */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 rounded-full bg-white shadow border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium flex items-center">
                  <UsersRound size={22} className="mr-2" />
                  Clients
                </h1>
              </div>
            
              {/* Right “+” button */}
              <button
                onClick={() => {
                  if (userRole !== 'admin') return showUnauthorizedPopup();
                  router.push('/clients/create');
                }}
                disabled={loading || userRole !== 'admin'}
                className={`${loading || userRole !== 'admin'
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white rounded-xl hover:bg-blue-700'} p-2 rounded-xl`}
              >
                <Plus size={18} />
              </button>
            </div>
            
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <UsersRound size={22} className="mr-2" />
                    Clients
                  </h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/clients/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} flex items-center px-4 py-2 rounded-xl`}
                >
                  <Plus size={18} className="mr-2" />
                  Add Client
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search clients..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Desktop Table – header always shown */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
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
                    <td colSpan={7} className="py-8">
                      <div className="flex justify-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(client.id);
                      }}
                    >
                      <td className="px-6 py-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {client.logoUrl ? (
                            <img
                              src={getImgSrc(client.logoUrl)}
                              alt={client.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          {client.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {client.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        <a
                          href={client.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                        >
                          {client.url}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`p-2 inline-flex text-xs font-semibold rounded-full ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td
                        className="px-6 py-4 text-right space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(client.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openDeleteModal(client.id);
                          }}
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
                      No clients found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="h-8 w-8 text-gray-400" />
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div
                  key={client.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    handleEdit(client.id);
                  }}
                >
                  {/* ...your existing mobile card markup... */}
                  <div
                    key={client.id}
                    className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      handleEdit(client.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {client.logoUrl ? (
                            <img
                              src={getImgSrc(client.logoUrl)}
                              alt={client.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {client.title}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(client.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openDeleteModal(client.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 truncate">
                      {client.description}
                    </p>

                    <a
                      href={client.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="mt-2 block text-sm text-blue-600 truncate"
                    >
                      {client.url}
                    </a>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`p-2 py-1 rounded-full ${client.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {client.status}
                      </span>
                      <span>
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                          : '—'}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                <p className="text-gray-500">
                  No clients found matching your criteria.
                </p>
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
        message="Delete this client?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
