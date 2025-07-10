import express from "express";
import { checkout, getOrderDetails, cancelOrder, payment, bookingStatus, getMyBookings } from "../controllers/orderControllers.js";
import { authUser } from "../middlewares/authUser.js";

const router = express.Router();

router.post("/checkout", authUser, checkout); // Checkout and pay
router.get("/mybookings", authUser, getMyBookings);
router.get("/:id", authUser, getOrderDetails); // Get order details
router.delete("/:id", authUser, cancelOrder); // Cancel order
router.post("/create-payment-intent", authUser, payment);
router.post("/save-booking", bookingStatus);
export { router as orderRouter };





















































