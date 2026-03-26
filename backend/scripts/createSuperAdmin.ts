import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/scientist_management';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    const existingAdmin = await User.findOne({
      email: 'admin1234@example.com'
    });

     const existingSci = await User.findOne({
      email: 'pk.anand@dmrcjodhpur.nic.in'
    });

    // if (existingAdmin) {
    //   console.log('⚠️ Admin already exists');
    //   await mongoose.disconnect();
    //   process.exit(0);
    // }

    // ✅ DO NOT HASH HERE
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin1234@example.com',
      password: 'admin123', // plain password
      role: 'super_admin',
      isActive: true
    });

    // ✅ DO NOT HASH HERE
    const sciAdmin = new User({
      name: 'Dr. Praveen Kumar Anand',
      email: 'pk.anand@dgmail.com',
      password: 'admin1234', // plain password
      role: 'scientist',
      designation: 'Scientist - F',
      mobile: '9999999999',
      isActive: true
    });

    // await superAdmin.save();
    await sciAdmin.save();


    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createSuperAdmin();