// Responsive Layout Component
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function ResponsiveLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isMobile) {
    return (
      <div className="relative h-screen overflow-hidden">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
        >
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </button>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        {/* <div className={`
          fixed top-0 left-0 w-64 h-full bg-white transform transition-transform duration-300 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar />
        </div> */}

        {/* Main Content */}
        <main className="h-full overflow-y-auto pt-16 px-4">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Fixed Sidebar */}
      {/* <div className="w-64 h-screen flex-shrink-0 fixed">
        <Sidebar />
      </div> */}
      
      {/* Main content with left margin */}
      <main className="ml-64 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// Usage in pages:
// export default function YourPage() {
//   return (
//     <ResponsiveLayout>
//       {/* Your page content */}
//     </ResponsiveLayout>
//   );
// }