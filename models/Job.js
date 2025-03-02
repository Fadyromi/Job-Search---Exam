import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      required: true,
      enum: ['onsite', 'remotely', 'hybrid'],
    },
    workingTime: {
      type: String,
      required: true,
      enum: ['part-time', 'full-time'],
    },
    seniorityLevel: { type: String, required: true, enum: ['Fresh', 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO'] },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

// Virtual populate for applications
jobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'job',
  });
  


export default mongoose.model('Job', jobSchema);