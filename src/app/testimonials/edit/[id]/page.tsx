'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  BookCopy,
  Menu,
  PencilLine,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

const sampleTestimonials = [
  { 
    id: '1', 
    title: 'Mohamed Ibrahim',
    subTitle: 'Catcher CEO',
    content: 'Partnering with Modn has allowed us to engage with our customers faster and facilitate contact among our team members. With a single network, we can now access our resources from anywhere while maintaining the highest level of security.',
    status: 'published',
    company: 'Catcher',
    avatar: '/avatars/person1.jpg',
    logo: '/logos/catcher-logo.svg',
    date: '2025-03-15'
  },
  { 
    id: '2', 
    title: 'Sarah Johnson',
    subTitle: 'TechnoVate CTO',
    content: 'The implementation process was incredibly smooth. The technical team provided exceptional support and ensured we were up and running in record time.',
    status: 'published',
    company: 'TechnoVate',
    avatar: '/avatars/person2.jpg',
    logo: '/logos/technovate-logo.svg',
    date: '2025-03-10'
  },
  { 
    id: '3', 
    title: 'David Martinez',
    subTitle: 'GlobalCorp Marketing Director',
    content: 'The analytics platform has transformed how we approach our marketing campaigns. The insights we now have access to are invaluable.',
    status: 'published',
    company: 'GlobalCorp',
    avatar: '/avatars/person3.jpg',
    logo: '/logos/globalcorp-logo.svg',
    date: '2025-02-28'
  },
  { 
    id: '4', 
    title: 'Emily Chen',
    subTitle: 'Nexus Solutions COO',
    content: 'Their customer service is second to none. Any issues we encountered were resolved promptly and professionally.',
    status: 'draft',
    company: 'Nexus Solutions',
    avatar: '/avatars/person4.jpg',
    logo: '/logos/nexus-logo.svg',
    date: '2025-02-20'
  },
  { 
    id: '5', 
    title: 'Michael Rodriguez',
    subTitle: 'Quantum Innovations CEO',
    content: "We've seen a significant increase in productivity since implementing this solution. Our team is more collaborative and efficient than ever before.",
    status: 'draft',
    company: 'Quantum Innovations',
    avatar: '/avatars/person5.jpg',
    logo: '/logos/quantum-logo.svg',
    date: '2025-02-15'
  }
];

export default function TestimonialEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Find testimonial by id or fallback
  const testimonial = sampleTestimonials.find(t => t.id === params.id) || sampleTestimonials[0];
  
  // Form state for testimonial details
  const [formData, setFormData] = useState({
    title: testimonial.title,
    subTitle: testimonial.subTitle,
    content: testimonial.content,
    status: testimonial.status,
    company: testimonial.company,
    avatar: testimonial.avatar,
    logo: testimonial.logo
  });

  // Mobile and sidebar toggle state
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    router.push('/testimonials');
  };

  const handleCancel = () => {
    router.push('/testimonials');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto relative">
        {/* Full-width Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
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
                <Link href="/testimonials" className="p-1">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium ml-2 flex items-center">
                <BookCopy size={22} className="mr-2" />
                  Editing Testimonial</h1>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/testimonials" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <BookCopy size={22} className="mr-2" />
                    Editing Testimonial
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
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.status === 'published'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.status === 'published' && <Check size={12} className="text-white" />}
                  </div>
                  <span className="ml-2">Published</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.status === 'draft'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.status === 'draft' && <Check size={12} className="text-white" />}
                  </div>
                  <span className="ml-2">Draft</span>
                </label>
              </div>
            </div>

            {/* Translations Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Translations <span className="text-blue-500">*</span></h2>
              <div className="relative">
                <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center">
                    <span className="font-medium">en-US</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Logo <span className="text-gray-400 text-sm ml-1">en-US</span></h2>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {formData.logo ? (
                  <div className="relative">
                    <img 
                      src={formData.logo} 
                      alt="Company Logo" 
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
                      {formData.company} Logo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
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

            {/* Content Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Content <span className="text-gray-400 text-sm ml-1">en-US</span></h2>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                rows={6}
                placeholder="Enter testimonial content..."
              ></textarea>
            </div>

            {/* Avatar Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Avatar <span className="text-gray-400 text-sm ml-1">en-US</span></h2>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {formData.avatar ? (
                  <div className="relative">
                    <img 
                      src={formData.avatar} 
                      alt="Person Avatar" 
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
                      Person
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">Drag &amp; drop the person's photo here, or click to browse</p>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Upload Avatar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title and Subtitle Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Person Info <span className="text-gray-400 text-sm ml-1">en-US</span></h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter person's name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subTitle"
                    value={formData.subTitle}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter person's position"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Submit Buttons */}
            <div className="md:hidden">
              <div className="fixed p-4 bg-white border-t border-gray-200 bottom-0 ml-0 w-full" style={{ left: 0, width: 'inherit', right: 0 }}>
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
