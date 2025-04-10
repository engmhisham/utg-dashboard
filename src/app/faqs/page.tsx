// app/faqs/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  PencilLine,
  Trash2,
  Filter,
  Menu,
  X,
  MessageCircleQuestion
} from 'lucide-react';
import Link from 'next/link';

// Sample categories for FAQs
const categories = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Account' },
  { id: 3, name: 'Billing' },
  { id: 4, name: 'Technical' },
  { id: 5, name: 'Services' },
];

// Sample FAQ data
const sampleFAQs = [
  { 
    id: 1, 
    question: 'How do I reset my password?', 
    answer: 'To reset your password, click on the "Forgot Password" link on the login page. You will receive an email with instructions to create a new password.', 
    category: 'Account',
    categoryId: 2,
    published: true,
  },
  { 
    id: 2, 
    question: 'What payment methods do you accept?', 
    answer: 'We accept all major credit cards including Visa, Mastercard, and American Express. We also accept PayPal and bank transfers for certain plans.', 
    category: 'Billing',
    categoryId: 3,
    published: true,
  },
  { 
    id: 3, 
    question: 'How can I cancel my subscription?', 
    answer: 'You can cancel your subscription at any time by going to your Account Settings and clicking on "Subscriptions". Select the subscription you want to cancel and follow the prompts.', 
    category: 'Billing',
    categoryId: 3,
    published: true,
  },
  { 
    id: 4, 
    question: 'Is there a free trial available?', 
    answer: 'Yes, we offer a 14-day free trial for all our paid plans. No credit card is required to start your trial.', 
    category: 'General',
    categoryId: 1,
    published: true,
  },
  { 
    id: 5, 
    question: 'What browsers are supported?', 
    answer: 'Our platform supports the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.', 
    category: 'Technical',
    categoryId: 4,
    published: true,
  },
  { 
    id: 6, 
    question: 'How do I export my data?', 
    answer: 'To export your data, go to Account Settings > Data Management > Export. You can choose to export in CSV or Excel format.', 
    category: 'Technical',
    categoryId: 4,
    published: true,
  },
  { 
    id: 7, 
    question: 'Can I upgrade or downgrade my plan?', 
    answer: 'Yes, you can change your plan at any time. Go to Account Settings > Subscriptions and select "Change Plan". Any payment adjustments will be prorated for the remainder of your billing cycle.', 
    category: 'Billing',
    categoryId: 3,
    published: false,
  },
];

export default function FAQsPage() {
  // Get current pathname
  const pathname = usePathname();
  
  // State for search query and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  
  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Toggle FAQ expansion
  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };
  
  // Filtered FAQs based on search and category
  const filteredFAQs = sampleFAQs.filter(faq => {
    // Apply search filter
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply category filter
    const matchesCategory = selectedCategory === null || faq.categoryId === selectedCategory;
    
    // Apply published filter
    const matchesPublished = !showPublishedOnly || faq.published;
    
    return matchesSearch && matchesCategory && matchesPublished;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Define animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-10">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center">
                <Link href="/" className="p-1 mr-2">
                  <ChevronLeft size={20} />
                </Link>
                <h1 className="text-xl font-medium">FAQs</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowMobileFilter(!showMobileFilter)} 
                  className={`p-1 rounded-full ${showMobileFilter ? 'bg-blue-100 text-blue-600' : ''}`}
                >
                  <Filter size={18} />
                </button>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowMobileFilter(true);
                  }} 
                  className="p-1"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
            
            {/* Mobile Search Bar - Show when toggled */}
            {showMobileFilter && (
              <div className="p-3 bg-white border-b border-gray-200 animate-fade-in">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchQuery('')}
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Category filters */}
                <div className="flex space-x-2 overflow-x-auto py-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      selectedCategory === null 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                        selectedCategory === category.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                
                {/* Published filter toggle */}
                <div className="flex items-center mt-2">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={showPublishedOnly}
                        onChange={() => setShowPublishedOnly(!showPublishedOnly)}
                      />
                      <div className={`w-10 h-5 ${showPublishedOnly ? 'bg-blue-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
                      <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showPublishedOnly ? 'translate-x-5' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm">Published only</div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 md:p-6 flex-1 flex flex-col">
          {/* Desktop Header - Hide on mobile */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
              <MessageCircleQuestion size={22} className="mr-2" />
                Frequently Asked Questions</h1>
            </div>
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Plus size={18} className="mr-2" />
              Add FAQ
            </button>
          </div>

          {/* Desktop Filters - Hide on mobile */}
          <div className="hidden md:flex flex-wrap justify-between items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Category:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === null 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  className="pl-8 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
                {searchQuery && (
                  <button 
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showPublishedOnly}
                    onChange={() => setShowPublishedOnly(!showPublishedOnly)}
                  />
                  <div className={`w-10 h-5 ${showPublishedOnly ? 'bg-blue-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
                  <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showPublishedOnly ? 'translate-x-5' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm">Published only</div>
              </label>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4 flex-1">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span 
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${faq.published ? 'bg-green-500' : 'bg-gray-400'}`}
                          title={faq.published ? 'Published' : 'Draft'}
                        ></span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">{faq.question}</h3>
                    </div>
                    <div className="flex items-center ml-2">
                      {!isMobile && (
                        <>
                          <button className="p-1 text-gray-400 hover:text-indigo-600" title="Edit">
                            <PencilLine size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 ml-1" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <div className="ml-2">
                        {expandedFAQ === faq.id ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="p-4 pt-0 border-t border-gray-100 animate-fade-in">
                      <p className="text-gray-600">{faq.answer}</p>
                      
                      {/* Mobile action buttons - only shown in expanded view on mobile */}
                      {isMobile && (
                        <div className="flex justify-end mt-4 space-x-2">
                          <button className="p-2 text-indigo-600 border border-indigo-200 rounded-lg">
                            <PencilLine size={16} />
                          </button>
                          <button className="p-2 text-red-600 border border-red-200 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-gray-500">
                  No FAQs found matching your criteria.
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Add Button - Fixed */}
          {isMobile && (
            <div className="fixed bottom-4 right-4 z-10">
              <button className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <Plus size={24} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}