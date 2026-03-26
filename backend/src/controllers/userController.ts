// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { log } from 'console';

export const getScientists = async (req: Request, res: Response) => {
  try {
    const scientists = await User.find({ role: 'scientist' }).select('-password');
    res.json(scientists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createScientist = async (req: Request, res: Response) => {
  try {
    const { name, email, password, designation, mobile } = req.body;
    
    const scientist = await User.create({
      name,
      email,
      password,
      role: 'scientist',
      designation,
      mobile
    });
    console.log('>>>>>>>>>>>>', scientist);
    
    
    res.status(201).json({
      _id: scientist._id,
      name: scientist.name,
      email: scientist.email,
      designation: scientist.designation,
      mobile: scientist.mobile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateScientist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const scientist = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    if (!scientist) {
      return res.status(404).json({ message: 'Scientist not found' });
    }
    
    res.json(scientist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteScientist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Scientist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};