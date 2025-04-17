'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, Upload, X, Image as ImageIcon, UsersRound, Menu
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function TeamCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    status: 'active',
    cover: ''
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get('accessToken');
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm
      });

      const data = await res.json();
      const uploadedUrl = `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}`;
      setFormData(prev => ({ ...prev, cover: uploadedUrl }));
      toast.success('Image uploaded ✅');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image ❌');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('accessToken');

    const payload = {
      status: formData.status,
      name_en: formData.name,
      title_en: formData.title,
      name_ar: formData.name,
      title_ar: formData.title,
      coverImageUrl: formData.cover,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create team member');

      toast.success('Team member created successfully ✅');
      router.push('/team');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Creation failed ❌');
    }
  };

  const handleCancel = () => router.push('/team');

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
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/team" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                  <UsersRound size={22} className="mr-2" />
                  Create New Team Member
                </h1>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/team" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <UsersRound size={22} className="mr-2" />
                    Create New Team Member
                  </h1>
                </div>
                <div className="flex space-x-3">
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
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Status */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex gap-4">
                {['active', 'inactive'].map((status) => (
                  <label key={status} className="flex items-center cursor-pointer">
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
                      {formData.status === status && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Cover Image</h2>
              <div className="flex flex-col items-center justify-center border rounded-lg p-6 bg-gray-50">
                {formData.cover ? (
                  <img src={formData.cover} className="w-24 h-24 object-cover rounded-full mb-4" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="coverUpload" />
                <label
                  htmlFor="coverUpload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Upload Cover
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Team Member Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter job title"
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
