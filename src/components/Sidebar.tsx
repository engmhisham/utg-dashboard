'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Search,
  FileText,
  ShieldUser,
  BookCopy,
  LogOut,
  UsersRound,
  Mails,
  MessageCircleQuestion,
  Chrome,
  LayoutDashboard,
  Box,
  UserRoundCog,
  BookUser,
  Boxes,
  Rss,
  Image as ImageIcon,
  Users,
  LogOut as LogoutIcon,
  Tags,
} from 'lucide-react';
import NavItem from './nav/NavItem';
import SubNavItem from './nav/SubNavItem';
import LoadingSpinner from './LoadingSpinner';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
interface StoredUser {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // protect route
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) window.location.href = '/login';
  }, []);

  // mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // close sidebar on mobile navigation
  useEffect(() => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
  }, [pathname]);

  // auto-open SEO submenu when on /seo/*
  useEffect(() => {
    if (pathname.startsWith('/seo')) {
      setActiveSubmenu('seo');
    }
  }, [pathname]);

  // load user from localStorage
  useEffect(() => {
    try {
      const json = localStorage.getItem('user');
      if (json) setUser(JSON.parse(json));
    } catch {}
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = Cookies.get('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      Cookies.remove('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch {}
    finally {
      setLogoutLoading(false);
    }
  };

  // navigation config
  const rawNav = [
    { text: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16}/> },
    {
      text: 'SEO', icon: <Chrome size={16}/>,
      submenu: [
        { text: 'General', href: '/seo/general', icon: <UserRoundCog size={16}/> },
        { text: 'Pages',   href: '/seo/pages',   icon: <FileText    size={16}/> },
      ]
    },
    { text: 'Emails',       href: '/emails',      icon: <Mails size={16}/> },
    { text: 'Contact',      href: '/contact',     icon: <BookUser size={16}/> },
    { text: 'Blogs',        href: '/blogs',       icon: <Rss size={16}/> },
    { text: 'Categories',         href: '/categories',        icon: <Tags size={16}/>, badge: 'New' },
    { text: 'Media',        href: '/media',       icon: <ImageIcon size={16}/>, badge: 'New' },
    { text: 'Clients',      href: '/clients',     icon: <UsersRound size={16}/> },
    { text: 'Projects',     href: '/projects',    icon: <Boxes size={16}/> },
    { text: 'Team',         href: '/team',        icon: <UsersRound size={16}/> },
    { text: 'Testimonials', href: '/testimonials',icon: <BookCopy size={16}/> },
    { text: 'Brands',       href: '/brands',      icon: <Box size={16}/> },
    { text: 'FAQs',         href: '/faqs',        icon: <MessageCircleQuestion size={16}/> },
  ];

  const matches = (label: string) =>
    label.toLowerCase().includes(searchQuery.toLowerCase());

  // filter nav by search
  const nav = rawNav.map(item => {
    if (matches(item.text)) return item;
    if (item.submenu) {
      const filteredSub = item.submenu.filter(s => matches(s.text));
      if (filteredSub.length) return { ...item, submenu: filteredSub };
    }
    return null;
  }).filter(Boolean) as typeof rawNav;

  const toggleSubmenu = (key: string) =>
    setActiveSubmenu(activeSubmenu === key ? null : key);

  const isPathActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside
        className={`
          w-56 bg-gray-100 border-r border-gray-300
          flex flex-col h-screen min-h-0
          ${isMobile
            ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out'
            : 'hidden md:flex'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* ——— logo ——— */}
        <div className="p-4 border-b">
          <div className="font-bold text-xl flex items-center">
            <span className="bg-black text-white p-1 rounded mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12L2 12M22 12L16 6M22 12L16 18" />
              </svg>
            </span>
            UTG
          </div>
        </div>

        {/* ——— search ——— */}
        <div className="p-3">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl px-8 py-2 text-sm"
            />
            <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* ——— scrollable nav ——— */}
        <div className="flex-1 overflow-y-auto px-2 mt-2">
          <nav>
            {nav.map(item => {
              const key = item.text.toLowerCase();
              return (
                <div key={key}>
                  <NavItem
                    icon={item.icon}
                    text={item.text}
                    href={item.href ?? '#'}
                    badge={(item as any).badge}
                    hasSubmenu={!!(item as any).submenu}
                    isActive={isPathActive(item.href ?? '', true)}
                    onClick={() => (item as any).submenu && toggleSubmenu(key)}
                    className="
                      text-sm m-2
                      border-l-4 border-transparent 
                      hover:bg-white 
                      hover:border-l-4 hover:border-gray-300
                    "
                  />
                  {(item as any).submenu && activeSubmenu === key && (
                    <div className="ml-6 mt-1 space-y-1">
                      {(item as any).submenu.map((s: any) => (
                        <SubNavItem
                          key={s.text}
                          icon={s.icon}
                          text={s.text}
                          url={s.href}
                          active={isPathActive(s.href, true)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ——— fixed footer ——— */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href={user?.id ? `/users/view/${user.id}` : '#'}
            className={`
              flex items-center gap-2 py-2 px-2 rounded-xl border text-sm
              ${pathname.startsWith('/users/') && pathname !== '/users'
                          ? 'bg-white border-gray-300 text-blue-700'
                          : 'border-transparent hover:bg-white hover:border-gray-300'}
            `}
          >
            <ShieldUser size={16} /> {user?.username || 'Profile'}
          </Link>

          <NavItem
            icon={<Users size={16} />}
            text="Users"
            href="/users"
            active={isPathActive('/users', true)}
            className={`
              flex items-center gap-2 py-2 px-2 text-sm border mt-2
              ${isPathActive('/users', true)
                          ? 'bg-white border-gray-300 text-blue-700'
                          : 'border-transparent hover:bg-white hover:border-gray-300'}
            `}
          />

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className={`
              mt-2 flex items-center gap-2 py-2 px-2 rounded-xl border
              ${logoutLoading
                ? 'opacity-60 cursor-not-allowed border-transparent'
                : 'border-transparent hover:bg-white hover:border-gray-300'}
              text-red-600 text-sm w-full justify-start
            `}
          >
            {logoutLoading
              ? <LoadingSpinner className="h-4 w-4 text-red-600" />
              : <LogoutIcon size={16} />
            }
            <span>
              {logoutLoading ? 'Logging out…' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
