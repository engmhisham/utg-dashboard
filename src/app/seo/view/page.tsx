'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
  Chrome,
  UserRoundCog,
  FileText,
  LucideEye,
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function SEOViewPage() {
  const pathname = usePathname();

  const [seoSettings, setSeoSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ───────────── Detect mobile ───────────── */
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  /* ───────────── Fetch data ───────────── */
  useEffect(() => {
    (async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/seo-general?language=en`);
        if (!res.ok) throw new Error('Cannot fetch');
        const json = await res.json();
        // API might wrap payload in `data`
        setSeoSettings(json.data ?? json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar (always visible) */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky header (always visible) */}
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
                  <Link href="/" className="p-1">
                    <ChevronLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium ml-2 flex items-center">
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

        {/* Tabs + main content */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          {/* Tabs bar (always visible) */}
          <div className="md:flex md:flex-col lg:flex-row justify-between mb-6 border-b border-gray-200 gap-4">
            <div className="flex space-x-6">
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
                href="/seo/view"
                className={`px-1 py-2 border-b-2 font-medium flex items-center ${
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
          </div>

          {/* Content area */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Tag Manager */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-2">Google Tag Manager</h2>
                <p className="text-gray-500 text-sm mb-1">GTM Container ID</p>
                <p className="text-gray-700 font-medium">
                  {seoSettings.gtmId || '-'}
                </p>
              </div>

              {/* Pixels */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-4">Pixels</h2>
                <div className="mb-4">
                  <p className="text-gray-500 text-sm mb-1">
                    Meta Pixel ID (Facebook):
                  </p>
                  <p className="text-gray-700">
                    {seoSettings.facebookPixelId || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Google Analytics ID:
                  </p>
                  <p className="text-gray-700">
                    {seoSettings.googleAnalyticsId || '-'}
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-4">Social Media Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Facebook</p>
                    <p className="text-gray-700">
                      {seoSettings.facebookUrl || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Twitter</p>
                    <p className="text-gray-700">
                      {seoSettings.twitterUrl || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Instagram</p>
                    <p className="text-gray-700">
                      {seoSettings.instagramUrl || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">LinkedIn</p>
                    <p className="text-gray-700">
                      {seoSettings.linkedinUrl || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">YouTube</p>
                    <p className="text-gray-700">
                      {seoSettings.youtubeUrl || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Scripts */}
              {(seoSettings.customHeadScripts ||
                seoSettings.customBodyScripts) && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-medium mb-4">Custom Scripts</h2>
                  {seoSettings.customHeadScripts && (
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm mb-1">
                        Custom Head Scripts
                      </p>
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                        {seoSettings.customHeadScripts}
                      </pre>
                    </div>
                  )}
                  {seoSettings.customBodyScripts && (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        Custom Body Scripts
                      </p>
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                        {seoSettings.customBodyScripts}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
