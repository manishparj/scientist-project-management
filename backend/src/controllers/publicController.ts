import { Request, Response } from 'express';
import User from '../models/User.js';
import Project from '../models/Project';
import Staff from '../models/Staff';

export const getPublicDashboard = async (req: Request, res: Response) => {
  try {
    const scientists = await User.find().select('-password');
    
    const dashboardData = await Promise.all(
      scientists.map(async (scientist) => {
        const projects = await Project.find({ scientistId: scientist._id });
        
        const projectsWithStaff = await Promise.all(
          projects.map(async (project) => {
            const staff = await Staff.find({ projectId: project._id });
            return {
              ...project.toObject(),
              staff
            };
          })
        );
        
        return {
          scientist: {
            id: scientist._id,
            name: scientist.name,
            designation: scientist.designation,
            email: scientist.email,
            mobile: scientist.mobile
          },
          projects: projectsWithStaff
        };
      })
    );
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};