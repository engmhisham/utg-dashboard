'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  Trash,
  PencilLine,
  Menu,
  ChevronLeft,
  Chrome,
  UserRoundCog,
  X
} from 'lucide-react';
import Link from 'next/link';

const samplePages = [
  { id: 1, name: 'Home', url: '/', metaTitle: 'Welcome to UTG', metaDescription: 'Your ultimate marketing solution' },
  { id: 2, name: 'About Us', url: '/about', metaTitle: 'About Our Company', metaDescription: 'Learn more about our team and mission' },
  { id: 3, name: 'Services', url: '/services', metaTitle: 'Our Services', metaDescription: 'Discover our range of marketing services' },
  { id: 4, name: 'Blog', url: '/blog', metaTitle: 'Marketing Blog', metaDescription: 'Latest marketing insights and trends' },
  { id: 5, name: 'Contact', url: '/contact', metaTitle: 'Contact Us', metaDescription: 'Get in touch with our experts' },
];

export default function SEOPagesPage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Manage mobile state, search bar toggle, and sidebar state
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const filteredPages = samplePages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.metaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar with required props always passed */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* Full‑width Sticky Header (with its own padding) */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 md:p-6">
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
                  <Link href="/" className="p-1 mr-2">
                    <ChevronLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium flex items-center">
                    <Chrome size={22} className="mr-2" />
                    SEO Settings
                  </h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <Chrome size={22} className="mr-2" />
                    SEO Settings
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Container with horizontal margins */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          {/* Desktop Tabs & Search (only for md and up) */}
          <div className=" md:flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex space-x-6 mb-6">
              <Link 
                href="/seo/general" 
                className={`px-1 py-2 border-b-2 font-medium flex items-center ${
                  pathname === '/seo/general' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserRoundCog size={22} className="mr-2" />
                General
              </Link>
              <Link 
                href="/seo/pages" 
                className={`px-1 py-2 border-b-2 font-medium flex items-center ${
                  pathname === '/seo/pages' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={22} className="mr-2" />
                Pages
              </Link>
            </div>
            {/* <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div> */}
            {/* <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto">
              <Plus size={18} className="mr-2" />
              Add Page
            </button> */}
          </div>

          {/* Mobile Tabs and Search (for mobile views) */}
          {isMobile && (
            <>
              <div className="hidden md:hidden">
                {/* This block is not rendered because it’s handled above */}
              </div>
            </>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{page.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{page.url}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{page.metaTitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{page.metaDescription}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <PencilLine size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      No pages found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <div key={page.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow cursor-pointer" onClick={() => {}}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{page.name}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 p-1">
                        <PencilLine size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">URL</div>
                      <div className="text-sm text-gray-600">{page.url}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Meta Title</div>
                      <div className="text-sm text-gray-900">{page.metaTitle}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Meta Description</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{page.metaDescription}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow">
                <div className="text-sm text-gray-500">
                  No pages found matching your search.
                </div>
              </div>
            )}
            <div className="fixed bottom-4 right-4 z-10">
              <button className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <Plus size={24} />
              </button>
            </div>
          </div>

          {/* Desktop Pagination */}
          {filteredPages.length > 0 && !isMobile && (
            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPages.length}</span> of{' '}
                  <span className="font-medium">{filteredPages.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
