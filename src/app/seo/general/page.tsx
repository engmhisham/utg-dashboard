'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '../../../components/Sidebar';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  InfoIcon,
  FileText,
  Chrome,
  UserRoundCog,
  Menu,
  X,
  LucideEye,
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function SEOGeneralPage() {
  const pathname = usePathname();

  /* ───────────────────────── State ───────────────────────── */

  // Form input states
  const [gtmId, setGtmId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [linkedinPixelId, setLinkedinPixelId] = useState('');

  // Toggle states
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(false);
  const [linkedinPixelEnabled, setLinkedinPixelEnabled] = useState(false);
  const [metaTrackingEnabled, setMetaTrackingEnabled] = useState(false);
  const [linkedinTrackingEnabled, setLinkedinTrackingEnabled] = useState(false);

  // Social links
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Submission + loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Layout
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ──────────────────────── Effects ──────────────────────── */

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch existing settings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/seo-general?language=en`,
        );
        if (!res.ok) throw new Error('Failed to fetch SEO settings');
        const data = await res.json();

        setGtmId(data.gtmId || '');

        if (data.facebookPixelId) {
          setMetaPixelId(data.facebookPixelId);
          setMetaPixelEnabled(true);
        }
        if (data.googleAnalyticsId) {
          setLinkedinPixelId(data.googleAnalyticsId);
          setLinkedinPixelEnabled(true);
        }

        setFacebookUrl(data.facebookUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setInstagramUrl(data.instagramUrl || '');
        setTwitterUrl(data.twitterUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ─────────────────────── Handlers ──────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // ignore submit while loading
    setIsSubmitting(true);

    const gtmRegex = /^GTM-[A-Z0-9]{1,7}$/;
    if (gtmId && !gtmRegex.test(gtmId)) {
      setSaveStatus('error');
      setIsSubmitting(false);
      return;
    }

    const token = Cookies.get('accessToken');

    const payload = {
      gtmId,
      facebookPixelId: metaPixelEnabled ? metaPixelId : '',
      googleAnalyticsId: linkedinPixelEnabled ? linkedinPixelId : '',
      facebookUrl,
      instagramUrl,
      linkedinUrl,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seo-general?language=en`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error('Failed to update settings');
      await res.json();
      setSaveStatus('success');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    setGtmId('');
    setMetaPixelId('');
    setLinkedinPixelId('');
    setMetaPixelEnabled(false);
    setLinkedinPixelEnabled(false);
    setMetaTrackingEnabled(false);
    setLinkedinTrackingEnabled(false);
    setFacebookUrl('');
    setLinkedinUrl('');
    setInstagramUrl('');
    setTwitterUrl('');
    setYoutubeUrl('');
    setSaveStatus(null);
  };

  /* ──────────────────────── Render ───────────────────────── */

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar always visible */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header always visible */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-4 md:p-7">
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
                    <ArrowLeft size={20} />
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

        {/* Tabs always visible */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-6">
              <Link
                href="/seo/general"
                className={`px-1 py-2 border-b-2 font-medium flex items-center ${
                  pathname === '/seo/general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserRoundCog size={20} className="mr-2" />
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
                <FileText size={20} className="mr-2" />
                Pages
              </Link>
            </div>
          </div>

          {/* ─────────────── Form OR Spinner ─────────────── */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Google Tag Manager */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4">Google Tag Manager</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Enter your Google Tag Manager container ID to enable tracking
                  on your website.
                </p>
                <div>
                  <label
                    htmlFor="gtmId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    GTM Container ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="gtmId"
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={gtmId}
                      onChange={(e) => setGtmId(e.target.value)}
                    />
                    <InfoIcon
                      size={16}
                      className="absolute inset-y-0 right-3 my-auto text-gray-400 pointer-events-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: GTM-XXXXXXX
                  </p>
                </div>
              </section>

              {/* Pixels */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4">Pixels</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Configure tracking pixels for different platforms.
                </p>

                {/* Meta Pixel */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="metaPixelId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Meta Pixel
                    </label>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input
                        type="checkbox"
                        id="metaPixelToggle"
                        checked={metaPixelEnabled}
                        onChange={() => setMetaPixelEnabled(!metaPixelEnabled)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="metaPixelToggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                          metaPixelEnabled ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    id="metaPixelId"
                    placeholder="Meta Pixel ID"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !metaPixelEnabled && 'bg-gray-100 text-gray-500'
                    }`}
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    disabled={!metaPixelEnabled}
                  />
                </div>

                {/* LinkedIn Pixel */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="linkedinPixelId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      LinkedIn Insight Tag
                    </label>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input
                        type="checkbox"
                        id="linkedinPixelToggle"
                        checked={linkedinPixelEnabled}
                        onChange={() =>
                          setLinkedinPixelEnabled(!linkedinPixelEnabled)
                        }
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="linkedinPixelToggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                          linkedinPixelEnabled ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    id="linkedinPixelId"
                    placeholder="LinkedIn Insight Tag ID"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !linkedinPixelEnabled && 'bg-gray-100 text-gray-500'
                    }`}
                    value={linkedinPixelId}
                    onChange={(e) => setLinkedinPixelId(e.target.value)}
                    disabled={!linkedinPixelEnabled}
                  />
                </div>
              </section>

              {/* Tracking */}
              {/* <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4">Tracking</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Configure additional tracking options and preferences.
                </p>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Meta Tracking
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable advanced Meta tracking features.
                    </p>
                  </div>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="metaTrackingToggle"
                      checked={metaTrackingEnabled}
                      onChange={() =>
                        setMetaTrackingEnabled(!metaTrackingEnabled)
                      }
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="metaTrackingToggle"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        metaTrackingEnabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      LinkedIn Tracking
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable advanced LinkedIn tracking features.
                    </p>
                  </div>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="linkedinTrackingToggle"
                      checked={linkedinTrackingEnabled}
                      onChange={() =>
                        setLinkedinTrackingEnabled(!linkedinTrackingEnabled)
                      }
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="linkedinTrackingToggle"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        linkedinTrackingEnabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </section> */}

              {/* Social Links */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4">Social Media Links</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Add links to your social media profiles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="facebookUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebookUrl"
                      placeholder="https://www.facebook.com/your-page"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="linkedinUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedinUrl"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="instagramUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagramUrl"
                      placeholder="https://www.instagram.com/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="youtubeUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Youtube
                    </label>
                    <input
                      type="url"
                      id="youtubeUrl"
                      placeholder="https://www.youtube.com/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="twitterUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      twitter
                    </label>
                    <input
                      type="url"
                      id="twitterUrl"
                      placeholder="https://www.twitter.com/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-between items-center">
                {saveStatus ? (
                  <div
                    className={`p-3 rounded-xl flex items-center ${
                      saveStatus === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {saveStatus === 'success' ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Settings saved successfully!
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="mr-2" />
                        There was an error saving your settings. Please check
                        the form and try again.
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-0" />
                )}


                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center">
                        <RefreshCw size={16} className="mr-2" />
                        Reset
                      </div>
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center">
                        <Save size={16} className="mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Settings'}
                      </div>
                    </button>
                  </div>
              </div>
            </form>
          )}
          {/* ─────────────── End Form / Spinner ─────────────── */}
        </div>
      </main>
    </div>
  );
}
