import e from "express";
import { adminLogin, adminSignup, getAdminStats, adminProfileUpdate, adminProfileDeactivate, adminLogout, checkAdmin, getAllUsers } from "../controllers/adminControllers.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = e.Router();

//sign up
router.post("/signup", adminSignup);

//login
router.put("/login", adminLogin);

//profile
// router.get("/profile",authAdmin, adminProfile);


//profile-edit
router.put("/update", authAdmin, adminProfileUpdate);

//profile-deactivate
router.put("/deactivate", adminProfileDeactivate);

//delete
//router.delete("/delete-account", profileDelete);

//logout
router.get("/logout", adminLogout);

//password-forgot
//password-change
//address update

//check-user
router.get("/check-admin", authAdmin, checkAdmin);

router.get("/stats", authAdmin, getAdminStats);
router.get("/users", getAllUsers);

export { router as adminRouter };