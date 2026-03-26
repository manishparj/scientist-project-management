import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  mobile: string;
  designation: string;
  doj: Date;
  currentlyWorking: boolean;
  lastWorkingDay?: Date;
  email: string;
  leavingReason?: string;
  projectId: mongoose.Types.ObjectId;
  scientistId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  designation: { type: String, required: true },
  doj: { type: Date, required: true },
  currentlyWorking: { type: Boolean, default: true },
  lastWorkingDay: { type: Date },
  email: { type: String, required: true },
  leavingReason: { type: String },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  scientistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', StaffSchema);