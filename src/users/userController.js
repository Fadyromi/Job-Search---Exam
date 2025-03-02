import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, gender, DOB, mobileNumber } =
    req.body;

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (mobileNumber will be hashed by the pre-save hook in the schema)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      DOB,
      mobileNumber, // This will be hashed automatically before saving
    });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const verifyPhoneNumber = async (req, res) => {
  const { email, mobileNumber } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.compareMobileNumber(mobileNumber);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    res.status(200).json({ message: "Phone number verified" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying phone number", error });
  }
};

const userLogin = async (req, res, next) => {
  const user = await User.findOne({ email });
  if (user && (await user.compareMobileNumber(mobileNumber))) {
    // Phone number matches
  } else {
    // Phone number does not match
  }
};
