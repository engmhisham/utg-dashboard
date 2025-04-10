// components/BudgetChart.tsx
import { FC, useState } from 'react';
import { BudgetData } from '../types';

interface BudgetChartProps {
  data: BudgetData;
}

const BudgetChart: FC<BudgetChartProps> = ({ data }) => {
  const [filter, setFilter] = useState('All');
  
  return (
    <div className="border rounded-lg bg-white p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Consolidated budget</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex border rounded overflow-hidden text-sm">
            <button 
              className={`px-2 py-1 ${filter === 'D' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('D')}
            >
              D
            </button>
            <button 
              className={`px-2 py-1 ${filter === 'M' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('M')}
            >
              M
            </button>
            <button 
              className={`px-2 py-1 ${filter === 'Y' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('Y')}
            >
              Y
            </button>
            <button 
              className={`px-2 py-1 ${filter === 'All' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('All')}
            >
              All
            </button>
            <button 
              className={`px-2 py-1 ${filter === 'Custom' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('Custom')}
            >
              Custom
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-500"></div>
          <span>Revenues</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-400"></div>
          <span>Expenditures</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          $ $0 - $20,000
        </div>
      </div>
      
      <div className="relative h-60 mt-4">
        {/* This is a placeholder for the chart - in a real app you'd use a charting library */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Simulated chart lines with SVG */}
          <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
            <path d="M0,120 C50,100 100,150 150,120 C200,90 250,150 300,100 C350,50 400,130 450,80 C500,30 550,70 600,50 C650,30 700,90 750,70 L750,240 L0,240 Z" fill="rgba(20, 184, 166, 0.1)" strokeWidth="2" stroke="#14B8A6" />
            <path d="M0,120 C50,100 100,150 150,120 C200,90 250,150 300,100 C350,50 400,130 450,80 C500,30 550,70 600,50 C650,30 700,90 750,70" fill="none" strokeWidth="2" stroke="#14B8A6" />
            
            <path d="M0,160 C50,180 100,170 150,190 C200,210 250,170 300,180 C350,190 400,160 450,170 C500,180 550,160 600,180 C650,200 700,170 750,190 L750,240 L0,240 Z" fill="rgba(248, 113, 113, 0.1)" strokeWidth="2" stroke="#F87171" />
            <path d="M0,160 C50,180 100,170 150,190 C200,210 250,170 300,180 C350,190 400,160 450,170 C500,180 550,160 600,180 C650,200 700,170 750,190" fill="none" strokeWidth="2" stroke="#F87171" />
          </svg>
          
          {/* Data point tooltip */}
          <div className="absolute top-1/3 right-1/3 bg-white border rounded-lg shadow-lg p-3 w-48">
            <div className="text-sm font-medium">Jan 17, 24</div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-lg font-bold">$13,546</div>
              <div className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">+24,8%</div>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">+$5,413</div>
            <div className="border-t border-gray-100 my-2"></div>
            <div className="flex justify-between items-center">
              <div className="text-base">$4,254</div>
              <div className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded">+3,4%</div>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">-$2,768</div>
          </div>
        </div>
        
        {/* Chart timeline indicators */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pb-2">
          <div className="flex flex-col items-center">
            <div className="flex relative">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="mt-1">2 May, 23</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center z-10">
                <span className="text-green-600">💲</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center z-10">
                <span className="text-amber-600">🏆</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="mt-1">Jan 17, 24</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="mt-1">Increased</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="mt-1">Today, Nov 6, 24</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex relative">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15v-6m0 0l-3 3m3-3l3 3" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="mt-1">Est. 15 Mar, 25</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;