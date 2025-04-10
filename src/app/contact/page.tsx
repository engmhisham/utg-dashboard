'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  PencilLine, 
  BookUser,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

// Sample contact messages data
const sampleMessages = [
  { 
    id: '1', 
    fullName: 'Alice Johnson',
    phone: '123-456-7890',
    email: 'alice@example.com',
    subject: 'Inquiry',
    message: 'I would like to know more about your services.',
    date: '2025-03-15'
  },
  { 
    id: '2', 
    fullName: 'Bob Smith',
    phone: '456-789-0123',
    email: 'bob@example.com',
    subject: 'Feedback',
    message: 'Great service, thanks!',
    date: '2025-03-10'
  },
  { 
    id: '3', 
    fullName: 'Charlie Davis',
    phone: '321-654-0987',
    email: 'charlie@example.com',
    subject: 'Complaint',
    message: 'I encountered an issue with your website.',
    date: '2025-03-09'
  }
];

export default function ContactPage() {
  const router = useRouter();
  const pathname = usePathname();

  // State for search and selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine mobile vs desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter messages based on the search query
  const filteredMessages = sampleMessages.filter(message => {
    const query = searchQuery.toLowerCase();
    return (
      message.fullName.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.subject.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query)
    );
  });

  // Toggle individual message selection
  const toggleMessageSelection = (id: string) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter(msgId => msgId !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  // Toggle select/deselect all filtered messages
  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  // Handle deletion; in practice, connect this to your API/backend
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      console.log('Deleting message with id:', id);
      // Update state or call your API here
    }
  };

  // Handle edit/view; navigate to a contact message edit page if implemented
  const handleEdit = (id: string) => {
    router.push(`/contact/edit/${id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar passed with control props */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky header without inline horizontal padding */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          {isMobile ? (
            <div className="flex items-center gap-2 p-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/" className="p-1">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-medium flex items-center">
              <BookUser size={22} className="mr-2" />
                Contact</h1>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Link href="/" className="text-gray-500 hover:text-gray-700 p-1">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                  <BookUser size={22} className="mr-2" />
                  Contact Messages
                </h1>
              </div>
            </div>
          )}
        </div>
        
        {/* Page content container with margins */}
        <div className="mx-auto max-w-7xl px-4">
          {/* Search Filter */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map(message => (
                    <tr 
                      key={message.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEdit(message.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageSelection(message.id);
                        }}>
                        <div className="flex items-center">
                          <input 
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={selectedMessages.includes(message.id)}
                            onChange={() => {}}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {message.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {message.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="line-clamp-2">{message.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="text-red-600 hover:text-red-900 m-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(message.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredMessages.map(message => (
              <div 
                key={message.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                onClick={() => handleEdit(message.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                        checked={selectedMessages.includes(message.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleMessageSelection(message.id);
                        }}
                      />
                      <div className="text-sm font-medium text-gray-900">{message.fullName}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-blue-600 mb-2">{message.email}</div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Subject:</strong> {message.subject}
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">{message.message}</div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(message.id);
                      }}
                    >
                      <PencilLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-500">No messages found.</div>
            </div>
          )}

          {filteredMessages.length > 0 && (
            <div className="bg-white mt-4 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 rounded-b-xl sm:px-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredMessages.length}</span> of{' '}
                <span className="font-medium">{sampleMessages.length}</span> messages
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
