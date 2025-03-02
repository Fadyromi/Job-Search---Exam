import express from "express";
import User from "../../models/User.js";
import Company from "../../models/Company.js";

const router = express.Router();

// 2. Ban or unban a specific user
router.put("/ban-user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { banned } = req.body; // true to ban, false to unban

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bannedAt = banned ? new Date() : null;
    await user.save();

    res.status(200).json({
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error banning/unbanning user", error });
  }
});

// 3. Ban or unban a specific company
router.put("/ban-company/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { banned } = req.body; // true to ban, false to unban

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.bannedAt = banned ? new Date() : null;
    await company.save();

    res.status(200).json({
      message: `Company ${banned ? "banned" : "unbanned"} successfully`,
      company,
    });
  } catch (error) {
    res.status(500).json({ message: "Error banning/unbanning company", error });
  }
});

// 4. Approve a company
router.put("/approve-company/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.approvedByAdmin = true;
    await company.save();

    res.status(200).json({ message: "Company approved successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Error approving company", error });
  }
});

export default router;
