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
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/src/components/LoadingSpinner';

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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  const handleEdit = (id: string) => router.push(`/team/edit/${id}`);

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
      toast.success('Deleted ✅');
    } catch {
      toast.error('Delete failed ❌');
    }
  };

  const renderStatusBadge = (status: string) => (
    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
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
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 bg-white rounded-full border shadow-sm"
                >
                  {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
                </button>
              )}
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <UsersRound size={22} className="mr-2" /> Team
              </h1>
            </div>
            <button
              onClick={() => router.push('/team/create')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" /> Add Member
            </button>
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
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={
                          selectedMembers.length === filteredMembers.length &&
                          filteredMembers.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                        <td
                          className="px-6 py-4"
                          onClick={e => { e.stopPropagation(); toggleSelection(member.id); }}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600"
                            checked={selectedMembers.includes(member.id)}
                            readOnly
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                              {member.coverImageUrl ? (
                                <img
                                  src={member.coverImageUrl}
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
                          <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">
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
                  className="bg-white rounded-xl border shadow-sm p-4 cursor-pointer"
                  onClick={() => handleEdit(member.id)}
                >
                  {/* ...your existing mobile card markup here */}
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
    </div>
  );
}
