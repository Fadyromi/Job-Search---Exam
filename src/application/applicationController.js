import Application from '../models/Application.js';

export const createApplication = async (req, res , next) => {
  const { jobId, userId, userCV } = req.body;

  try {
    // Create application
    const application = await Application.create({
      jobId,
      userId,
      userCV,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error creating application', error });
  }
};