import Job from '../models/Job.js';

export const createJob = async (req, res) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy,
  } = req.body;

  try {
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
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error });
  }
};