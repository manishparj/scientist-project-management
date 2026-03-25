export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'scientist';
  designation?: string;
  mobile?: string;
}

export interface ProjectStaff {
  _id?: string;
  name: string;
  designation: string;
  doj: Date;
  lastWorkingDay?: Date;
  currentlyWorking: boolean;
  mobile: string;
  email: string;
  remarks?: string;
}

export interface Project {
  _id: string;
  projectName: string;
  projectType: 'Research' | 'Development' | 'Consultancy' | 'Training';
  startDate: Date;
  endDate: Date;
  status: 'ongoing' | 'completed' | 'yet_to_start';
  scientistId: User;
  staffDetails: ProjectStaff[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}