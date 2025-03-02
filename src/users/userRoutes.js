import express from "express";
import User from "../../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import cloudinary from "cloudinary";

const userRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// 1. Update user account
userRouter.put("/update", async (req, res) => {
  const { userId, mobileNumber, DOB, firstName, lastName, gender } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (DOB) user.DOB = DOB;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

// 2. Get login user account data
userRouter.get("/me", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedMobileNumber = await user.decryptMobileNumber();
    res
      .status(200)
      .json({ ...user.toObject(), mobileNumber: decryptedMobileNumber });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

// 3. Get profile data for another user
userRouter.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedMobileNumber = await user.decryptMobileNumber();
    res.status(200).json({
      userName: `${user.firstName} ${user.lastName}`,
      mobileNumber: decryptedMobileNumber,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile data", error });
  }
});

// 4. Update password
userRouter.put("/update-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid old password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
});

// 5. Upload Profile Pic
userRouter.post(
  "/upload-profile-pic",
  upload.single("profilePic"),
  async (req, res) => {
    const { userId } = req.body;

    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      const user = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: {
            secure_url: result.secure_url,
            public_id: result.public_id,
          },
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Profile picture uploaded successfully", user });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error uploading profile picture", error });
    }
  }
);

// 6. Upload Cover Pic
userRouter.post(
  "/upload-cover-pic",
  upload.single("coverPic"),
  async (req, res) => {
    const { userId } = req.body;

    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      const user = await User.findByIdAndUpdate(
        userId,
        {
          coverPic: {
            secure_url: result.secure_url,
            public_id: result.public_id,
          },
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Cover picture uploaded successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error uploading cover picture", error });
    }
  }
);

// 7. Delete Profile Pic
userRouter.delete("/delete-profile-pic", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: { secure_url: null, public_id: null } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Profile picture deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profile picture", error });
  }
});

// 8. Delete Cover Pic
userRouter.delete("/delete-cover-pic", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { coverPic: { secure_url: null, public_id: null } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Cover picture deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cover picture", error });
  }
});

// 9. Soft delete account
userRouter.delete("/soft-delete", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { deletedAt: new Date() },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Account soft deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error soft deleting account", error });
  }
});

export default userRouter;
