// components/nav/SubMenu.tsx
import { FC } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SubMenuItem {
  label: string;
  url: string;
  icon?: React.ReactNode;
}

interface SubMenuProps {
  items: SubMenuItem[];
  position?: 'right' | 'below';
}

const SubMenu: FC<SubMenuProps> = ({ items, position = 'right' }) => {
  // Set positioning styles based on the position prop
  const positionStyles = position === 'below' 
    ? "top-full left-0 mt-2" 
    : "left-full top-0 ml-2";
  
  // Additional specific styles for dropdown vs flyout
  const additionalStyles = position === 'below'
    ? "w-48 origin-top-left" // Same width as parent menu item for dropdown
    : "w-56"; // Wider for flyout
  
  // Animation variants
  const animationVariants = position === 'below'
    ? {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
      }
    : {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 }
      };
  
  return (
    <motion.div 
      className={`absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${positionStyles} ${additionalStyles}`}
      initial={animationVariants.initial}
      animate={animationVariants.animate}
      exit={animationVariants.exit}
      transition={{ duration: 0.2 }}
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
    >
      <div className="relative">
        {/* Decorative accent */}
        {position === 'below' ? (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        ) : (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400"></div>
        )}
        
        <ul className="py-2">
          {items.map((item, index) => (
            <li key={index}>
              <Link 
                href={item.url}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <div className="flex flex-col">
                  <span className="text-gray-800 text-sm font-medium">{item.label}</span>
                </div>
              </Link>
              {index < items.length - 1 && <div className="mx-4 border-t border-gray-100"></div>}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default SubMenu;