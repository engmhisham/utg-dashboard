// app/page.tsx
'use client';

import React from 'react';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';
import { Project, BudgetData, Deal } from '../types';

// Mock data for the application
const projectData: Project = {
  id: '1',
  name: 'House Spectrum Ltd',
  certified: true,
  owner: {
    name: 'Jessica Parker',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  lastEdited: '7 hrs ago',
  scores: {
    sales: 5.3,
    profit: 2.4,
    customer: 7.8
  }
};

const budgetData: BudgetData = {
  revenues: [12000, 13500, 11800, 15000, 14200, 13800, 16500],
  expenditures: [8500, 9200, 8800, 9500, 10200, 9800, 10500],
  dates: ['2023-05-02', '2023-07-15', '2023-09-10', '2024-01-17', '2024-03-22', '2024-06-10', '2024-11-06'],
  currentValue: {
    revenue: 13546,
    expenditure: 4254,
    change: {
      revenue: 5413,
      expenditure: -2768,
      revenuePercent: 24.8,
      expenditurePercent: 3.4
    }
  }
};

const dealsData: Deal[] = [
  {
    id: '01',
    name: 'Acme',
    contact: {
      name: 'Tyra Dhillon',
      email: 'tyradhillon@acme.com',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    value: 3912,
    source: 'Social Networks'
  },
  {
    id: '02',
    name: 'Academic Project',
    contact: {
      name: 'Brittni Lando',
      email: 'lando@academicproject.com',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    value: 2345,
    source: 'Outreach'
  },
  {
    id: '03',
    name: 'Aimbus',
    contact: {
      name: 'Kevin Chen',
      email: 'chen@aimbus.com',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    value: 13864,
    source: 'Referrals'
  },
  {
    id: '04',
    name: 'Big Bang Production',
    contact: {
      name: 'Josh Ryan',
      email: 'joshryan@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    },
    value: 6314,
    source: 'Word-of-mouth'
  },
  {
    id: '05',
    name: 'Book Launch',
    contact: {
      name: 'Chieko Chute',
      email: 'chieko67@booklaunch.com',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg'
    },
    value: 5982,
    source: 'Outreach'
  }
];

export default function Page() {
  return (

      <Dashboard 
        project={projectData}
        budgetData={budgetData}
        deals={dealsData}
      />

  );
}
