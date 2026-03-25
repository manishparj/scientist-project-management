import { Request, Response } from 'express';
import Project from '../models/Project';

export const createProject = async (req: Request, res: Response) => {
  try {
    console.log('Received project data:', req.body); // Debug log
    
    const { projectName, startDate, tentativeEndDate, projectType, staffDetails } = req.body;
    
    // Validate required fields
    if (!projectName || !startDate || !tentativeEndDate || !projectType) {
      return res.status(400).json({ 
        message: 'Missing required fields: projectName, startDate, tentativeEndDate, projectType are required' 
      });
    }
    
    const project = await Project.create({
      projectName,
      startDate: new Date(startDate),
      tentativeEndDate: new Date(tentativeEndDate),
      projectType,
      staffDetails: staffDetails || [],
      scientistId: (req as any).user.id,
    });
    
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create project',
      details: error.errors 
    });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { scientistId } = req.query;
    let filter = {};
    
    if (scientistId) {
      filter = { scientistId };
    } else if ((req as any).user.role === 'scientist') {
      filter = { scientistId: (req as any).user.id };
    }
    
    const projects = await Project.find(filter).populate('scientistId', 'name email designation mobile');
    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id).populate('scientistId', 'name email designation mobile');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};