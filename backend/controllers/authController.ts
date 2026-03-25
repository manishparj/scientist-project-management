import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string, role: string): string => {
  // Use a default secret if not in env (only for development)
  const secret = process.env.JWT_SECRET || 'default_secret_key_for_development_only';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt?.sign(
    { id, role }, 
    secret, 
    { expiresIn }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, designation, mobile } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'scientist',
      designation,
      mobile
    });
    
    const token = generateToken(user._id.toString(), user.role);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled' });
    }
    
    const token = generateToken(user._id.toString(), user.role);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};