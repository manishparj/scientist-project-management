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
  post: string;
  doj: Date;
  lastDate?: Date;
  presentlyWorking: boolean;
  mobile: string;
  email: string;
}

export interface Project {
  _id: string;
  projectName: string;
  startDate: Date;
  tentativeEndDate: Date;
  projectType: 'Research' | 'Development' | 'Consultancy' | 'Training';
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