'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Trash,
  UsersRound,
  Menu,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function ClientEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const clientId = params.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    logo: '',
    url: '',
  });

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobile check
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      const token = Cookies.get('accessToken');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch client');

        const data = await res.json();
        const client = data.data;

        setFormData({
          title: client.title,
          description: client.description,
          status: client.status,
          logo: client.logoUrl,
          url: client.url,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('accessToken');

    const payload = {
      title_en: formData.title,
      description_en: formData.description,
      url_en: formData.url,
      title_ar: formData.title,
      description_ar: formData.description,
      url_ar: formData.url,
      status: formData.status,
      logoUrl: formData.logo,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update client');

      toast.success('Client updated successfully ✅');
      router.push('/clients');
    } catch (err) {
      console.error(err);
      toast.error('Update failed ❌');
    }
  };

  const handleCancel = () => router.push('/clients');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get('accessToken');
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      });

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        logo: `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}`,
      }));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload logo');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading client data...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6">
            {isMobile ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-full bg-white shadow-md border border-gray-200">
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/clients" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                  <UsersRound size={22} className="mr-2" />
                  Edit Client
                </h1>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/clients" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <UsersRound size={22} className="mr-2" />
                    Edit Client
                  </h1>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Status Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center space-x-4">
                {['active', 'inactive'].map(status => (
                  <label key={status} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData.status === status ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {formData.status === status && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="ml-2 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Logo</h2>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {formData.logo ? (
                  <div className="relative">
                    <img src={formData.logo} alt="Client Logo" className="max-w-full h-auto max-h-64 mx-auto" />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                        <Upload size={16} className="text-gray-600" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, logo: '' }))} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-2 py-1 rounded text-sm">
                      {formData.title} Logo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">Upload a logo</p>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Client Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mobile Submit Buttons */}
            <div className="md:hidden">
              <div className="fixed p-4 bg-white border-t border-gray-200 bottom-0 left-0 w-full">
                <div className="flex space-x-3">
                  <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
