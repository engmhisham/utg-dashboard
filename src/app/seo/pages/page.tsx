'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash,
  PencilLine,
  Menu,
  ChevronLeft,
  Chrome,
  UserRoundCog,
  X,
  LucideEye,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import LoadingSpinner from '../../../components/LoadingSpinner'; // ⬅️ shared spinner

interface PageSeo {
  id: string;
  pageUrl: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  language: string;
}

export default function SEOPagesPage() {
  const router = useRouter();
  const pathname = usePathname();

  /* ───────────── Layout state ───────────── */
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ───────────── Data state ───────────── */
  const [pages, setPages] = useState<PageSeo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${base}/page-seo?language=en&page=1&limit=100`,
          {
            headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
          },
        );
        if (!res.ok) throw new Error('Failed to fetch pages');
        const json = await res.json();
        setPages(json.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredPages = pages.filter((p) =>
    [p.pageUrl, p.title, p.metaTitle, p.metaDescription]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  /* ───────────── Render ───────────── */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 md:p-7">
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
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-gray-700 mr-2"
                  >
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

        {/* Tabs + content */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          {/* Tabs */}
          <div className="md:flex flex-col md:flex-row justify-between mb-6 border-b border-gray-200 gap-4">
            <div className="flex space-x-6">
              <Link
                href="/seo/general"
                className={`px-1 py-2 border-b-2 flex items-center font-medium ${
                  pathname === '/seo/general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserRoundCog size={22} className="mr-2" />
                General
              </Link>
              <Link
                href="/seo/view"
                className={`px-1 py-2 border-b-2 flex items-center font-medium ${
                  pathname === '/seo/view'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <LucideEye size={22} className="mr-2" />
                View
              </Link>
              <Link
                href="/seo/pages"
                className={`px-1 py-2 border-b-2 flex items-center font-medium ${
                  pathname === '/seo/pages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={22} className="mr-2" />
                Pages
              </Link>
            </div>
          </div>

          {/* ───────────── Content area ───────────── */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <>
              {/* Search + Add */}
              <div className="mb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {/* Search */}
                  <div className="relative w-full md:w-72">
                    <input
                      type="text"
                      placeholder="Search pages…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search
                      size={18}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                  </div>

                  {/* Add button (desktop & tablet) */}
                  <Link
                    href="/seo/pages/new"
                    className="hidden md:w-auto md:flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" /> Add Page
                  </Link>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page URL
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
                    {filteredPages.length ? (
                      filteredPages.map((page) => (
                        <tr
                          key={page.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            router.push(`/seo/pages/${page.id}/edit`)
                          }
                        >
                          <td className="flex gap-3 px-6 py-4 text-sm text-gray-900">
                            <FileText size={16} />
                            {page.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {page.pageUrl}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                            {page.metaTitle}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                            {page.metaDescription}
                          </td>
                          <td className="flex justify-end px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <PencilLine
                              size={16}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            />
                            <Trash
                              size={16}
                              className="text-red-600 hover:text-red-900"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm text-gray-500"
                        >
                          No pages found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredPages.length ? (
                  filteredPages.map((page) => (
                    <div
                      key={page.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/seo/pages/${page.id}/edit`)
                      }
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <FileText
                            size={16}
                            className="text-gray-400 mr-2"
                          />
                          <div className="text-sm font-medium text-gray-900">
                            {page.title}
                          </div>
                        </div>
                        <PencilLine
                          size={16}
                          className="text-indigo-600"
                        />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium uppercase">URL: </span>
                          {page.pageUrl}
                        </div>
                        <div>
                          <span className="font-medium uppercase">Meta: </span>
                          {page.metaTitle}
                        </div>
                        <div className="text-gray-500 line-clamp-2">
                          {page.metaDescription}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow">
                    <p className="text-sm text-gray-500">No pages found.</p>
                  </div>
                )}

                {/* Floating add button */}
                <div className="fixed bottom-4 right-4 z-10">
                  <Link
                    href="/seo/pages/new"
                    className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <Plus size={24} />
                  </Link>
                </div>
              </div>
            </>
          )}
          {/* ───────────── End content area ───────────── */}
        </div>
      </main>
    </div>
  );
}
