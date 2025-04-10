// types/index.ts
export interface Deal {
    id: string;
    name: string;
    contact: {
      name: string;
      email: string;
      avatar: string;
    };
    value: number;
    source: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    certified: boolean;
    owner: {
      name: string;
      avatar: string;
    };
    lastEdited: string;
    scores: {
      sales: number;
      profit: number;
      customer: number;
    };
  }
  
  export interface BudgetData {
    revenues: number[];
    expenditures: number[];
    dates: string[];
    currentValue: {
      revenue: number;
      expenditure: number;
      change: {
        revenue: number;
        expenditure: number;
        revenuePercent: number;
        expenditurePercent: number;
      };
    };
  }