// src/app/media/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import {
  Folder,
  Image as ImageIcon,
  Menu,
  ArrowLeft,
} from 'lucide-react';
import { RiFolderFill } from 'react-icons/ri';

const FOLDERS = [
  'blogs',
  'brands',
  'testimonials',
  'team',
  'projects',
  'clients',
];

export default function MediaFolders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  /* helper: go back or fall back to home */
  const goBack = () => {
    // if there's history, use it; otherwise push '/'
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ───────────── Sidebar ───────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />

      {/* ───────────── Main ───────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* ░▒▓█ Header █▓▒░ */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur bg-white border-b border-gray-200 p-4 md:p-7 flex items-center gap-4">
          {/* hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* NEW back button */}
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>

          {/* title */}
          <ImageIcon size={22} className="text-gray-600" />
          <h1 className="text-2xl font-semibold">Media</h1>
        </header>

        {/* ░▒▓█ Folders grid █▓▒░ */}
        <section className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => router.push(`/media/${folder}`)}
              className="group flex flex-col items-center justify-center rounded-lg px-10 py-7 border border-gray-200 hover:border-white bg-white shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <RiFolderFill
                size={50}
                className="text-gray-400 group-hover:text-indigo-500 transition"
              />
              <span className="mt-2 text-base font-bold capitalize text-gray-500 group-hover:text-indigo-700">
                {folder}
              </span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}
