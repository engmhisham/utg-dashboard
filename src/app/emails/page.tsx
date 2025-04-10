'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Star, 
  ChevronLeft,
  Clock, 
  Trash2, 
  MoreVertical,
  RefreshCw,
  Archive,
  Filter,
  ChevronDown,
  Mail,
  MailOpen,
  Tag,
  Menu,
  Inbox,
  Mails,
  X
} from 'lucide-react';
import Link from 'next/link';

// Sample data for the emails
const sampleEmails = [
  { 
    id: 1, 
    sender: 'John Doe', 
    email: 'john.doe@example.com',
    subject: 'Marketing campaign proposal', 
    preview: 'Hi team, I wanted to share the latest marketing campaign proposal for Q2. We need to...',
    date: '2025-04-08T10:30:00',
    read: true,
    starred: true,
    tags: ['client', 'important']
  },
  { 
    id: 2, 
    sender: 'Sarah Williams', 
    email: 'sarah.w@arcadecorp.com',
    subject: 'Social media strategy feedback', 
    preview: 'Hello, I\'ve reviewed your social media strategy document and I have some feedback to share...',
    date: '2025-04-08T09:15:00',
    read: false,
    starred: false,
    tags: ['social', 'feedback']
  },
  { 
    id: 3, 
    sender: 'Team Analytics', 
    email: 'analytics@utg.io',
    subject: 'Weekly Analytics Report - April 1-7', 
    preview: 'Here\'s your weekly analytics report. Website traffic up 12%, conversion rate stable at 3.5%...',
    date: '2025-04-07T16:45:00',
    read: true,
    starred: false,
    tags: ['report', 'analytics'] 
  },
  { 
    id: 4, 
    sender: 'Michael Chen', 
    email: 'michael.c@brightstar.com',
    subject: 'Meeting follow-up - Campaign Strategy', 
    preview: 'Thanks for the meeting today. As discussed, I\'m attaching the revised campaign strategy with...',
    date: '2025-04-07T14:20:00',
    read: false,
    starred: true,
    tags: ['meeting', 'campaign']
  },
  { 
    id: 5, 
    sender: 'Emma Johnson', 
    email: 'emma.johnson@clientcorp.com',
    subject: 'Question about latest report', 
    preview: 'Hi there, I was looking at the latest performance report you sent over and had a question about...',
    date: '2025-04-06T11:05:00',
    read: true,
    starred: false,
    tags: ['client', 'report']
  },
  { 
    id: 6, 
    sender: 'Product Updates', 
    email: 'updates@utg.io',
    subject: 'New features available in your UTG dashboard', 
    preview: 'We\'ve added some exciting new features to your UTG dashboard! Check out the new analytics...',
    date: '2025-04-05T08:30:00',
    read: true,
    starred: false,
    tags: ['product', 'updates']
  },
  { 
    id: 7, 
    sender: 'Alex Thompson', 
    email: 'alex.t@techinnovate.io',
    subject: 'Partnership opportunity', 
    preview: 'I\'d like to discuss a potential partnership between our companies. Our innovative tech solutions...',
    date: '2025-04-04T15:50:00',
    read: false,
    starred: true,
    tags: ['partnership', 'important']
  }
];

// Helper to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function EmailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State for search, filtering, and selection
  const [emails, setEmails] = useState(sampleEmails);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  
  // For mobile view, sidebar toggle, and filter toggle
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Filter emails based on search and filter selection
  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (selectedFilter === 'unread') {
      matchesFilter = !email.read;
    } else if (selectedFilter === 'starred') {
      matchesFilter = email.starred;
    }
    return matchesSearch && matchesFilter;
  });
  
  // Toggle email selection
  const toggleEmailSelection = (id: number) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(emailId => emailId !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };
  
  // Toggle star status
  const toggleStarred = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(emails.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };
  
  // Mark as read/unread
  const toggleReadStatus = (ids: number[]) => {
    setEmails(emails.map(email => 
      ids.includes(email.id) ? { ...email, read: !email.read } : email
    ));
    setSelectedEmails([]);
  };
  
  // Delete selected emails
  const deleteEmails = (ids: number[]) => {
    setEmails(emails.filter(email => !ids.includes(email.id)));
    setSelectedEmails([]);
  };
  
  // Select all emails
  const selectAllEmails = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Pass sidebar control props */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Sticky Header (Full width, no container padding) */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 md:p-6">
            {isMobile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="p-1 mr-2">
                    <ChevronLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium flex items-center">
                  <Mails size={22} className="mr-2" />
                    Emails</h1>
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
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <Mails size={22} className="mr-2" />
                    Emails
                  </h1>
                </div>
                <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                  <Plus size={18} className="mr-2" />
                  Compose
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Search Bar (Shown when toggled) */}
        {showMobileFilter && isMobile && (
          <div className="p-3 bg-white border-b border-gray-200 md:hidden animate-fade-in sticky top-12 z-10">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search emails..."
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
            <div className="flex space-x-2 overflow-x-auto py-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedFilter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setSelectedFilter('starred')}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedFilter === 'starred' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Starred
              </button>
            </div>
          </div>
        )}
        
        {/* Content Container */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          {/* Desktop Toolbar */}
          <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white rounded-t-xl border border-gray-200 p-3 mb-0">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedEmails.length > 0 && selectedEmails.length === filteredEmails.length}
                onChange={selectAllEmails}
              />
              {selectedEmails.length > 0 ? (
                <>
                  <button 
                    onClick={() => toggleReadStatus(selectedEmails)}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="Mark as read/unread"
                  >
                    {emails.some(email => selectedEmails.includes(email.id) && !email.read) ? 
                      <MailOpen size={18} className="text-gray-500" /> : 
                      <Mail size={18} className="text-gray-500" />
                    }
                  </button>
                  <button 
                    onClick={() => deleteEmails(selectedEmails)}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-gray-500" />
                  </button>
                  <button 
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="Archive"
                  >
                    <Archive size={18} className="text-gray-500" />
                  </button>
                  <span className="text-sm text-gray-500">{selectedEmails.length} selected</span>
                </>
              ) : (
                <button 
                  className="p-1.5 rounded hover:bg-gray-100"
                  title="Refresh"
                >
                  <RefreshCw size={18} className="text-gray-500" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search emails..."
                  className="pl-8 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
              </div>
              <div className="relative inline-block w-full sm:w-auto">
                <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center">
                    <Filter size={16} className="mr-1 text-gray-500" />
                    <span className="text-sm">
                      {selectedFilter === 'all' ? 'All' : 
                      selectedFilter === 'unread' ? 'Unread' : 'Starred'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="ml-1 text-gray-500" />
                </button>
                {/* Dropdown options could be added here */}
              </div>
            </div>
          </div>

          {/* Mobile Compose Button */}
          <div className="fixed bottom-4 right-4 z-20 md:hidden">
            <button className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Plus size={24} />
            </button>
          </div>

          {/* Email List */}
          <div className={`bg-white ${isMobile ? 'rounded-none' : 'rounded-b-xl md:rounded-t-none'} border-x border-b border-gray-200 overflow-hidden flex-1`}>
            {filteredEmails.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <div 
                    key={email.id}
                    className={`flex flex-col p-3 cursor-pointer hover:bg-gray-50 ${!email.read && 'bg-blue-50'}`}
                    onClick={() => toggleEmailSelection(email.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedEmails.includes(email.id)}
                          onChange={() => toggleEmailSelection(email.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span 
                          onClick={(e) => toggleStarred(email.id, e)}
                          className="flex-shrink-0"
                        >
                          <Star 
                            size={18} 
                            className={email.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                          />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(email.date)}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!email.read && 'font-semibold'}`}>
                        {email.sender}
                      </p>
                      <div className="flex flex-wrap gap-1 my-1">
                        {email.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm ${!email.read && 'font-semibold'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <Inbox size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No emails found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery 
                    ? `No emails matching "${searchQuery}"` 
                    : "Your inbox is empty"}
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination Footer (Desktop only) */}
          {filteredEmails.length > 0 && !isMobile && (
            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl gap-3">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEmails.length}</span> of{' '}
                  <span className="font-medium">{filteredEmails.length}</span> emails
                </p>
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
