// backend/src/controllers/projectController.ts
import { Request, Response } from 'express';
import Project from '../models/Project.js';
import Staff from '../models/Staff.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { scientistId } = req.query;
    const filter: any = {};
    
    if (scientistId) {
      filter.scientistId = scientistId;
    }
    
    const projects = await Project.find(filter).populate('scientistId', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
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

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    await Staff.deleteMany({ projectId: id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};