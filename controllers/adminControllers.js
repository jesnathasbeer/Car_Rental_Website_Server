
import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

const NODE_ENV = process.env.NODE_ENV;

export const adminSignup = async (req, res, next) => {
    try {
        //collect user data
        const { name, email, password, confirmPassword, mobile, profilePic, role } = req.body;

        //data validation
        if (!name || !email || !password || !confirmPassword || !mobile) {
            return res.status(400).json({ message: "all fields required" });
        }

        //check if already exist
        const adminExist = await Admin.findOne({ email });

        if (adminExist) {
            return res.status(400).json({ message: "user already exist" });
        }

        //compare with confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "password not same" });
        }

        //password hashing
        const hashedPassword = bcrypt.hashSync(password, 10);

        //save to db
        const newAdmin = new Admin({ name, email, password: hashedPassword, mobile, profilePic, role });
        await newAdmin.save();

        //generate token usig Id and role
        const token = generateToken(newAdmin._id, "admin");
        res.cookie("token", token, {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        res.json({ data: newAdmin, message: "signup success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
        console.log(error);
    }
};

export const adminLogin = async (req, res, next) => {
    try {
        // Collect user data
        const { email, password } = req.body;

        // Data validation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if admin exists
        const adminExist = await Admin.findOne({ email, role: "admin" }); // ✅ Check for role: "admin"
        if (!adminExist) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Password match with DB
        const passwordMatch = bcrypt.compareSync(password, adminExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if admin is active
        if (!adminExist.isActive) {
            return res.status(403).json({ message: "Admin account is not active" });
        }

        // Generate token
        const token = generateToken(adminExist._id, "admin"); // ✅ Assign "admin" role
        res.cookie("token", token, {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        res.json({ data: adminExist, message: "Admin login successful" });
    } catch (error) {
        console.error("Admin Login Error:", error); // ✅ Log error for debugging
        res.status(500).json({ message: "Internal server error" });
    }
};

export const adminProfile = async (req, res, next) => {
    try {
        //user Id
        const adminId = req.user.id;
        console.log(adminId)
        const adminData = await Admin.findById(adminId).select("-password");

        res.json({ data: adminData, message: "user profile fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};



// export const adminProfile = async (req, res, next) => {
//     try {
//         //admin Id
//         const adminId = req.admin.id;
//         const adminData = await User.findById(adminId).select("-password");

//         res.json({ data: adminData, message: "admin profile fetched" });
//     } catch (error) {
//         res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
//     }
// };

export const adminProfileUpdate = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, mobile, profilePic, role } = req.body;

        //user Id
        const adminId = req.user.id;
        const adminData = await Admin.findByIdAndUpdate(
            adminId,
            { name, email, password, confirmPassword, mobile, profilePic, role },
            { new: true }
        );

        res.json({ data: adminData, message: "admin profile fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};

 export const adminProfileDeactivate = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const adminExist = await Admin.findOne({ email });
        if (!adminExist) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if user is already deactivated
        if (!adminExist.isActive) {
            return res.status(400).json({ message: "Admin account is already deactivated" });
        }

        // Deactivate user
        adminExist.isActive = false;
        await adminExist.save();

        res.json({ message: "User account deactivated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
 };

export const adminLogout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        res.json({  message: "admin logout success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};


export const checkAdmin = async (req, res, next) => {
    try {

        res.json({  message: "admin authorized" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};
