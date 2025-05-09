'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Menu,
  X,
  PencilLine,
  Trash2,
  Image as ImageIcon,
  Boxes,
} from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/src/lib/types';
import ConfirmModal from '@/src/components/ConfirmModal';
import { getImgSrc } from '@/src/utils/getImgSrc';
import PermissionModal from '@/src/components/PermissionModal';

export default function ProjectsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  const openDeleteModal = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProjectToDelete(null);
  };
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete);
    closeDeleteModal();
  };
  const handleEdit = (id: string) => {
    if (userRole !== 'admin') return showUnauthorizedPopup();
    router.push(`/projects/edit/${id}`);
  };
  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showUnauthorizedPopup = () => setUnauthorizedModalOpen(true);
  const closeUnauthorizedPopup = () => setUnauthorizedModalOpen(false);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUserRole(data.data.role); // assuming the response includes { role: 'admin' | ... }
      } catch {
        setUserRole(null); // fallback
      }
    };

    fetchUserRole();
  }, []);

  // Fetch projects and build images array
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects?sortBy=createdAt&sortOrder=DESC`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch projects');
        const json = await res.json();
        const items = json.data.items || [];
        const withImages = items.map((p: any) => ({
          ...p,
          images: [
            p.imageUrl,
            p.image1Url,
            p.image2Url,
            p.image3Url,
            p.image4Url,
          ].filter((u: any) => typeof u === 'string' && u),
        }));
        setProjects(withImages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter on search
  useEffect(() => {
    setFiltered(
      projects.filter(p =>
        (p.title + p.description).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [projects, search]);

  // Selection toggles
  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  const toggleAll = () =>
    setSelected(
      selected.length === filtered.length ? [] : filtered.map(p => p.id)
    );

  // Delete project
  const deleteProject = async (id: string) => {
    try {
      const token = Cookies.get('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Delete failed');
      setProjects(p => p.filter(pr => pr.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete project');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1 rounded-full bg-white shadow border"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </Link>
                <Boxes size={24} className="text-gray-500 mr-2" />
                <h1 className="text-xl font-medium ml-2 flex-1 items-center justify-between">
                  Projects
                </h1>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/projects/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white rounded-xl hover:bg-blue-700'} p-2 rounded-xl`}
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft size={20} />
                  </Link>
                  <h1 className="text-2xl font-semibold flex items-center">
                  <Boxes size={24} className="text-gray-500 mr-2" />
                    Projects</h1>
                </div>
                <button
                  onClick={() => {
                    if (userRole !== 'admin') return showUnauthorizedPopup();
                    router.push('/projects/create');
                  }}
                  disabled={loading || userRole !== 'admin'}
                  className={`${loading || userRole !== 'admin'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'} flex items-center px-4 py-2 rounded-xl`}
                >
                  <Plus size={18} className="mr-2" /> Add Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search / Filters */}
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="relative md:w-1/3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-10 pr-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <div className="flex justify-center">
                        <LoadingSpinner className="h-8 w-8 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map(pr => (
                    <tr
                      key={pr.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(pr.id);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {pr.images[0] ? (
                              <img src={getImgSrc(pr.images[0])} alt={pr.title} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-gray-400" />
                            )}
                          </div>
                          <span className="ml-4 text-sm font-medium text-gray-900">{pr.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {pr.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                        >
                          {pr.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pr.createdAt
                          ? new Date(pr.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(pr.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openDeleteModal(pr.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="h-8 w-8 text-gray-400" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(pr => (
                <div
                  key={pr.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    handleEdit(pr.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2 w-full">
                    {/* left group */}
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {pr.images[0]
                          ? <img src={getImgSrc(pr.images[0])} alt={pr.title} className="h-full w-full object-cover" />
                          : <ImageIcon size={20} className="text-gray-500" />
                        }
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {pr.title}
                      </span>
                    </div>

                    {/* right group */}
                    <div className="flex space-x-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleEdit(pr.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openDeleteModal(pr.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">{pr.description}</p>
                  <a href={pr.url} target="_blank" className="text-sm text-blue-600">
                    {pr.url}
                  </a>
                </div>
                
                
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                <p className="text-gray-500">No projects found.</p>
                <button
                  onClick={() => router.push('/projects/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add New Project
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <PermissionModal
        show={unauthorizedModalOpen}
        message="You don’t have permission to perform this action."
        onClose={closeUnauthorizedPopup}
      />
      <ConfirmModal
        show={deleteModalOpen}
        message="Delete this project?"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
