'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronDown,
  Trash2,
  PencilLine,
  MoreHorizontal,
  Image as ImageIcon,
  UsersRound,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

type Client = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  logoUrl: string;
  url: string;
  createdAt?: string; // Optional if not always returned
};

export default function ClientsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mobile check
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = Cookies.get('accessToken');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients?sortBy=createdAt&sortOrder=DESC`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch clients');

        const result = await res.json();
        console.log('Fetched clients:', result);

        setClients(result.data.items || []);
        // const sorted = (result.data.items || []).sort((a, b) => {
        //   return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        // });
        
        // setClients(sorted);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const toggleClientSelection = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handleEditClient = (id: string) => {
    router.push(`/clients/edit/${id}`);
  };

  const filteredClients: Client[] = clients.filter(client => {
    const title = client.title || '';
    const description = client.description || '';
  
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
  
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.status === 'active') ||
      (statusFilter === 'inactive' && client.status === 'inactive');
  
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClient = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this client?');
    if (!confirmed) return;
  
    const token = Cookies.get('accessToken');
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete client');
      }
  
      // Remove deleted client from state
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Something went wrong while deleting');
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading clients...
      </div>
    );
  }
  console.log('Filtered clients:', filteredClients);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6">
            {isMobile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium ml-2 flex items-center">
                    <UsersRound size={22} className="mr-2" />
                    Clients
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/clients/create')}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <UsersRound size={22} className="mr-2" />
                    Clients
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/clients/create')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Client
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
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
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 w-full border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* List content here (same as before) */}
          {/* You can leave your table & mobile layout exactly as you had — it will now use `filteredClients` */}
          

          {filteredClients.length > 0 ? (
  <>
    {/* Clients List – Desktop View */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditClient(client.id)}>
                <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleClientSelection(client.id); }}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={selectedClients.includes(client.id)}
                    readOnly
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-900">{client.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{client.description}</td>
                <td className="px-6 py-4 text-sm text-blue-600">
                  <a href={client.url} target="_blank" rel="noopener noreferrer">{client.url}</a>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => { e.stopPropagation(); handleEditClient(client.id); }}
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                    >
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

    {/* Clients List – Mobile View */}
    <div className="md:hidden space-y-4">
      {filteredClients.map((client) => (
        <div
          key={client.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
          onClick={() => handleEditClient(client.id)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {client.logoUrl ? (
                    <img src={client.logoUrl} alt={client.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-500" size={20} />
                  )}
                </div>
                <div className="ml-3 text-sm font-medium text-gray-900">{client.title}</div>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {client.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-gray-700 mb-3 line-clamp-2">{client.description}</div>
            <div className="text-sm text-blue-600 mb-3">
              <a href={client.url} target="_blank" rel="noopener noreferrer">{client.url}</a>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => toggleClientSelection(client.id)}
                />
                <span className="text-xs text-gray-500">Select</span>
              </div>
              <div className="flex space-x-3">
                <button
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={(e) => { e.stopPropagation(); handleEditClient(client.id); }}
                >
                  <PencilLine size={16} />
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(client.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">No clients found matching your search criteria.</div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => router.push('/clients/create')}
              >
                Add New Client
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
