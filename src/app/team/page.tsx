'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../../components/Sidebar';
import {
  ArrowLeft, Search, Plus, ChevronDown, UsersRound,
  X, Menu, PencilLine, Trash2, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [team, setTeam] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
    const fetchTeam = async () => {
      setLoading(true);
      const token = Cookies.get('accessToken');
      try {
        const params = new URLSearchParams();
        params.append('language', 'en');
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const res = await fetch(`${API_BASE_URL}/team-members?sortBy=createdAt&sortOrder=DESC`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const result = await res.json();
        setTeam(result.data?.items || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch team');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [statusFilter]);

  const filteredMembers = team.filter(member => {
    const matchSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        member.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this member?');
    if (!confirmed) return;
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch(`${API_BASE_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete team member');
      setTeam(prev => prev.filter(m => m.id !== id));
      toast.success('Team member deleted successfully ✅');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete ❌');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedMembers(prev => (
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    ));
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const handleEdit = (id: string) => router.push(`/team/edit/${id}`);

  const renderStatusBadge = (status: string) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );

  const renderDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

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
                <UsersRound className="mr-2" size={22} /> Team
              </h1>
            </div>
            <button
              onClick={() => router.push('/team/create')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search team..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {/* Team List – Desktop */} 
<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600"
              checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
              onChange={toggleSelectAll}
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredMembers.map(member => (
          <tr key={member.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEdit(member.id)}>
            <td className="px-6 py-4" onClick={e => { e.stopPropagation(); toggleSelection(member.id); }}>
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
                    <img src={member.coverImageUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">{member.name}</div>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{member.title}</td>
            <td className="px-6 py-4">{renderStatusBadge(member.status)}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{renderDate(member.createdAt)}</td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleEdit(member.id)} className="text-indigo-600 hover:text-indigo-900">
                  <PencilLine size={16} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


          {/* Team List – Mobile */}
          <div className="md:hidden space-y-4">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="bg-white rounded-xl border shadow-sm p-4"
                onClick={() => handleEdit(member.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {member.coverImageUrl ? (
                        <img src={member.coverImageUrl} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-500" size={20} />
                      )}
                    </div>
                    <div className="ml-3 text-sm font-medium text-gray-900">{member.name}</div>
                  </div>
                  {renderStatusBadge(member.status)}
                </div>
                <div className="text-sm text-gray-700 mb-2">{member.title}</div>
                <div className="text-sm text-gray-500 mb-2">Joined: {renderDate(member.createdAt)}</div>
                <div className="flex justify-between items-center border-t pt-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleSelection(member.id)}
                    />
                    <span className="text-xs text-gray-500">Select</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleEdit(member.id)}>
                      <PencilLine size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(member.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && <p className="text-center text-gray-400 mt-8">Loading...</p>}

          {!loading && filteredMembers.length === 0 && (
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
      </main>
    </div>
  );
}
