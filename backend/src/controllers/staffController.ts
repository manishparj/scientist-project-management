import { Request, Response } from 'express';
import Staff from '../models/Staff';
import Project from '../models/Project';

interface AuthRequest extends Request {
  userId?: string;
}

export const addStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, designation, doj, currentlyWorking, lastWorkingDay, email, leavingReason, projectId } = req.body;
    const scientistId = req.userId;
    
    // Verify project belongs to scientist
    const project = await Project.findOne({ _id: projectId, scientistId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const staff = new Staff({
      name,
      mobile,
      designation,
      doj,
      currentlyWorking,
      lastWorkingDay,
      email,
      leavingReason,
      projectId,
      scientistId
    });
    
    await staff.save();
    
    // Update project staff count
    const staffCount = await Staff.countDocuments({ projectId, currentlyWorking: true });
    await Project.findByIdAndUpdate(projectId, { staffCount });
    
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaffByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const staff = await Staff.find({ projectId, scientistId: req.userId }).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const staff = await Staff.findOneAndUpdate(
      { _id: id, scientistId: req.userId },
      updateData,
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Update project staff count if currentlyWorking changed
    if (updateData.currentlyWorking !== undefined) {
      const project = await Project.findById(staff.projectId);
      if (project) {
        const staffCount = await Staff.countDocuments({ 
          projectId: staff.projectId, 
          currentlyWorking: true 
        });
        await Project.findByIdAndUpdate(staff.projectId, { staffCount });
      }
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findOneAndDelete({ _id: id, scientistId: req.userId });
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Update project staff count
    const staffCount = await Staff.countDocuments({ 
      projectId: staff.projectId, 
      currentlyWorking: true 
    });
    await Project.findByIdAndUpdate(staff.projectId, { staffCount });
    
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};