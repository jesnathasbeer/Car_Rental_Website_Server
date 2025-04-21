import express from "express";
import { checkout, getOrderDetails, cancelOrder } from "../controllers/orderControllers.js";
import { authUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", authUser, checkout); // Checkout and pay
router.get("/:id", authUser, getOrderDetails); // Get order details
router.delete("/:id", authUser, cancelOrder); // Cancel order

export default router;
