// components/Dashboard.tsx
import { FC } from 'react';
import ProjectHeader from './ProjectHeader';
import BudgetChart from './BudgetChart';
import DealsTable from './DealsTable';
import { Project, BudgetData, Deal } from '../types';
import { 
  ArrowLeft, Search, BarChart2, FileText, Package, Settings, Users, Building, 
  HelpCircle, Bell, ChevronDown, Filter, ArrowUpDown, Download, Plus, 
  RefreshCw, MoreHorizontal, CheckCircle
} from 'lucide-react';

interface DashboardProps {
  project: Project;
  budgetData: BudgetData;
  deals: Deal[];
}

const Dashboard: FC<DashboardProps> = ({ project, budgetData, deals }) => {
  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button className="hover:text-gray-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 17l-5-5m0 0l5-5m-5 5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center space-x-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">{project.name}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Manage
          </button>
          <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Share
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      
      <ProjectHeader project={project} />
      <BudgetChart data={budgetData} />
      <DealsTable deals={deals} />
    </div>
  );
};

export default Dashboard;