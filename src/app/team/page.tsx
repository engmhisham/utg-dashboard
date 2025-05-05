'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../../components/Sidebar';
import {
  ArrowLeft,
  Search,
  Plus,
  UsersRound,
  X,
  Menu,
  PencilLine,
  Trash2,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ConfirmModal from '@/src/components/ConfirmModal';
import { get } from 'http';
import { getImgSrc } from '@/src/utils/getImgSrc';
import PermissionModal from '@/src/components/PermissionModal';

export default function TeamPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [team, setTeam]                     = useState<any[]>([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isMobile, setIsMobile]             = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [loading, setLoading]               = useState(true);
  const [deleteModalOpen, setDeleteModalOpen]   = useState(false);
  const [memberToDelete, setMemberToDelete]     = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  const openDeleteModal = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setMemberToDelete(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(`${API_BASE_URL}/team-members/${memberToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTeam(t => t.filter(m => m.id !== memberToDelete));
      toast.success('Member deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      closeDeleteModal();
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const params = new URLSearchParams();
        params.append('language', 'en');
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const res = await fetch(
          `${API_BASE_URL}/team-members?${params.toString()}&sortBy=createdAt&sortOrder=DESC`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        setTeam(result.data?.items || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch team');
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  const filteredMembers = team.filter(member => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      member.name.toLowerCase().includes(q) ||
      member.title.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelection = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const handleEdit = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    router.push(`/team/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTeam(prev => prev.filter(m => m.id !== id));
      toast.success('Deleted!');
    } catch {
      toast.error('Delete failed!');
    }
  };

  const renderStatusBadge = (status: string) => (
    <span className={`p-2 inline-flex text-xs font-semibold rounded-full ${
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );

  const renderDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />
      <main className="flex-1 overflow-y-auto">

        {/* Top Header */}
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
                  <UsersRound size={20}/>
                  <h1 className="text-xl font-medium ml-2">
                    Team
                  </h1>
                </div>

                {/* Right group: “+” button */}
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/team/create');
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
                  <h1 className="text-2xl font-semibold flex items-center">
                  <UsersRound size={22} className="mr-2" />
                    Team
                  </h1>
                </div>

                {/* Right group: “Add Member” button */}
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/team/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} flex items-center px-4 py-2 rounded-xl`}
                >
                  <Plus size={18} className="mr-2" /> Add Member
                </button>
              </>
            )}
          </div>
        </div>


        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search team..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute right-3 top-3 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={18} className='text-gray-700' />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEdit(member.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                              {member.coverImageUrl ? (
                                <img
                                  src={getImgSrc(member.coverImageUrl)}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={20} className="text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {member.title}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {renderDate(member.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleEdit(member.id)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                            <PencilLine size={16} />
                          </button>
                          <button onClick={e => {
                            e.stopPropagation(); 
                            openDeleteModal(member.id);
                            }} 
                            className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl border shadow-sm cursor-pointer"
                  onClick={() => handleEdit(member.id)}
                >
                  <div
                    key={member.id}
                    className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer"
                    onClick={() => handleEdit(member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {member.coverImageUrl ? (
                            <img
                              src={getImgSrc(member.coverImageUrl)}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {member.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(member.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openDeleteModal(member.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {member.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      {renderStatusBadge(member.status)}
                      <span>{renderDate(member.createdAt)}</span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
                <p className="text-gray-500">No team members found.</p>
                <button
                  onClick={() => router.push('/team/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add New Member
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
        message="Delete this member?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
