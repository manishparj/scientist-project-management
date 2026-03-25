import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const superAdminExists = await User.findOne({ role: 'superadmin' });
    
    if (!superAdminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'superadmin',
        designation: 'System Administrator',
        mobile: '1234567890',
      });
      console.log('Super Admin created successfully');
    } else {
      console.log('Super Admin already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();