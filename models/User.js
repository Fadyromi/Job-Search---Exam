import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'google-system',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Validate DOB is in the correct format and age is greater than 18
          const currentDate = new Date();
          const userDOB = new Date(value);
          const age = currentDate.getFullYear() - userDOB.getFullYear();
          return age > 18;
        },
        message: 'DOB must be in the format YYYY-MM-DD and age must be greater than 18 years.',
      },
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    changeCredentialTime: {
      type: Date,
      default: null,
    },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    CTP: [
      {
        codeHashed: String,
        type: {
          type: String,
          enum: ['confirmEmail', 'forgetPassword'],
        },
        expiresIn: Date,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash the mobile number before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('mobileNumber')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.mobileNumber = await bcrypt.hash(this.mobileNumber, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
  

// Virtual field for username
userSchema.virtual('username').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to decrypt mobile number
userSchema.methods.decryptMobileNumber = async function () {
    return this.mobileNumber; 
  }; 


// compare hashed mobile numbers
userSchema.methods.compareMobileNumber = async function (candidateMobileNumber) {
    return await bcrypt.compare(candidateMobileNumber, this.mobileNumber);
  };


export default mongoose.model('User', userSchema);