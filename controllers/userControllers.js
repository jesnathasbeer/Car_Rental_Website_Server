import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import nodemailer from "nodemailer";

export const userSignup = async (req, res, next) => {
    try {
        //collect user data
        const { name, email, password, confirmPassword, mobile, profilePic } = req.body;

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
        const newUser = new User({ name, email, password: hashedPassword, mobile, profilePic });
        await newUser.save();

        //generate token usig Id and role
        const token = generateToken(newUser._id, "user");
        res.cookie("token", token);

        res.json({ data: newUser, message: "signup success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
        console.log(error);
    }
};

export const userLogin = async (req, res, next) => {
    try {
        //collect user data
        const { email, password, confirmPassword } = req.body;

        //data validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: "all fields required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "password not same" });
        }

        // user exist - check
        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "user not found" });
        }

        //password match with DB
        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "invalid credentials" });
        }

        if (!userExist.isActive) {
            return res.status(401).json({ message: "user account is not active" });
        }

        //generate token
        const token = generateToken(userExist._id, "user");
        res.cookie("token", token);

        delete userExist._doc.password;
        res.json({ data: userExist, message: "Login success" });

        // {
        //     const { password, ...userDataWithoutPassword } = userExist;
        // res.json({ data: userDataWithoutPassword, message: "Login success" });
        // }
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
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
        res.clearCookie("token");

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
