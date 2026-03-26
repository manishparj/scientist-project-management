export interface User {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
}

export interface Project {
  _id: string;
  projectName: string;
  projectShortName: string;
  type: 'Intramural' | 'Extramural' | 'ICMR' | 'NHRP';
  scientistId: string;
  scientistName: string;
  status: 'On Going' | 'Completed' | 'Yet to start' | 'Cancelled' | 'Archive';
  startDate: string;
  endDate: string;
  duration: number;
  pendingDuration: number;
  staffCount: number;
  allocatedBudget: number;
  fundingAgency: 'ICMR' | 'NHRP' | 'PM-ABHIM' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  doj: string;
  currentlyWorking: boolean;
  lastWorkingDay?: string;
  email: string;
  leavingReason?: string;
  projectId: string;
  scientistId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardData {
  scientist: {
    id: string;
    name: string;
    designation: string;
    email: string;
    mobile: string;
  };
  projects: Array<Project & { staff: Staff[] }>;
}