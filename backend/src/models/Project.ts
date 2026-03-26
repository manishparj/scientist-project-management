import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  projectShortName: string;
  type: 'Intramural' | 'Extramural' | 'ICMR' | 'NHRP';
  scientistId: mongoose.Types.ObjectId;
  scientistName: string;
  status: 'On Going' | 'Completed' | 'Yet to start' | 'Cancelled' | 'Archive';
  startDate: Date;
  endDate: Date;
  duration: number;
  pendingDuration: number;
  staffCount: number;
  allocatedBudget: number;
  fundingAgency: 'ICMR' | 'NHRP' | 'PM-ABHIM' | 'OTHER';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  projectName: { type: String, required: true },
  projectShortName: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Intramural', 'Extramural', 'ICMR', 'NHRP'], required: true },
  scientistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scientistName: { type: String, required: true },
  status: { type: String, enum: ['On Going', 'Completed', 'Yet to start', 'Cancelled', 'Archive'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  pendingDuration: { type: Number, required: true },
  staffCount: { type: Number, default: 0 },
  allocatedBudget: { type: Number, required: true },
  fundingAgency: { type: String, enum: ['ICMR', 'NHRP', 'PM-ABHIM', 'OTHER'], required: true },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);