import { Request, Response } from 'express';
import Project from '../models/Project';
import Staff from '../models/Staff';

interface AuthRequest extends Request {
  userId?: string;
}

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectName, projectShortName, type, status, startDate, endDate, allocatedBudget, fundingAgency } = req.body;
    const scientistId = req.userId;
    
    // Get scientist name
    const User = await import('../models/User.js').then(m => m.default);
    const scientist = await User.findById(scientistId);
    
    if (!scientist) {
      return res.status(404).json({ message: 'Scientist not found' });
    }
    
    // Calculate durations
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const pendingDuration = today > end ? 0 : Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    const project = new Project({
      projectName,
      projectShortName,
      type,
      scientistId,
      scientistName: scientist.name,
      status,
      startDate,
      endDate,
      duration,
      pendingDuration,
      staffCount: 0,
      allocatedBudget,
      fundingAgency
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ scientistId: req.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Recalculate durations if dates changed
    if (updateData.startDate || updateData.endDate) {
      const project = await Project.findById(id);
      if (project) {
        const start = new Date(updateData.startDate || project.startDate);
        const end = new Date(updateData.endDate || project.endDate);
        const today = new Date();
        
        updateData.duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        updateData.pendingDuration = today > end ? 0 : Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
      }
    }
    
    const project = await Project.findOneAndUpdate(
      { _id: id, scientistId: req.userId },
      updateData,
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if project has staff
    const staffCount = await Staff.countDocuments({ projectId: id });
    if (staffCount > 0) {
      return res.status(400).json({ message: 'Cannot delete project with assigned staff' });
    }
    
    const project = await Project.findOneAndDelete({ _id: id, scientistId: req.userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};