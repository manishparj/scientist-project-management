// backend/src/models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  type: string;
  status: 'completed' | 'yet_to_start' | 'ongoing';
  startDate: Date;
  endDate: Date;
  scientistId: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'yet_to_start', 'ongoing'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  scientistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);