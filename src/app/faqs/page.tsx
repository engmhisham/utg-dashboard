'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageCircleQuestion,
  Trash2,
  PencilLine,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const categories = [
  { id: 'general', name: 'General' },
  { id: 'technical', name: 'Technical' },
  { id: 'services', name: 'Services' },
];

export default function FAQsPage() {
  const router = useRouter();

  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // viewport check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // fetch FAQs
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const params = new URLSearchParams();
        params.append('language', language);
        if (selectedCategory) params.append('category', selectedCategory);

        const res = await fetch(`${API_BASE_URL}/faqs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        const result = await res.json();
        setFaqs(result.data?.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch FAQs.');
      } finally {
        setLoading(false);
      }
    })();
  }, [language, selectedCategory]);

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFaqs(prev => prev.filter(faq => faq.id !== id));
      toast.success('FAQ deleted');
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="p-1 bg-white rounded-full border shadow-sm"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold flex items-center ml-2">
              <MessageCircleQuestion className="mr-2" size={22} />
              FAQs
            </h1>
          </div>
          <button
            onClick={() => router.push('/faqs/create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Add FAQ
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search FAQs..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Lang:</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="h-8 w-8 text-gray-400" />
              </div>
            ) : filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            faq.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">{faq.question}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/faqs/edit/${faq.id}`);
                        }}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(faq.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                  {expandedFAQ === faq.id && (
                    <div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No FAQs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
