'use client';
import { FC, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProjectHeader from './ProjectHeader';
import BudgetChart from './BudgetChart';
import DealsTable from './DealsTable';
import { Project, BudgetData, Deal } from '../types';
import { 
  ArrowLeft,
  ChevronLeft,
  Chrome,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

interface DashboardProps {
  project: Project;
  budgetData: BudgetData;
  deals: Deal[];
}

const Dashboard: FC<DashboardProps> = ({ project, budgetData, deals }) => {
  // Mobile detection and sidebar state
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Always pass the required sidebar props */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Full‑width Sticky Header with its own padding */}
        <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
          <div className="p-4 md:p-6">
            {isMobile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  <Link href="/" className="p-1">
                    <ChevronLeft size={20} />
                  </Link>
                  <h1 className="text-xl font-medium flex items-center">
                  <LayoutDashboard size={22} className="mr-2" />
                    Dashboard</h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <button className="hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="flex items-center">
                    <LayoutDashboard size={22} className="mr-2" />
                      Dashboard</span>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">{project.name}</span>
                  </div>
                </div>
                {/* (Optional: Add desktop-specific header actions here) */}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Container with horizontal margins */}
        <div className="mx-auto max-w-7xl px-4 pb-24 md:pb-6">
          <ProjectHeader project={project} />
          <BudgetChart data={budgetData} />
          <DealsTable deals={deals} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
