'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../../../../../components/Sidebar';
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
} from 'lucide-react';

export default function EditPageSeo() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const pageId = params.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // form state
  const [pageUrl, setPageUrl] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [title, setTitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // submission & loading
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null|'success'|'error'>(null);

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // fetch existing data
  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${base}/page-seo/${pageId}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        // Assuming data is: { id, pageUrl, language, title, metaTitle, metaDescription, … }
        setPageUrl(data.data.pageUrl);
        setLanguage(data.data.language);
        setTitle(data.data.title);
        setMetaTitle(data.data.metaTitle);
        setMetaDescription(data.data.metaDescription);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [pageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = Cookies.get('accessToken');
      const base = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${base}/page-seo/${pageId}`, {
        method: 'PATCH',
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
      if (!res.ok) throw new Error('Update failed');
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        router.push('/seo/pages');
      }, 1000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky header */}
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
                    Edit Page
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
                    Edit Page
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
              <FileText size={22} className="mr-2" />
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

          {/* Edit form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  ? 'Page updated successfully!'
                  : 'Error updating page.'}
              </div>
            )}

            {/* Page URL */}
            <div>
              <label htmlFor="pageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Page URL
              </label>
              <input
                id="pageUrl"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/seo/pages')}
                className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
