'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import NavItem from './nav/NavItem';
import SubNavItem from './nav/SubNavItem';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Search, FileText, ShieldUser, BookCopy, LogOut, UsersRound, Mails,
  MessageCircleQuestion, Chrome, LayoutDashboard, Box, UserRoundCog, BookUser,
  Projector,
  Boxes,
  Rss,
  User,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
interface StoredUser {
  id?: string;          // ← make it optional so the code still compiles
  username?: string;
  email?: string;
  role?: string;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser  | null>(null);
  const pathname = usePathname();

  // Redirect if not authenticated
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle active submenu
  useEffect(() => {
    if (pathname?.includes('/seo')) {
      setActiveSubmenu('seo');
    }
    if (isMobile && isOpen) {
      toggleSidebar(); // auto-close sidebar on mobile after route change
    }
  }, [pathname]);

  const toggleSubmenu = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const isPathActive = (target: string, exact = false) => {
    if (exact) return pathname === target;
    return pathname.startsWith(target);
  };
  const isProfilePage =
  pathname.startsWith('/users/') && pathname !== '/users';

  // Load user
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
      setUser(null);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      Cookies.remove('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <aside
        className={`w-56 bg-gray-100 border-r border-gray-300 ${
          isMobile
            ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out'
            : 'hidden md:block'
        } ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="w-[220px] border-r flex flex-col">
          <div className="p-4 border-b flex items-center">
            <div className="font-bold text-xl flex items-center">
              <span className="bg-black text-white p-1 rounded mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12L2 12M22 12L16 6M22 12L16 18" />
                </svg>
              </span>
              UTG
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl px-8 py-2 text-sm"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
          </div>
        </div>

        <nav className="mt-4 overflow-y-auto max-h-[calc(100vh-240px)]">
          <ul>
            <NavItem icon={<LayoutDashboard size={16} />} text="Dashboard" href="/dashboard" active={isPathActive('/dashboard')} className="w-48 m-auto text-sm" />
            
            <div>
              <NavItem
                icon={<Chrome size={16} />}
                text="SEO"
                hasSubmenu={true}
                isActive={activeSubmenu === 'seo'}
                onClick={() => toggleSubmenu('seo')}
                className="w-48 m-auto text-sm"
              />
              {activeSubmenu === 'seo' && (
                <div className="ml-2 mt-1">
                  <SubNavItem text="General" icon={<UserRoundCog size={16} />} url="/seo/general" className="w-40 ml-10" active={isPathActive('/seo/general')} />
                  <SubNavItem text="Pages" icon={<FileText size={16} />} url="/seo/pages" className="w-40 ml-10" active={isPathActive('/seo/pages')} />
                </div>
              )}
            </div>

            <NavItem icon={<Mails size={16} />} text="Emails"href="/emails" active={isPathActive('/emails')} className="w-48 m-auto text-sm" />
            <NavItem icon={<UsersRound size={16} />} text="Clients" href="/clients" active={isPathActive('/clients')} className="w-48 m-auto text-sm" />
            <NavItem icon={<Boxes size={16} />} text="Projects" badge="New" href="/projects" active={isPathActive('/projects')} className="w-48 m-auto text-sm" />
            <NavItem icon={<UsersRound size={16} />} text="Team" href="/team" active={isPathActive('/team')} className="w-48 m-auto text-sm" />
            <NavItem icon={<BookCopy size={16} />} text="Testimonials" href="/testimonials" active={isPathActive('/testimonials')} className="w-48 m-auto text-sm" />
            <NavItem icon={<Box size={16} />} text="Brands"href="/brands" active={isPathActive('/brands')} className="w-48 m-auto text-sm" />
            <NavItem icon={<Rss size={16} />} text="Blogs" badge="New" href="/blogs" active={isPathActive('/blogs')} className="w-48 m-auto text-sm" />
            <NavItem icon={<BookUser size={16} />} text="Contact" href="/contact" active={isPathActive('/contact')} className="w-48 m-auto text-sm" />
            <NavItem icon={<MessageCircleQuestion size={16} />} text="FAQs" href="/faqs" active={isPathActive('/faqs')} className="w-48 m-auto text-sm" />
          </ul>
        </nav>

        <div className="mt-auto border-t border-gray-200 pt-0 pb-2 px-4 absolute bottom-0 w-56">
          {/* <div className="flex items-center gap-2 py-2 px-2 rounded-xl border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer mt-2">
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">
              <ShieldUser size={16} />
            </div>
            <span className="text-sm">{user?.username ?? 'Ember Crest'}</span>
          </div> */}
          <Link
            href={user?.id ? `/users/view/${user.id}` : '#'}
            className={`flex items-center gap-2 py-2 px-2 rounded-xl border
              ${isProfilePage
                ? 'bg-white border-2 border-gray-300 text-blue-700'
                : 'border-transparent hover:bg-white hover:border-gray-300'}
              cursor-pointer mt-2`}
          >
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">
              <ShieldUser size={16} />
            </div>
            <span className="text-sm">{user?.username ?? 'Ember Crest'}</span>
          </Link>
          <NavItem
            icon={<Users size={16} />}
            text="Users"
            href="/users"
            active={isPathActive('/users', true)}
            className="w-48 m-auto text-sm px-3"
          />
          <div
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-3 rounded-xl border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer text-red-600"
          >
            <LogOut size={16} />
            <span className="text-sm">Logout</span>
          </div>
        </div>
      </aside>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
