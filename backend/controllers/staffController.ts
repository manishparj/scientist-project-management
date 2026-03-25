// backend/src/controllers/staffController.ts
import { Request, Response } from 'express';
import Staff from '../models/Staff.js';

export const createStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Staff.findByIdAndDelete(id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaffByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const staff = await Staff.find({ projectId });
    res.json(staff);
  } catch (error) {
    console.error('Get staff by project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};