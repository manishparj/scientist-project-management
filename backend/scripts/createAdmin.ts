import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scientist_management');
    
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });
    
    await superAdmin.save();
    
    console.log('✅ Super admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();