import e from "express";
import { checkUser, userLogin, userLogout, userProfieUpdate, userProfile, userSignup, userProfileDeactivate } from "../controllers/userControllers.js";
import { authUser } from "../middlewares/authUser.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = e.Router();

//sign up
router.post("/signup", userSignup);

//login
router.put("/login", userLogin);

//profile
router.get("/profile", authUser, userProfile);

//profile-edit
router.put("/update", authUser, userProfieUpdate);

//profile-deactivate
router.put("/deactivate", userProfileDeactivate);

//delete
router.delete("/delete-account");

//logout
router.get("/logout", userLogout);

//password-forgot
//password-change
//address update

router.put("/deactivate-user/:userId", authAdmin);

//check-user
router.get("/check-user", authUser, checkUser);

export { router as userRouter };