import express from 'express';
import Company from '../models/Company.js';
import multer from 'multer';
import cloudinary from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// 1. Add company
router.post('/add', async (req, res) => {
  const { companyName, description, industry, address, numberOfEmployees, companyEmail, createdBy } = req.body;

  try {
    // Check if company email or name already exists
    const existingCompany = await Company.findOne({ $or: [{ companyEmail }, { companyName }] });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company email or name already exists' });
    }

    // Create company
    const company = await Company.create({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      createdBy,
    });

    res.status(201).json({ message: 'Company added successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error adding company', error });
  }
});

// 2. Update company data
router.put('/update/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const { userId, companyName, description, industry, address, numberOfEmployees } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Ensure only the company owner can update
    if (company.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the company owner can update the data' });
    }

    // Update company data
    if (companyName) company.companyName = companyName;
    if (description) company.description = description;
    if (industry) company.industry = industry;
    if (address) company.address = address;
    if (numberOfEmployees) company.numberOfEmployees = numberOfEmployees;

    await company.save();
    res.status(200).json({ message: 'Company updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error });
  }
});

// 3. Soft delete company
router.delete('/soft-delete/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const { userId, isAdmin } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Ensure only admin or company owner can delete
    if (!isAdmin && company.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin or company owner can perform this action' });
    }

    company.deletedAt = new Date();
    await company.save();

    res.status(200).json({ message: 'Company soft deleted successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting company', error });
  }
});

// 4. Get specific company with related jobs
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate('jobs');
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.status(200).json({ company });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company data', error });
  }
});

// 5. Search for a company by name
router.get('/search', async (req, res) => {
  const { name } = req.query;

  try {
    const companies = await Company.find({ companyName: { $regex: name, $options: 'i' } });
    res.status(200).json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Error searching for company', error });
  }
});

// 6. Upload company logo
router.post('/upload-logo/:companyId', upload.single('logo'), async (req, res) => {
  const { companyId } = req.params;

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const company = await Company.findByIdAndUpdate(
      companyId,
      { logo: { secure_url: result.secure_url, public_id: result.public_id } },
      { new: true }
    );
    res.status(200).json({ message: 'Company logo uploaded successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading company logo', error });
  }
});

// 7. Upload company cover picture
router.post('/upload-cover-pic/:companyId', upload.single('coverPic'), async (req, res) => {
  const { companyId } = req.params;

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const company = await Company.findByIdAndUpdate(
      companyId,
      { coverPic: { secure_url: result.secure_url, public_id: result.public_id } },
      { new: true }
    );
    res.status(200).json({ message: 'Company cover picture uploaded successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading company cover picture', error });
  }
});

// 8. Delete company logo
router.delete('/delete-logo/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { logo: { secure_url: null, public_id: null } },
      { new: true }
    );
    res.status(200).json({ message: 'Company logo deleted successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company logo', error });
  }
});

// 9. Delete company cover picture
router.delete('/delete-cover-pic/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { coverPic: { secure_url: null, public_id: null } },
      { new: true }
    );
    res.status(200).json({ message: 'Company cover picture deleted successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company cover picture', error });
  }
});

export default router;