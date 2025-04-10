// components/nav/NavItem.tsx
import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  badge?: string;
  className?: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  text,
  badge,
  className,
  active = false,
  hasSubmenu = false,
  isActive = false,
  onClick,
  href
}) => {
  const content = (
    <div
      className={`flex items-center justify-between p-2 rounded-xl ${className} ${
        active || isActive ? 'bg-white border-2 border-gray-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className={active || isActive ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
        <span className={active || isActive ? 'font-medium text-blue-600' : ''}>{text}</span>
      </div>
      <div className="flex items-center">
        {badge && (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            badge === 'New' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {badge}
          </span>
        )}
        {hasSubmenu && (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`ml-1 ${isActive ? 'transform rotate-90' : ''}`}
          >
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

export default NavItem;