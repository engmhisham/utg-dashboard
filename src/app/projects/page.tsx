'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Sidebar from '@/src/components/Sidebar';
import { Project } from '@/src/lib/types';
import {
  ArrowLeft, Search, Plus, Image as ImageIcon,
  Menu, X, PencilLine, Trash2
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [search, setSearch]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<string[]>([]);

  /* ---------- responsive ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---------- fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get('accessToken');
        const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?sortBy=createdAt&sortOrder=DESC`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('fetch fail');
        const { data } = await res.json();
        setProjects(data.items || []);
      } catch (e) { console.error(e); }
      finally      { setLoading(false); }
    })();
  }, []);

  /* ---------- search ---------- */
  useEffect(() => {
    setFiltered(
      projects.filter(p =>
        (p.title + p.description).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [projects, search]);

  /* ---------- selection helpers ---------- */
  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  /* ---------- delete ---------- */
  const deleteProject = async (id: string) => {
    if (!confirm('Delete project?')) return;
    try {
      const token = Cookies.get('accessToken');
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('delete fail');
      setProjects(p => p.filter(pr => pr.id !== id));
    } catch (e) { console.error(e); }
  };

  /* ---------- UI ---------- */
  if (loading)
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading…</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6 flex items-center justify-between">
            {isMobile ? (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)}
                          className="p-1 rounded-full bg-white shadow-md border border-gray-200">
                    {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
                  </button>
                  <Link href="/" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20}/></Link>
                  <h1 className="text-xl font-medium ml-2 flex items-center">Projects</h1>
                </div>
                <button onClick={() => router.push('/projects/create')}
                        className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Plus size={18}/>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 mr-2"><ArrowLeft size={20}/></Link>
                  <h1 className="text-2xl font-semibold">Projects</h1>
                </div>
                <button onClick={() => router.push('/projects/create')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Plus size={18} className="mr-2"/> Add Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* filters */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <div className="relative md:w-1/3">
              <input value={search} onChange={e => setSearch(e.target.value)}
                     className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Search projects…"/>
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400"/>
            </div>
          </div>

          {/* list desktop */}
          {filtered.length ? (
            <>
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3"><input type="checkbox"
                                                          checked={selected.length===filtered.length && filtered.length>0}
                                                          onChange={toggleAll}
                                                          className="h-4 w-4 text-blue-600 border-gray-300"/></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtered.map(pr => (
                        <tr key={pr.id} className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/projects/edit/${pr.id}`)}>
                          <td className="px-6 py-4" onClick={e => { e.stopPropagation(); toggle(pr.id); }}>
                            <input type="checkbox" readOnly
                                   checked={selected.includes(pr.id)}
                                   className="h-4 w-4 text-blue-600 border-gray-300"/>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {pr.images?.[0]
                                  ? <img src={pr.images[0]} alt={pr.title} className="h-full w-full object-cover"/>
                                  : <ImageIcon className="text-gray-400" size={20}/>}
                              </div>
                              <span className="ml-4 text-sm font-medium text-gray-900">{pr.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{pr.description}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">
                            <a href={pr.url} target="_blank">{pr.url}</a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2"
                                    onClick={() => router.push(`/projects/edit/${pr.id}`)}>
                              <PencilLine size={16}/>
                            </button>
                            <button className="text-red-600 hover:text-red-900"
                                    onClick={() => deleteProject(pr.id)}>
                              <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* list mobile */}
              <div className="md:hidden space-y-4">
                {filtered.map(pr => (
                  <div key={pr.id}
                       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
                       onClick={() => router.push(`/projects/edit/${pr.id}`)}>
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {pr.images?.[0]
                            ? <img src={pr.images[0]} alt={pr.title} className="h-full w-full object-cover"/>
                            : <ImageIcon className="text-gray-500" size={20}/>}
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-900">{pr.title}</div>
                      </div>
                      <p className="text-sm text-gray-700 my-2 line-clamp-2">{pr.description}</p>
                      <a href={pr.url} target="_blank" className="text-sm text-blue-600">{pr.url}</a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500">No projects found.</p>
              <button onClick={() => router.push('/projects/create')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Add New Project</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
