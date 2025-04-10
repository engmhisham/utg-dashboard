// components/ProjectHeader.tsx
import { FC } from 'react';
import { Project } from '../types';
import ScoreCard from './ScoreCard';

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3246 4.31731C10.751 2.5609 13.249 2.5609 13.6754 4.31731C13.9508 5.45193 15.2507 5.99038 16.2478 5.38285C17.7913 4.44239 19.5576 6.2087 18.6172 7.75218C18.0096 8.74925 18.5481 10.0492 19.6827 10.3246C21.4391 10.751 21.4391 13.249 19.6827 13.6754C18.5481 13.9508 18.0096 15.2507 18.6172 16.2478C19.5576 17.7913 17.7913 19.5576 16.2478 18.6172C15.2507 18.0096 13.9508 18.5481 13.6754 19.6827C13.249 21.4391 10.751 21.4391 10.3246 19.6827C10.0492 18.5481 8.74926 18.0096 7.75219 18.6172C6.2087 19.5576 4.44239 17.7913 5.38285 16.2478C5.99038 15.2507 5.45193 13.9508 4.31731 13.6754C2.5609 13.249 2.5609 10.751 4.31731 10.3246C5.45193 10.0492 5.99037 8.74926 5.38285 7.75218C4.44239 6.2087 6.2087 4.44239 7.75219 5.38285C8.74926 5.99037 10.0492 5.45193 10.3246 4.31731Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-gray-600">Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden">
                <img src={project.owner.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} alt={project.owner.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-gray-600">{project.owner.name}</span>
            </div>
            <div className="text-sm text-gray-500">Edited {project.lastEdited}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-12 mt-4">
        <ScoreCard
          title="Sales"
          score={project.scores.sales}
          maxScore={10}
          colorClass="text-blue-600"
        />
        <ScoreCard
          title="Profit"
          score={project.scores.profit}
          maxScore={10}
          colorClass="text-red-500"
        />
        <ScoreCard
          title="Customer"
          score={project.scores.customer}
          maxScore={10}
          colorClass="text-blue-600"
        />
      </div>
    </div>
  );
};

export default ProjectHeader;
