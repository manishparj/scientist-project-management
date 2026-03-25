import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectStaff {
  name: string;
  post: string;
  doj: Date;
  lastDate?: Date;
  presentlyWorking: boolean;
  mobile: string;
  email: string;
}

export interface IProject extends Document {
  projectName: string;
  startDate: Date;
  tentativeEndDate: Date;
  projectType: 'Research' | 'Development' | 'Consultancy' | 'Training';
  scientistId: mongoose.Types.ObjectId;
  staffDetails: IProjectStaff[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectStaffSchema = new Schema<IProjectStaff>(
  {
    name: { type: String, required: true },
    post: { type: String, required: true },
    doj: { type: Date, required: true },
    lastDate: { type: Date },
    presentlyWorking: { type: Boolean, default: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    tentativeEndDate: {
      type: Date,
      required: true,
    },
    projectType: {
      type: String,
      enum: ['Research', 'Development', 'Consultancy', 'Training'],
      required: true,
    },
    scientistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staffDetails: [ProjectStaffSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);