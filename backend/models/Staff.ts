// backend/src/models/Staff.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  designation: string;
  doj: Date;
  currentlyWorking: boolean;
  lastDay?: Date;
  mobile: string;
  email: string;
  remark?: string;
  projectId: mongoose.Types.ObjectId;
  scientistId: mongoose.Types.ObjectId; // Add this field
}

const StaffSchema = new Schema<IStaff>({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  doj: {
    type: Date,
    required: true
  },
  currentlyWorking: {
    type: Boolean,
    default: true
  },
  lastDay: {
    type: Date
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  remark: {
    type: String
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  scientistId: {  // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IStaff>('Staff', StaffSchema);