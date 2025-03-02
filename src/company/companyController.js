import Company from '../models/Company.js';

export const createCompany = async (req, res) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    createdBy,
    logo,
    coverPic,
    HRs,
    legalAttachment,
  } = req.body;

  try {
    // Create company
    const company = await Company.create({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      createdBy,
      logo,
      coverPic,
      HRs,
      legalAttachment,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error });
  }
};