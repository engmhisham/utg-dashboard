'use client';
import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  InfoIcon
} from 'lucide-react';
import Link from 'next/link';

export default function SEOGeneralPage() {
  // Get current pathname
  const pathname = usePathname();
  
  // State for form inputs
  const [gtmId, setGtmId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [linkedinPixelId, setLinkedinPixelId] = useState('');
  
  // State for toggles
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(false);
  const [linkedinPixelEnabled, setLinkedinPixelEnabled] = useState(false);
  const [metaTrackingEnabled, setMetaTrackingEnabled] = useState(false);
  const [linkedinTrackingEnabled, setLinkedinTrackingEnabled] = useState(false);

  // New state for social media links
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  
  // State for form validation and submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Check if GTM ID follows format GTM-XXXXXX
      const gtmRegex = /^GTM-[A-Z0-9]{1,7}$/;
      
      if (gtmId && !gtmRegex.test(gtmId)) {
        setSaveStatus('error');
        setIsSubmitting(false);
        return;
      }
      
      // Here you can also add API logic to update social links dynamically.
      // For now, we simulate success.
      setSaveStatus('success');
      setIsSubmitting(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1000);
  };

  // Function to reset form
  const handleReset = () => {
    setGtmId('');
    setMetaPixelId('');
    setLinkedinPixelId('');
    setMetaPixelEnabled(false);
    setLinkedinPixelEnabled(false);
    setMetaTrackingEnabled(false);
    setLinkedinTrackingEnabled(false);
    // Reset social media links
    setFacebookUrl('');
    setLinkedinUrl('');
    setInstagramUrl('');
    setSaveStatus(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Include the Sidebar */}
      <Sidebar />
      
      {/* Main content with its own scrollable area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold">SEO Settings</h1>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-6">
              <Link 
                href="/seo/general" 
                className={`px-1 py-2 border-b-2 font-medium ${
                  pathname === '/seo/general' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                General
              </Link>
              <Link 
                href="/seo/pages" 
                className={`px-1 py-2 border-b-2 font-medium ${
                  pathname === '/seo/pages' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pages
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Save Status Message */}
            {saveStatus && (
              <div className={`mb-4 p-3 rounded-xl flex items-center ${
                saveStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {saveStatus === 'success' 
                  ? <CheckCircle size={16} className="mr-2" /> 
                  : <AlertCircle size={16} className="mr-2" />
                }
                {saveStatus === 'success' 
                  ? 'Settings saved successfully!' 
                  : 'There was an error saving your settings. Please check the form and try again.'
                }
              </div>
            )}

            {/* Google Tag Manager Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Google Tag Manager</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Enter your Google Tag Manager container ID to enable tracking on your website.
              </p>
              <div className="mb-4">
                <label htmlFor="gtmId" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <InfoIcon size={16} className="text-gray-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Format: GTM-XXXXXXX
                </p>
              </div>
            </div>

            {/* Pixels Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Pixels</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Configure tracking pixels for different platforms.
              </p>
              
              {/* Meta Pixel */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="metaPixelId" className="block text-sm font-medium text-gray-700">
                    Meta Pixel
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="metaPixelToggle" 
                      checked={metaPixelEnabled}
                      onChange={() => setMetaPixelEnabled(!metaPixelEnabled)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="metaPixelToggle" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${metaPixelEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>
                <input
                  type="text"
                  id="metaPixelId"
                  placeholder="Meta Pixel ID"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!metaPixelEnabled && 'bg-gray-100 text-gray-500'}`}
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  disabled={!metaPixelEnabled}
                />
              </div>
              
              {/* LinkedIn Pixel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="linkedinPixelId" className="block text-sm font-medium text-gray-700">
                    LinkedIn Insight Tag
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="linkedinPixelToggle" 
                      checked={linkedinPixelEnabled}
                      onChange={() => setLinkedinPixelEnabled(!linkedinPixelEnabled)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="linkedinPixelToggle" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${linkedinPixelEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>
                <input
                  type="text"
                  id="linkedinPixelId"
                  placeholder="LinkedIn Insight Tag ID"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!linkedinPixelEnabled && 'bg-gray-100 text-gray-500'}`}
                  value={linkedinPixelId}
                  onChange={(e) => setLinkedinPixelId(e.target.value)}
                  disabled={!linkedinPixelEnabled}
                />
              </div>
            </div>

            {/* Tracking Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Tracking</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Configure additional tracking options and preferences.
              </p>
              
              {/* Meta Tracking */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Meta Tracking</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable advanced Meta tracking features.
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="metaTrackingToggle" 
                    checked={metaTrackingEnabled}
                    onChange={() => setMetaTrackingEnabled(!metaTrackingEnabled)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="metaTrackingToggle" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${metaTrackingEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              {/* LinkedIn Tracking */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">LinkedIn Tracking</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable advanced LinkedIn tracking features.
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="linkedinTrackingToggle" 
                    checked={linkedinTrackingEnabled}
                    onChange={() => setLinkedinTrackingEnabled(!linkedinTrackingEnabled)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="linkedinTrackingToggle" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${linkedinTrackingEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Social Media Links</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Add links to your social media profiles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook */}
                <div>
                  <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-1">
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
                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
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
                {/* Instagram */}
                <div>
                  <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
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
          </form>
        </div>
      </main>
    </div>
  );
}
