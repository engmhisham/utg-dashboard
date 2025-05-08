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
  X,
  MailCheck
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
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-7">
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
                  <MailCheck size={22} className="mr-2" />
                    Subscriptions</h1>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <MailCheck size={22} className="mr-2" />
                    Subscriptions
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
