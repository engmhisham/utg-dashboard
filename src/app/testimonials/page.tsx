'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronDown,
  Check,
  Star,
  Filter,
  Users,
  Trash2,
  PencilLine,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

// Sample testimonial data
const sampleTestimonials = [
  { 
    id: '1', 
    title: 'Mohamed Ibrahim',
    subTitle: 'Catcher CEO',
    content: 'Partnering with Modn has allowed us to engage with our customers faster and facilitate contact among our team members across multiple offices. With a single network, we can now access our resources from anywhere while maintaining the highest level of security.',
    status: 'published',
    company: 'Catcher',
    avatar: '/avatars/person1.jpg',
    logo: '/logos/catcher-logo.svg',
    date: '2025-03-15'
  },
  // Other testimonials data remains the same
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
    content: 'We\'ve seen a significant increase in productivity since implementing this solution. Our team is more collaborative and efficient than ever before.',
    status: 'draft',
    company: 'Quantum Innovations',
    avatar: '/avatars/person5.jpg',
    logo: '/logos/quantum-logo.svg',
    date: '2025-02-15'
  }
];

export default function TestimonialsPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  
  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Toggle testimonial selection
  const toggleTestimonialSelection = (id: string) => {
    if (selectedTestimonials.includes(id)) {
      setSelectedTestimonials(selectedTestimonials.filter(testimonialId => testimonialId !== id));
    } else {
      setSelectedTestimonials([...selectedTestimonials, id]);
    }
  };
  
  // Select all testimonials
  const toggleSelectAll = () => {
    if (selectedTestimonials.length === filteredTestimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filteredTestimonials.map(testimonial => testimonial.id));
    }
  };
  
  // Handle edit testimonial
  const handleEditTestimonial = (id: string) => {
    router.push(`/testimonials/edit/${id}`);
  };
  
  // Filter testimonials based on search and status
  const filteredTestimonials = sampleTestimonials.filter(testimonial => {
    // Apply search filter
    const matchesSearch = 
      testimonial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'published' && testimonial.status === 'published') ||
      (statusFilter === 'draft' && testimonial.status === 'draft');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* The sidebar component already has its own toggle and mobile functionality */}
      <Sidebar />
      
      {/* Main content - with 0 margin on mobile, auto margin on desktop to fill available space */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header without duplicate toggle button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold">Testimonials</h1>
            </div>
            <button 
              onClick={() => router.push('/testimonials/create')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Testimonial
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="relative flex-1 md:flex-initial">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 w-full border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials list - Desktop view */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Person
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTestimonials.map((testimonial) => (
                    <tr 
                      key={testimonial.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEditTestimonial(testimonial.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => {
                        e.stopPropagation();
                        toggleTestimonialSelection(testimonial.id);
                      }}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={selectedTestimonials.includes(testimonial.id)}
                            onChange={() => {}}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {testimonial.avatar ? (
                              <img src={testimonial.avatar} alt={testimonial.title} className="h-full w-full object-cover" />
                            ) : (
                              <Users className="text-gray-500" size={20} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{testimonial.title}</div>
                            <div className="text-sm text-gray-500">{testimonial.subTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{testimonial.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          testimonial.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {testimonial.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(testimonial.date).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTestimonial(testimonial.id);
                            }}
                          >
                            <PencilLine size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Testimonials list - Mobile view */}
          <div className="md:hidden space-y-4">
            {filteredTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                onClick={() => handleEditTestimonial(testimonial.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {testimonial.avatar ? (
                          <img src={testimonial.avatar} alt={testimonial.title} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="text-gray-500" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{testimonial.title}</div>
                        <div className="text-sm text-gray-500">{testimonial.subTitle}</div>
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      testimonial.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {testimonial.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Company:</strong> {testimonial.company}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Date:</strong> {new Date(testimonial.date).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {testimonial.content}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                        checked={selectedTestimonials.includes(testimonial.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleTestimonialSelection(testimonial.id);
                        }}
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTestimonial(testimonial.id);
                        }}
                      >
                        <PencilLine size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          {filteredTestimonials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">
                No testimonials found matching your search criteria.
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => router.push('/testimonials/create')}
              >
                Add New Testimonial
              </button>
            </div>
          )}
            
          {filteredTestimonials.length > 0 && (
            <div className="bg-white mt-4 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 rounded-b-xl sm:px-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTestimonials.length}</span> of{' '}
                <span className="font-medium">{sampleTestimonials.length}</span> testimonials
              </div>
              <div className="flex gap-2">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}