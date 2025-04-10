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

// Sample clients data
const sampleClients = [
  { 
    id: '1', 
    title: 'Acme Corporation',
    description: 'Leading provider of innovative solutions.',
    status: 'active',
    logo: '/logos/acme-logo.svg',
    url: 'https://www.acme.com',
    date: '2025-03-15'
  },
  { 
    id: '2', 
    title: 'Globex Inc.',
    description: 'Global business solutions and services.',
    status: 'active',
    logo: '/logos/globex-logo.svg',
    url: 'https://www.globex.com',
    date: '2025-03-10'
  },
  { 
    id: '3', 
    title: 'Innotech',
    description: 'Cutting edge technology and research.',
    status: 'active',
    logo: '/logos/innotech-logo.svg',
    url: 'https://www.innotech.com',
    date: '2025-02-28'
  },
  { 
    id: '4', 
    title: 'Umbrella Corp.',
    description: 'Pharmaceutical and research innovations.',
    status: 'inactive',
    logo: '/logos/umbrella-logo.svg',
    url: 'https://www.umbrella.com',
    date: '2025-02-20'
  },
  { 
    id: '5', 
    title: 'Soylent Corp.',
    description: 'Revolutionizing the food industry.',
    status: 'inactive',
    logo: '/logos/soylent-logo.svg',
    url: 'https://www.soylent.com',
    date: '2025-02-15'
  }
];

export default function ClientsPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State for search, filtering, and mobile view detection
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Check if mobile using window width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Toggle selection for a specific client
  const toggleClientSelection = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(clientId => clientId !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };
  
  // Toggle select/unselect all clients
  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };
  
  // Handle edit action
  const handleEditClient = (id: string) => {
    router.push(`/clients/edit/${id}`);
  };
  
  // Filter clients based on search query and status filter
  const filteredClients = sampleClients.filter(client => {
    const matchesSearch = 
      client.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.status === 'active') ||
      (statusFilter === 'inactive' && client.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
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
                Clients</h1>
            </div>
            <button 
              onClick={() => router.push('/clients/create')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Client
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search clients..."
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

          {/* Clients list - Desktop View */}
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
                          checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEditClient(client.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => {
                        e.stopPropagation();
                        toggleClientSelection(client.id);
                      }}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => {}}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {client.logo ? (
                              <img src={client.logo} alt={client.title} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="text-gray-500" size={20} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{client.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={client.url} target="_blank" rel="noopener noreferrer">
                          {client.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.date).toLocaleDateString('en-US', {
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
                              handleEditClient(client.id);
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

          {/* Clients list - Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                onClick={() => handleEditClient(client.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {client.logo ? (
                          <img src={client.logo} alt={client.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-500" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{client.title}</div>
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {client.description}
                  </div>
                  
                  <div className="text-sm text-blue-600 mb-3">
                    <a href={client.url} target="_blank" rel="noopener noreferrer">
                      {client.url}
                    </a>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                        checked={selectedClients.includes(client.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleClientSelection(client.id);
                        }}
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client.id);
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
            
          {filteredClients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">
                No clients found matching your search criteria.
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => router.push('/clients/create')}
              >
                Add New Client
              </button>
            </div>
          )}
            
          {filteredClients.length > 0 && (
            <div className="bg-white mt-4 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 rounded-b-xl sm:px-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredClients.length}</span> of{' '}
                <span className="font-medium">{sampleClients.length}</span> clients
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
