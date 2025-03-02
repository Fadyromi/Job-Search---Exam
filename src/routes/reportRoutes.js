import express from "express";
import Application from "../../models/Application.js";
import Company from "../../models/Company.js";
import User from "../../models/User.js";
import ExcelJS from "exceljs";

const router = express.Router();

// Endpoint to generate Excel sheet for applications on a specific day
router.get("/applications-report/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { date } = req.query; // Date in YYYY-MM-DD format

  try {
    // Find the company
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Find applications for the company on the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const applications = await Application.find({
      job: { $in: await Job.find({ company: companyId }).distinct("_id") },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("user", "firstName lastName email");

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for the specified date" });
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applications");

    // Add headers to the worksheet
    worksheet.columns = [
      { header: "Applicant Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Job Title", key: "jobTitle", width: 30 },
      { header: "Applied At", key: "appliedAt", width: 20 },
    ];

    // Add application data to the worksheet
    applications.forEach((application) => {
      worksheet.addRow({
        name: `${application.user.firstName} ${application.user.lastName}`,
        email: application.user.email,
        jobTitle: application.job.jobTitle,
        appliedAt: application.createdAt.toISOString(),
      });
    });

    // Set the response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applications_${date}.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
});

export default router;
