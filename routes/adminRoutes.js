import e from "express";
import { adminLogin, adminSignup } from "../controllers/adminControllers.js";

const router = e.Router();

//sign up
router.post("/signup", adminSignup);

//login
router.put("/login", adminLogin);

//profile
router.get("/profile");

//profile-edit
router.put("/update");

//profile-deactivate
router.put("/deactivate");

//delete
router.delete("/delete-account");

//logout
router.get("/logout");

//password-forgot
//password-change
//address update

//check-user

export { router as adminRouter };