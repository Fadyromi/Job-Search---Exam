import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userCV: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'viewed', 'in consideration', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true, 
  }
);



export default mongoose.model('Application', applicationSchema);
