'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  Menu,
  BookCopy,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function TestimonialCreatePage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [formData, setFormData] = useState({
    name_en: '',
    position_en: '',
    company_en: '',
    content_en: '',
    name_ar: '',
    position_ar: '',
    company_ar: '',
    content_ar: '',
    status: 'draft',
    logoUrl: '',
    coverImageUrl: '',
  });

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Simulate upload (replace with real upload API)
      const fakeUrl = URL.createObjectURL(file); // Replace with actual uploaded URL
      setFormData((prev) => ({ ...prev, [field]: fakeUrl }));

      toast.success(`${field === 'logoUrl' ? 'Logo' : 'Avatar'} uploaded`);
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    }
  };

  const handleImageRemove = (field: 'logoUrl' | 'coverImageUrl') => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('accessToken');

      const res = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create testimonial');
      toast.success('Testimonial created successfully ✅');
      router.push('/testimonials');
    } catch (err) {
      toast.error('Something went wrong ❌');
      console.error(err);
    }
  };

  const handleCancel = () => router.push('/testimonials');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              <Link href="/testimonials" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
                <BookCopy size={22} className="mr-2" />
                Create New Testimonial
              </h1>
            </div>
            <div className="hidden md:flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex gap-6">
                {['published', 'draft'].map((status) => (
                  <label key={status} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        formData.status === status ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {formData.status === status && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* English / Arabic Inputs */}
            {['en', 'ar'].map((lang) => (
              <div key={lang} className="bg-white p-6 rounded-xl border">
                <h2 className="text-lg font-medium mb-4">{lang === 'en' ? 'English' : 'Arabic'} Content</h2>
                <div className="space-y-4">
                  <input
                    name={`name_${lang}`}
                    value={formData[`name_${lang}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder={`Name (${lang})`}
                    required
                  />
                  <input
                    name={`position_${lang}`}
                    value={formData[`position_${lang}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder={`Position (${lang})`}
                    required
                  />
                  <input
                    name={`company_${lang}`}
                    value={formData[`company_${lang}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder={`Company (${lang})`}
                    required
                  />
                  <textarea
                    name={`content_${lang}`}
                    value={formData[`content_${lang}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder={`Content (${lang})`}
                    required
                    rows={4}
                  />
                </div>
              </div>
            ))}

            {/* Logo Upload */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-medium mb-4">Company Logo</h2>
              <div className="relative bg-gray-50 border rounded-lg p-4 text-center">
                {formData.logoUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        />
                      </label>
                      <button
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                        onClick={() => handleImageRemove('logoUrl')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Drag & drop your logo here, or click to browse
                    </p>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-medium mb-4">Person Avatar</h2>
              <div className="relative bg-gray-50 border rounded-lg p-4 text-center">
                {formData.coverImageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.coverImageUrl}
                      alt="Avatar"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                        />
                      </label>
                      <button
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                        onClick={() => handleImageRemove('coverImageUrl')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">
                      Drag & drop avatar here, or click to browse
                    </p>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      Upload Avatar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
