// components/Sidebar.tsx
'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import NavItem from './nav/NavItem';
import SubNavItem from './nav/SubNavItem';
import { usePathname } from 'next/navigation';
import { 
  Search, FileText, Users, BookCopy, HelpCircle, Bell, UsersRound, Mails, MessageCircleQuestion, Chrome, LayoutDashboard, Box, X,
  UserRoundCog,
  BookUser
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle window resize to determine if mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set active submenu based on current path
  useEffect(() => {
    if (pathname?.includes('/seo')) {
      setActiveSubmenu('seo');
    }
  }, [pathname]);

  const toggleSubmenu = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const isPathActive = (path: string) => pathname === path;

  return (
    <>
      <aside 
        className={`w-56 bg-gray-100 border-r border-gray-300 ${
          isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out' : 'hidden md:block'
        } ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Close button for mobile view (inside the sidebar) */}
        {/* {isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )} */}
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
            <NavItem 
              icon={<LayoutDashboard size={16} />} 
              text="Dashboard" 
              className="border border-transparent hover:bg-white hover:border-gray-300 cursor-pointer w-48 m-auto text-sm" 
              active={isPathActive('/')}
              href="/"
            />
            {/* SEO with submenu */}
            <div>
              <NavItem 
                icon={<Chrome size={16} />} 
                text="SEO" 
                className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
                hasSubmenu={true}
                isActive={activeSubmenu === 'seo' || pathname?.includes('/seo')}
                onClick={() => toggleSubmenu('seo')}
              />
              {activeSubmenu === 'seo' && (
                <div className="ml-2 mt-1">
                  <SubNavItem 
                    text="General" 
                    icon={<UserRoundCog size={16} />} 
                    url="/seo/general" 
                    className="w-40 ml-10"
                    active={isPathActive('/seo/general')}
                  />
                  <SubNavItem 
                    text="Pages" 
                    icon={<FileText size={16} />} 
                    url="/seo/pages" 
                    className="w-40 ml-10"
                    active={isPathActive('/seo/pages')}
                  />
                </div>
              )}
            </div>
            <NavItem 
              icon={<Mails size={16} />} 
              text="Emails" 
              badge="164" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/emails')}
              href="/emails"
            />
            <NavItem 
              icon={<UsersRound size={16} />} 
              text="Clients" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/clients')}
              href="/clients"
            />
            <NavItem 
              icon={<UsersRound size={16} />} 
              text="Team" 
              badge="New" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/team')}
              href="/team"
            />
            <NavItem 
              icon={<BookCopy size={16} />} 
              text="Testimonials" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/testimonials')}
              href="/testimonials"
            />
            <NavItem 
              icon={<Box size={16} />} 
              text="Brands" 
              badge="164" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/brands')}
              href="/brands"
            />
            <NavItem 
              icon={<BookUser size={16} />} 
              text="contact"
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/contact')}
              href="/contact"
            />
            <NavItem 
              icon={<MessageCircleQuestion size={16} />} 
              text="FAQs" 
              badge="17" 
              className="border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer w-48 m-auto text-sm"
              active={isPathActive('/faqs')}
              href="/faqs"
            />
          </ul>
        </nav>

        <div className="mt-auto border-t border-gray-200 pt-4 pb-2 px-4 absolute bottom-0 w-56">
          {/* <div className="flex items-center gap-2 py-2 px-2 rounded-xl border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer">
            <HelpCircle size={16} className="text-gray-500" />
            <span className="text-sm">Help center</span>
          </div> */}
          {/* <div className="flex items-center gap-2 py-2 px-2 rounded-xl border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer">
            <Bell size={16} className="text-gray-500" />
            <span className="text-sm">Notifications</span>
            <span className="ml-auto bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
          </div> */}
          <div className="flex items-center gap-2 py-2 px-2 rounded-xl border border-transparent hover:bg-white hover:border-2 hover:border-gray-300 cursor-pointer mt-2">
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">EC</div>
            <span className="text-sm">Ember Crest</span>
          </div>
        </div>
      </aside>

      {/* Optional overlay for mobile */}
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
