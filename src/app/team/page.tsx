'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronDown,
  Check,
  Trash2,
  PencilLine,
  MoreHorizontal,
  Image as ImageIcon,
  UsersRound
} from 'lucide-react';
import Link from 'next/link';

// Sample team member data
const sampleTeamMembers = [
  { 
    id: '1', 
    name: 'John Doe',
    title: 'CEO',
    status: 'active',
    cover: '/covers/john-doe.jpg',
    date: '2025-03-15'
  },
  { 
    id: '2', 
    name: 'Jane Smith',
    title: 'CTO',
    status: 'active',
    cover: '/covers/jane-smith.jpg',
    date: '2025-03-10'
  },
  { 
    id: '3', 
    name: 'Emily Johnson',
    title: 'Project Manager',
    status: 'active',
    cover: '/covers/emily-johnson.jpg',
    date: '2025-02-28'
  },
  { 
    id: '4', 
    name: 'Michael Brown',
    title: 'UI/UX Designer',
    status: 'inactive',
    cover: '/covers/michael-brown.jpg',
    date: '2025-02-20'
  },
  { 
    id: '5', 
    name: 'Sarah Lee',
    title: 'Marketing Manager',
    status: 'inactive',
    cover: '/covers/sarah-lee.jpg',
    date: '2025-02-15'
  }
];

export default function TeamPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Toggle team member selection
  const toggleMemberSelection = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };
  
  // Select all team members
  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
  };
  
  // Handle edit action
  const handleEditMember = (id: string) => {
    router.push(`/team/edit/${id}`);
  };
  
  // Filter team members based on search and status
  const filteredMembers = sampleTeamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && member.status === 'active') ||
      (statusFilter === 'inactive' && member.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
              <UsersRound size={22} className="mr-2" />
                Team</h1>
            </div>
            <button 
              onClick={() => router.push('/team/create')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Team Member
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="relative flex-1 md:flex-initial">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 w-full border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Team list - Desktop view */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr 
                      key={member.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEditMember(member.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => {
                        e.stopPropagation();
                        toggleMemberSelection(member.id);
                      }}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => {}}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {member.cover ? (
                              <img src={member.cover} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="text-gray-500" size={20} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{member.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.date).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMember(member.id);
                            }}
                          >
                            <PencilLine size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team list - Mobile view */}
          <div className="md:hidden space-y-4">
            {filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                onClick={() => handleEditMember(member.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {member.cover ? (
                          <img src={member.cover} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-500" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Title:</strong> {member.title}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Date Joined:</strong> {new Date(member.date).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleMemberSelection(member.id);
                        }}
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMember(member.id);
                        }}
                      >
                        <PencilLine size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">
                No team members found matching your search criteria.
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => router.push('/team/create')}
              >
                Add New Member
              </button>
            </div>
          )}
            
          {filteredMembers.length > 0 && (
            <div className="bg-white mt-4 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 rounded-b-xl sm:px-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredMembers.length}</span> of{' '}
                <span className="font-medium">{sampleTeamMembers.length}</span> team members
              </div>
              <div className="flex gap-2">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
