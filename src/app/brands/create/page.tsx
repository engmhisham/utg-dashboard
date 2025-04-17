'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Box,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function BrandCreatePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const UPLOAD_BASE = process.env.NEXT_PUBLIC_UPLOAD_BASE || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    logo: '',
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get('accessToken');
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadForm,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const fullUrl = `${UPLOAD_BASE}${data.data.url}`;
      setFormData((prev) => ({ ...prev, logo: fullUrl }));
      toast.success('Logo uploaded ✅');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Logo upload failed ❌');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get('accessToken');

    const payload = {
      status: formData.status,
      name_en: formData.title,
      name_ar: formData.title,
      description_en: formData.description,
      description_ar: formData.description,
      logoUrl: formData.logo,
    };

    try {
      const res = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Brand creation failed');

      toast.success('Brand created successfully ✅');
      router.push('/brands');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong ❌');
    }
  };

  const handleCancel = () => router.push('/brands');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6">
            {isMobile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                  <Box size={22} className="mr-2" />
                  Create New Brand
                </h1>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/brands" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Box size={22} className="mr-2" />
                    Create New Brand
                  </h1>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center space-x-4">
                {['active', 'inactive'].map((status) => (
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
                        formData.status === status ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {formData.status === status && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="ml-2 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Logo</h2>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400">Logo</span>
                  </div>
                  <p className="text-gray-500 mb-4 text-center">Upload a brand logo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logoUpload"
                  />
                  <label
                    htmlFor="logoUpload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Upload Logo
                  </label>
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo preview" className="mt-4 w-24 h-24 object-contain" />
                  )}
                </div>
              </div>
            </div>

            {/* Brand Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Brand Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
