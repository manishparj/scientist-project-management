import { Request, Response } from 'express';
import User from '../models/User';

export const createScientist = async (req: Request, res: Response) => {
  try {
    const { name, email, password, designation, mobile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Scientist already exists' });
    }

    const scientist = await User.create({
      name,
      email,
      password,
      role: 'scientist',
      designation,
      mobile,
    });

    res.status(201).json({
      success: true,
      data: {
        id: scientist._id,
        name: scientist.name,
        email: scientist.email,
        designation: scientist.designation,
        mobile: scientist.mobile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllScientists = async (req: Request, res: Response) => {
  try {
    const scientists = await User.find({ role: 'scientist' }).select('-password');
    res.json({
      success: true,
      data: scientists,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScientistById = async (req: Request, res: Response) => {
  try {
    const scientist = await User.findById(req.params.id).select('-password');
    if (!scientist) {
      return res.status(404).json({ message: 'Scientist not found' });
    }
    res.json({
      success: true,
      data: scientist,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScientist = async (req: Request, res: Response) => {
  try {
    const scientist = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!scientist) {
      return res.status(404).json({ message: 'Scientist not found' });
    }

    res.json({
      success: true,
      data: scientist,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScientist = async (req: Request, res: Response) => {
  try {
    const scientist = await User.findByIdAndDelete(req.params.id);
    if (!scientist) {
      return res.status(404).json({ message: 'Scientist not found' });
    }
    res.json({
      success: true,
      message: 'Scientist deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};