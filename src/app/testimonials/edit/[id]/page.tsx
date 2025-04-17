'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Menu,
  Image as ImageIcon,
  BookCopy,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function TestimonialEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const testimonialId = params.id;

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
  const [loading, setLoading] = useState(true);

  const checkMobile = () => setIsMobile(window.innerWidth < 768);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchTestimonial = async () => {
      const token = Cookies.get('accessToken');
      try {
        const [resEn, resAr] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonialId}?language=en`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonialId}?language=ar`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const enData = await resEn.json();
        const arData = await resAr.json();

        setFormData({
          name_en: enData.data.name || '',
          position_en: enData.data.position || '',
          company_en: enData.data.company || '',
          content_en: enData.data.content || '',
          name_ar: arData.data.name || '',
          position_ar: arData.data.position || '',
          company_ar: arData.data.company || '',
          content_ar: arData.data.content || '',
          status: enData.data.status || 'draft',
          logoUrl: enData.data.logoUrl || '',
          coverImageUrl: enData.data.coverImageUrl || '',
        });
      } catch (error) {
        toast.error('Failed to load testimonial');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [testimonialId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl'
  ) => {
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
        [field]: `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${data.data.url}`,
      }));
    } catch (error) {
      toast.error('File upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      toast.success('Testimonial updated');
      router.push('/testimonials');
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  const handleCancel = () => router.push('/testimonials');

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
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
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                <BookCopy size={22} className="mr-2" />
                Edit Testimonial
              </h1>
            </div>
            <div className="hidden md:flex gap-3">
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center gap-6">
                {['published', 'draft'].map(status => (
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
                      formData.status === status ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {formData.status === status && <Check size={12} className="text-white" />}
                    </div>
                    <span className="ml-2 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Uploads */}
            {(['logoUrl', 'coverImageUrl'] as const).map(field => (
              <div key={field} className="bg-white p-4 rounded-xl border shadow-sm">
                <h2 className="text-lg font-medium mb-4 capitalize">{field === 'logoUrl' ? 'Logo' : 'Cover Image'}</h2>
                <div className="border rounded-lg p-4 bg-gray-50 relative">
                  {formData[field] ? (
                    <div className="relative">
                      <img src={formData[field]} alt="Preview" className="max-w-full h-auto max-h-64 mx-auto" />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <label className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                          <Upload size={16} className="text-gray-600" />
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, field)} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, [field]: '' }))} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                          <X size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4 text-center">Upload an image</p>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                        Upload
                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, field)} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Multilingual Inputs */}
            {['en', 'ar'].map(lang => (
              <div key={lang} className="bg-white p-4 rounded-xl border shadow-sm">
                <h2 className="text-lg font-medium mb-4">Translation ({lang.toUpperCase()})</h2>
                <div className="space-y-4">
                  <input name={`name_${lang}`} value={formData[`name_${lang}` as keyof typeof formData]} onChange={handleInputChange} placeholder="Name" required className="w-full border p-3 rounded-lg" />
                  <input name={`position_${lang}`} value={formData[`position_${lang}` as keyof typeof formData]} onChange={handleInputChange} placeholder="Position" required className="w-full border p-3 rounded-lg" />
                  <input name={`company_${lang}`} value={formData[`company_${lang}` as keyof typeof formData]} onChange={handleInputChange} placeholder="Company" className="w-full border p-3 rounded-lg" />
                  <textarea name={`content_${lang}`} value={formData[`content_${lang}` as keyof typeof formData]} onChange={handleInputChange} placeholder="Content" rows={4} required className="w-full border p-3 rounded-lg" />
                </div>
              </div>
            ))}

            {/* Mobile Buttons */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
              <button type="button" onClick={handleCancel} className="flex-1 border border-gray-300 rounded-xl px-4 py-2">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl px-4 py-2">Save</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
