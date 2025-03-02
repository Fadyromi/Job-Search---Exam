import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Add Job
router.post('/add', async (req, res) => {
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, addedBy, company } = req.body;

  try {
    // Ensure the user is an HR or company owner
    const user = await User.findById(addedBy);
    if (!user || (user.role !== 'HR' && user.role !== 'Company Owner')) {
      return res.status(403).json({ message: 'Only HR or company owner can add jobs' });
    }

    // Create job
    const job = await Job.create({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy,
      company,
    });

    res.status(201).json({ message: 'Job added successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error adding job', error });
  }
});

// 2. Update Job
router.put('/update/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { userId, jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ensure only the job owner can update
    if (job.addedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the job owner can update the job' });
    }

    // Update job data
    if (jobTitle) job.jobTitle = jobTitle;
    if (jobLocation) job.jobLocation = jobLocation;
    if (workingTime) job.workingTime = workingTime;
    if (seniorityLevel) job.seniorityLevel = seniorityLevel;
    if (jobDescription) job.jobDescription = jobDescription;
    if (technicalSkills) job.technicalSkills = technicalSkills;
    if (softSkills) job.softSkills = softSkills;

    await job.save();
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error });
  }
});

// 3. Delete Job
router.delete('/delete/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ensure only the company HR or owner can delete
    const user = await User.findById(userId);
    if (!user || (user.role !== 'HR' && user.role !== 'Company Owner')) {
      return res.status(403).json({ message: 'Only company HR or owner can delete the job' });
    }

    await job.remove();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error });
  }
});

// 4. Get all Jobs or a specific one for a specific company
router.get('/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const { jobId, page = 1, limit = 10, sort = 'createdAt' } = req.query;

  try {
    let query = { company: companyId };
    if (jobId) query._id = jobId;

    const jobs = await Job.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('addedBy', 'firstName lastName');

    const totalCount = await Job.countDocuments(query);

    res.status(200).json({ jobs, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
});

// 5. Get all Jobs with filters
router.get('/search', async (req, res) => {
  const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills, page = 1, limit = 10, sort = 'createdAt' } = req.query;

  try {
    let query = {};
    if (workingTime) query.workingTime = workingTime;
    if (jobLocation) query.jobLocation = jobLocation;
    if (seniorityLevel) query.seniorityLevel = seniorityLevel;
    if (jobTitle) query.jobTitle = { $regex: jobTitle, $options: 'i' };
    if (technicalSkills) query.technicalSkills = { $in: technicalSkills.split(',') };

    const jobs = await Job.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('addedBy', 'firstName lastName');

    const totalCount = await Job.countDocuments(query);

    res.status(200).json({ jobs, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
});

// 6. Get all applications for a specific job
router.get('/applications/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

  try {
    const job = await Job.findById(jobId).populate({
      path: 'applications',
      populate: { path: 'user', select: 'firstName lastName email' },
      options: {
        sort,
        skip: (page - 1) * limit,
        limit,
      },
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const totalCount = await Application.countDocuments({ job: jobId });

    res.status(200).json({ applications: job.applications, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
});

// 7. Apply to Job
router.post('/apply/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.body;

  try {
    // Ensure the user is authorized to apply
    const user = await User.findById(userId);
    if (!user || user.role !== 'User') {
      return res.status(403).json({ message: 'Only users can apply to jobs' });
    }

    // Create application
    const application = await Application.create({ job: jobId, user: userId });

    // Emit socket event to notify HR
    req.io.to(jobId).emit('newApplication', application);

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Error applying to job', error });
  }
});

// 8. Accept or Reject an Applicant
router.put('/application/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { status, userId } = req.body;

  try {
    const application = await Application.findById(applicationId).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Ensure the user is an HR or company owner
    const user = await User.findById(userId);
    if (!user || (user.role !== 'HR' && user.role !== 'Company Owner')) {
      return res.status(403).json({ message: 'Only HR or company owner can perform this action' });
    }

    // Update application status
    application.status = status;
    await application.save();

    // Send email to the applicant
    const applicant = await User.findById(application.user);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: applicant.email,
      subject: `Your application has been ${status}`,
      text: `Your application for the job "${application.job.jobTitle}" has been ${status}.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Application ${status} successfully`, application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error });
  }
});

export default router;