// components/nav/SubNavItem.tsx
import React from 'react';
import Link from 'next/link';

interface SubNavItemProps {
  text: string;
  icon: React.ReactNode;
  url: string;
  className?: string;
  active?: boolean;
}

const SubNavItem: React.FC<SubNavItemProps> = ({ text, icon, url, className, active = false }) => {
  return (
    <Link href={url}>
      <div 
        className={`flex items-center gap-2 py-2 px-2 text-sm rounded-xl mb-1 ${className} ${
          active 
            ? 'bg-white border-2 border-gray-300 text-blue-600 font-medium' 
            : 'text-gray-600 border border-transparent hover:bg-white hover:border-2 hover:border-gray-300'
        }`}
      >
        <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
        <span>{text}</span>
      </div>
    </Link>
  );
};

export default SubNavItem;