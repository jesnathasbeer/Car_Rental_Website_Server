import e from "express";
import { checkUser, userLogin, userLogout, userProfieUpdate, userProfile, userSignup, userProfileDeactivate, userProfileDelete, userDeactivate } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import { upload } from '../middlewares/multer.js';

const router = e.Router();

//sign up
router.post("/signup",upload.single("image"), userSignup);

//login
router.put("/login", userLogin);

//profile
router.get("/profile", authUser, userProfile);

//profile-edit
router.put("/update", authUser, userProfieUpdate);

//profile-deactivate
router.put("/deactivate", userProfileDeactivate);

//delete
router.delete("/delete-account", userProfileDelete);

//logout
router.get("/logout", userLogout);

//password-forgot
//router.post("/forgot-password", authUser, forgotPassword);

//reset-password
//router.post("/reset-password/:token",authUser, resetPassword)

//password-change
//address update

//deactivate-user
router.put("/deactivate-user/:userId", authAdmin, userDeactivate);

//check-user
router.get("/check-user", authUser, checkUser);

export { router as userRouter };