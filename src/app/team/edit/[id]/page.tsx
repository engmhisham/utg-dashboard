'use client';
import { useState } from 'react';
import Sidebar from '../../../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  RefreshCw,
  Trash,
  UsersRound
} from 'lucide-react';
import Link from 'next/link';

// Sample team member data (normally from an API)
const sampleTeamMembers = [
  { 
    id: '1', 
    name: 'John Doe',
    title: 'CEO',
    status: 'active',
    cover: '/covers/john-doe.jpg'
  },
  { 
    id: '2', 
    name: 'Jane Smith',
    title: 'CTO',
    status: 'active',
    cover: '/covers/jane-smith.jpg'
  },
  { 
    id: '3', 
    name: 'Emily Johnson',
    title: 'Project Manager',
    status: 'active',
    cover: '/covers/emily-johnson.jpg'
  },
  { 
    id: '4', 
    name: 'Michael Brown',
    title: 'UI/UX Designer',
    status: 'inactive',
    cover: '/covers/michael-brown.jpg'
  },
  { 
    id: '5', 
    name: 'Sarah Lee',
    title: 'Marketing Manager',
    status: 'inactive',
    cover: '/covers/sarah-lee.jpg'
  }
];

export default function TeamEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Find the team member by ID or fallback
  const member = sampleTeamMembers.find(m => m.id === params.id) || sampleTeamMembers[0];
  
  // Form state
  const [formData, setFormData] = useState({
    name: member.name,
    title: member.title,
    status: member.status,
    cover: member.cover
  });
  
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
    router.push('/team');
  };
  
  const handleCancel = () => {
    router.push('/team');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Link href="/team" className="text-gray-500 hover:text-gray-700 mr-2">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold flex items-center">
              <UsersRound size={22} className="mr-2" />
                Editing Team Member</h1>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex-1 sm:flex-initial"
              >
                Save
              </button>
            </div>
          </div>

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

            {/* Cover Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Cover Image</h2>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 relative">
                {formData.cover ? (
                  <div className="relative">
                    <img 
                      src={formData.cover} 
                      alt="Team Member Cover" 
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
                      {formData.name} Cover
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4 text-center">Drag & drop cover image here, or click to browse</p>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Upload Cover
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Team Member Info Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Team Member Information</h2>
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
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team member name"
                    required
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
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team member title"
                  />
                </div>
              </div>
            </div>

            {/* Delete and Actions Section */}
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
                    if (confirm('Are you sure you want to delete this team member?')) {
                      // Delete logic would go here
                      router.push('/team');
                    }
                  }}
                >
                  <Trash size={16} className="mr-2" />
                  Delete Member
                </button>
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
