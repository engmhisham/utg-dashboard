// app/seo/pages/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../../../../components/Sidebar';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  Menu,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Chrome,
  FileText,
  UserRoundCog,
  LucideEye,
} from 'lucide-react';

export default function AddPageSeoPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // form state
  const [pageUrl, setPageUrl] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [title, setTitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null|'success'|'error'>(null);

  // detect mobile
  useState(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = Cookies.get('accessToken');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${baseUrl}/page-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageUrl,
          language,
          title,
          metaTitle,
          metaDescription,
        }),
      });

      if (!res.ok) throw new Error('Failed to create page SEO');
      setSaveStatus('success');

      // after a short delay, redirect back to list
      setTimeout(() => router.push('/seo/pages'), 1000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
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
                  <Link href="/seo/pages" className="p-1">
                    <ChevronLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium ml-2 flex items-center">
                    <Chrome size={22} className="mr-2" />
                    Add Page
                  </h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/seo/pages" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <Chrome size={22} className="mr-2" />
                    Add Page
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="flex space-x-6 mb-6 border-b border-gray-200">
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
              General
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* notification */}
            {saveStatus && (
              <div
                className={`p-3 rounded-xl flex items-center ${
                  saveStatus === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {saveStatus === 'success' ? (
                  <CheckCircle size={16} className="mr-2" />
                ) : (
                  <AlertCircle size={16} className="mr-2" />
                )}
                {saveStatus === 'success'
                  ? 'Page created successfully!'
                  : 'Failed to create page. Please try again.'}
              </div>
            )}

            {/* Page URL */}
            <div>
              <label htmlFor="pageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Page URL
              </label>
              <input
                id="pageUrl"
                type="text"
                required
                placeholder="/about"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en'|'ar')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Browser Title
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="About Us"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                id="metaTitle"
                type="text"
                required
                placeholder="About Our Company"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                required
                placeholder="Learn more about our team and mission"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <RefreshCw size={16} className="mr-2" />
                  Cancel
                </div>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
