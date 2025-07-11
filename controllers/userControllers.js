import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import nodemailer from "nodemailer";
import { cloudinaryInstance } from '../config/cloudinary.js';

const NODE_ENV = process.env.NODE_ENV;

export const userSignup = async (req, res, next) => {
    try {
        //collect user data
        const { name, email, password, confirmPassword, mobile } = req.body;

        const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
        //data validation
        if (!name || !email || !password || !confirmPassword || !mobile) {
            return res.status(400).json({ message: "all fields required" });
        }

        //check if already exist
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "user already exist" });
        }

        //compare with confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "password not same" });
        }

        //password hashing
        const hashedPassword = bcrypt.hashSync(password, 10);

        //save to db
        const newUser = new User({ name, email, password: hashedPassword, mobile, image: cloudinaryRes.url, });
        await newUser.save();

        //generate token usig Id and role
        const token = generateToken(newUser._id, "user");
        res.cookie("token", token,{
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        res.json({ data: newUser, message: "signup success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
        console.log(error);
    }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body; // ✅ No confirmPassword here

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check account active
    if (!user.isActive) {
      return res.status(403).json({ message: "User account is not active" });
    }

    // 4. Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5. Generate token
    const token = generateToken(user._id, "user");

    // 6. Set httpOnly cookie
    res.cookie("token", token, {
      sameSite: NODE_ENV === "production" ? "None" : "Lax",
      secure: NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 7. Return user data (without password)
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      data: userWithoutPassword,
      message: "Login success",
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


export const userProfile = async (req, res, next) => {
    try {
        //user Id
        const userId = req.user.id;
        const userData = await User.findById(userId).select("-password");

        res.json({ data: userData, message: "user profile fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};

export const userProfieUpdate = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, mobile, profilePic } = req.body;

        //user Id
        const userId = req.user.id;
        const userData = await User.findByIdAndUpdate(
            userId,
            { name, email, password, confirmPassword, mobile, profilePic },
            { new: true }
        );

        res.json({ data: userData, message: "user profile fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};


export const userProfileDeactivate = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is already deactivated
        if (!userExist.isActive) {
            return res.status(400).json({ message: "User account is already deactivated" });
        }

        // Deactivate user
        userExist.isActive = false;
        await userExist.save();

        res.json({ message: "User account deactivated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};


export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token",{
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        res.json({  message: "user logout success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};


export const checkUser = async (req, res, next) => {
    try {
        res.status(200).json({
            message: "User authorized",
            user: req.user, // ← send user to frontend
          });
        // res.json({  message: "user autherized" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};

export const userProfileDelete = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user from database
        await User.findOneAndDelete({ email });

        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const userDeactivate = async (req, res, next) => {
    try {
        const userId = req.user.id; // Extract userId from authenticated request

        // Check if user exists
        const userExist = await User.findById(userId);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already deactivated
        if (!userExist.isActive) {
            return res.status(400).json({ message: "User account is already deactivated" });
        }

        // Deactivate user account
        userExist.isActive = false;
        await userExist.save();

        res.json({ message: "User account deactivated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};


// ✅ Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate Password Reset Token
        const resetToken = generateToken(user._id, "user");

        // Send Email with Reset Link
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: "your_email@gmail.com", pass: "your_email_password" },
        });

        const resetLink = `http://localhost:3002/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: "your_email@gmail.com",
            to: email,
            subject: "Password Reset Request",
            html: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
        });

        res.json({ message: "Password reset link sent" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) return res.status(400).json({ message: "Invalid or expired token" });

        // Check passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash new password and update user
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
