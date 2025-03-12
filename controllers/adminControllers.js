
import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const adminSignup = async (req, res, next) => {
    try {
        //collect user data
        const { name, email, password, confirmPassword, mobile, profilePic } = req.body;

        //data validation
        if (!name || !email || !password || !confirmPassword || !mobile) {
            return res.status(400).json({ message: "all fields required" });
        }

        //check if already exist
        const userExist = await Admin.findOne({ email });

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
        const newUser = new Admin({ name, email, password: hashedPassword, mobile, profilePic });
        await newUser.save();

        //generate token usig Id and role
        const token = generateToken(newUser._id, "admin");
        res.cookie("token", token);

        res.json({ data: newUser, message: "signup success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
        console.log(error);
    }
};

export const adminLogin = async (req, res, next) => {
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
            return res.status(401).json({ message: "user account is not account" });
        }

        //generate token
        const token = generateToken(userExist._id, "user");
        res.cookie("token", token);

        res.json({ data: userExist, message: "Login success" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};
