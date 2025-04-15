'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check,
  X,
  Upload,
  Image,
  ChevronDown,
  Box,
  Trash2,
  PencilLine,
  MoreHorizontal,
  Menu,
  RefreshCw,
  Trash
} from 'lucide-react';
import Link from 'next/link';
  

// Sample brands data – normally from an API or database
const sampleBrands = [
  { 
    id: '1', 
    title: 'TechNova',
    description: 'Leading technology solutions provider',
    status: 'active',
    logo: '/logos/technova-logo.svg',
    date: '2025-03-15'
  },
  { 
    id: '2', 
    title: 'EcoSmart',
    description: 'Sustainable product innovations',
    status: 'active',
    logo: '/logos/ecosmart-logo.svg',
    date: '2025-03-10'
  },
  { 
    id: '3', 
    title: 'UrbanStyle',
    description: 'Contemporary fashion for modern professionals',
    status: 'active',
    logo: '/logos/urbanstyle-logo.svg',
    date: '2025-02-28'
  },
  { 
    id: '4', 
    title: 'NutriLife',
    description: 'Health and wellness products',
    status: 'inactive',
    logo: '/logos/nutrilife-logo.svg',
    date: '2025-02-20'
  },
  { 
    id: '5', 
    title: 'SkyConnect',
    description: 'Telecommunications and connectivity solutions',
    status: 'inactive',
    logo: '/logos/skyconnect-logo.svg',
    date: '2025-02-15'
  }
];

export default function BrandEditPage({ params }: { params: { id: string } }) {
    
  const router = useRouter();
  const pathname = usePathname();
  
  // Find the brand by id (or fallback)
  const brand = sampleBrands.find(b => b.id === params.id) || sampleBrands[0];
  
  // State for form fields
  const [formData, setFormData] = useState({
    title: brand.title,
    description: brand.description,
    status: brand.status,
    logo: brand.logo
  });
  
  // Mobile state and sidebar toggle
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
     
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    router.push('/brands');
  };
  
  const handleCancel = () => {
    router.push('/brands');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto relative">
        {/* Sticky Header */}
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
                <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                <Box size={22} className="mr-2" />
                  Editing Brand</h1>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/brands" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Box size={22} className="mr-2" />
                    Editing Brand
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
        
        {/* Main Content Container */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Status Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Status</h2>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.status === 'active' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.status === 'active' && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="ml-2">Active</span>
                </label>
                
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.status === 'inactive' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.status === 'inactive' && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="ml-2">Inactive</span>
                </label>
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
                    <img 
                      src={formData.logo} 
                      alt="Brand Logo" 
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button 
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <Upload size={16} className="text-gray-600" />
                      </button>
                      <button 
                        type="button"
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
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
                      <Image size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">Drag &amp; drop your logo here, or click to browse</p>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Upload Logo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Info Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Brand Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand description"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Actions</h2>
              <div className="space-y-4">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 w-full"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset to Original
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 w-full"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this brand?')) {
                      // Delete logic goes here
                      router.push('/brands');
                    }
                  }}
                >
                  <Trash size={16} className="mr-2" />
                  Delete Brand
                </button>
              </div>
            </div>

            {/* Mobile Submit Buttons */}
            <div className="md:hidden">
              <div className="fixed p-4 bg-white border-t border-gray-200 bottom-0 left-0 w-full">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
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
