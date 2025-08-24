import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import nodemailer from "nodemailer";
import { cloudinaryInstance } from '../config/cloudinary.js';

const NODE_ENV = process.env.NODE_ENV;

export const userSignup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    // ✅ Upload image if provided
    let imageurl;
    if (req.file) {
      const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
      imageurl = cloudinaryRes.url;
    } else {
      // ✅ Fallback default avatar
      imageurl = "https://www.366icons.com/media/01/profile-avatar-account-icon-16699.png";
    }

    // Data validation
    if (!name || !email || !password || !confirmPassword || !mobile) {
      return res.status(400).json({ message: "all fields required" });
    }

    // Check if already exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "user already exist" });
    }

    // Compare with confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password not same" });
    }

    // Password hashing
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Save to DB
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,   // ✅ use hashed, not plain password
      mobile,
      image: imageurl,            // ✅ either uploaded or fallback
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id, "user");
    res.cookie("token", token, {
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Include password explicitly
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, "user");

    res.cookie("token", token, {
      sameSite: NODE_ENV === "production" ? "None" : "Lax",
      secure: NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user._doc;

    // ✅ Match frontend expectation
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


export const userProfileUpdate = async (req, res, next) => {
  try {
    const { name, email, mobile } = req.body;
    const userId = req.user.id;

    // Prepare update fields
    const updateFields = { name, email, mobile };

    // Handle image upload to Cloudinary
    if (req.file) {
      const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
      updateFields.image = cloudinaryRes.url;
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    res.json({ data: updatedUser, message: "User profile updated successfully" });

  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
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
    res.clearCookie("token", {
      sameSite: NODE_ENV === "production" ? "None" : "Lax",
      secure: NODE_ENV === "production",
      httpOnly: NODE_ENV === "production",
    });

    res.json({ message: "user logout success" });
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
    const userId = req.user.id;

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userExist.isActive) {
      return res.status(400).json({ message: "User account is already deactivated" });
    }

    userExist.isActive = false;
    await userExist.save();

    // Optionally clear auth cookie if you're using it
    res.clearCookie("token");

    return res.json({ message: "User account deactivated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};



// ✅ Forgot Password
// export const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // Generate Password Reset Token
//         const resetToken = generateToken(user._id, "user");

//         // Send Email with Reset Link
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: { user: "your_email@gmail.com", pass: "your_email_password" },
//         });

//         const resetLink = `http://localhost:3002/reset-password/${resetToken}`;
//         await transporter.sendMail({
//             from: "your_email@gmail.com",
//             to: email,
//             subject: "Password Reset Request",
//             html: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
//         });

//         res.json({ message: "Password reset link sent" });
//     } catch (error) {
//         res.status(500).json({ message: error.message || "Internal server error" });
//     }
// };

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // ✅ Set the new password directly, let Mongoose hash it in pre-save hook
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

