'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronDown,
  Box,
  Trash2,
  PencilLine,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function BrandsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [brands, setBrands] = useState([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('language', language);
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        const token = Cookies.get('accessToken');
        const res = await fetch(`${API_BASE_URL}/brands?language=en&sortBy=createdAt&sortOrder=DESC`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBrands(data.data?.items || []);
        setTotalBrands(data.data?.total || 0);
      } catch (err) {
        console.error('Error fetching brands:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [statusFilter, language]);

  // Filter by search (client-side)
  const filteredBrands = brands.filter((brand: any) => {
    const query = searchQuery.toLowerCase();
    return (
      brand.name.toLowerCase().includes(query) ||
      brand.description.toLowerCase().includes(query)
    );
  });

  const toggleBrandSelection = (id: string) => {
    if (selectedBrands.includes(id)) {
      setSelectedBrands(selectedBrands.filter((brandId) => brandId !== id));
    } else {
      setSelectedBrands([...selectedBrands, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBrands.length === filteredBrands.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(filteredBrands.map((b: any) => b.id));
    }
  };

  const handleEditBrand = (id: string) => {
    router.push(`/brands/edit/${id}`);
  };
  const handleDeleteBrand = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this brand?');
    if (!confirmed) return;
  
    const token = Cookies.get('accessToken');
  
    try {
      const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete brand');
      }
  
      // Remove the deleted brand from the list
      setBrands((prev) => prev.filter((b: any) => b.id !== id));
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      alert(error.message || 'Something went wrong while deleting the brand');
    }
  };
  

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
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium ml-2 flex items-center">
                    <Box size={22} className="mr-2" />
                    Brands
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/brands/create')}
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
                    <Box size={22} className="mr-2" />
                    Brands
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/brands/create')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Brand
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <span className="ml-4 text-sm font-medium text-gray-600">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">No brands found.</div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => router.push('/brands/create')}
              >
                Add New Brand
              </button>
            </div>
          ) : (
            <>
              {/* === Desktop Table View === */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600"
                            checked={selectedBrands.length === filteredBrands.length && filteredBrands.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBrands.map((brand: any) => (
                        <tr key={brand.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditBrand(brand.id)}>
                          <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleBrandSelection(brand.id); }}>
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600"
                              checked={selectedBrands.includes(brand.id)}
                              onChange={() => {}}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                {brand.logoUrl ? (
                                  <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Box className="text-gray-500" size={20} />
                                )}
                              </div>
                              <div className="ml-4 text-sm font-medium text-gray-900">{brand.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{brand.description}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <button
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={() => handleEditBrand(brand.id)}
                              >
                                <PencilLine size={16} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteBrand(brand.id)}
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

                  {/* === Mobile Card View === */}
                  <div className="md:hidden space-y-4">
                    {filteredBrands.map((brand: any) => (
                      <div
                        key={brand.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        onClick={() => handleEditBrand(brand.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {brand.logoUrl ? (
                                  <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Box className="text-gray-500" size={20} />
                                )}
                              </div>
                              <div className="ml-3 text-sm font-medium text-gray-900">{brand.name}</div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {brand.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="text-sm text-gray-700 mb-3 line-clamp-2">{brand.description}</div>

                          <div className="text-sm text-gray-500 mb-2">
                            Created: {new Date(brand.createdAt).toLocaleDateString()}
                          </div>

                          <div
                            className="flex justify-between items-center pt-3 border-t border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                                checked={selectedBrands.includes(brand.id)}
                                onChange={() => toggleBrandSelection(brand.id)}
                              />
                              <span className="text-xs text-gray-500">Select</span>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={() => handleEditBrand(brand.id)}
                              >
                                <PencilLine size={16} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteBrand(brand.id)}
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
          )}
        </div>
      </main>
    </div>
  );
}
