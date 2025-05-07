'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { ArrowLeft, Trash2, Menu, X, Tags, Plus, PencilLine } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/src/components/ConfirmModal';
import PermissionModal from '@/src/components/PermissionModal';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  type: 'blog' | 'faq';
  usedByCount: number;
}

export default function BlogCategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');

  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/categories?type=faq`, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editCategory) {
      setNewCategoryNameEn(editCategory.name_en);
      setNewCategoryNameAr(editCategory.name_ar);
    } else {
      setNewCategoryNameEn('');
      setNewCategoryNameAr('');
    }
  }, [editCategory, showCategoryModal]);  

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserRole(data.data.role);
      } catch {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const deleteCategory = async () => {
    if (!confirmDeleteId) return;
    const token = Cookies.get('accessToken');
    try {
      const res = await fetch(`${API}/categories/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCategories(prev => prev.filter(c => c.id !== confirmDeleteId));
    } catch {
      alert('Cannot delete category in use');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const showUnauthorizedPopup = () => setUnauthorizedModalOpen(true);
  const closeUnauthorizedPopup = () => setUnauthorizedModalOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
        <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(o => !o)}
                    className="p-1 bg-white rounded-full shadow border"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Tags size={22} className="mr-2" /> FAQ Categories
                  </h1>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} />
                </button>
              </>
            ) : (
              <>
                {/* Back button */}
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-semibold flex items-center">
                    <Tags size={22} className="mr-2" /> FAQ Categories
                  </h1>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" /> Add Category
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name "En"</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name "Ar"</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center">
                      <LoadingSpinner className="h-8 w-8 text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cat.name_en}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cat.name_ar}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{cat.usedByCount}</td>
                      <td className="px-6 py-4 text-right">
                      <button
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                          onClick={() => {
                            setEditCategory(cat); 
                            setShowCategoryModal(true);
                          }}
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          disabled={cat.usedByCount > 0}
                          onClick={() => {
                            if (userRole !== 'admin') return showUnauthorizedPopup();
                            setConfirmDeleteId(cat.id);
                          }}
                          className={`text-red-600 hover:text-red-900 ${cat.usedByCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editCategory ? 'Edit FAQ Category' : 'Add FAQ Category'}
            </h2>
            <input
              type="text"
              placeholder="Category name (English)"
              value={newCategoryNameEn}
              onChange={(e) => setNewCategoryNameEn(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Category name (Arabic)"
              value={newCategoryNameAr}
              onChange={(e) => setNewCategoryNameAr(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditCategory(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const token = Cookies.get('accessToken');

                  try {
                    let res;

                    if (editCategory) {
                      res = await fetch(`${API}/categories/${editCategory.id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          name_en: newCategoryNameEn,
                          name_ar: newCategoryNameAr,
                        }),
                      });
                    } else {
                      res = await fetch(`${API}/categories`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          name_en: newCategoryNameEn,
                          name_ar: newCategoryNameAr,
                          type: 'faq',
                        }),
                      });
                    }

                    if (!res.ok) throw new Error();

                    toast.success(editCategory ? 'Category updated' : 'Category added');
                    setShowCategoryModal(false);
                    setEditCategory(null); // reset
                    await fetchCategories(); // reload
                  } catch {
                    toast.error(editCategory ? 'Failed to update category' : 'Failed to add category');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this category?"
        onConfirm={deleteCategory}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <PermissionModal
        show={unauthorizedModalOpen}
        message="You don’t have permission to perform this action."
        onClose={closeUnauthorizedPopup}
      />
    </div>
  );
}
