// import Razorpay from "razorpay";
// import crypto from "crypto";
// import Order from "../models/orderModel.js";
// import Car from "../models/carModel.js";

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_SECRET,
// });

// // 🚗 **Checkout - Create Razorpay Order**
// export async function checkout(req, res) {
//     try {
//         const { carId, rentalDays, pickupDate, returnDate } = req.body;
//         const userId = req.user.id;

//         // Find the car details
//         const car = await Car.findById(carId);
//         if (!car) return res.status(404).json({ error: "Car not found" });

//         const totalAmount = rentalDays * car.pricePerDay;

//         // Create a Razorpay order
//         const options = {
//             amount: totalAmount * 100, // Convert to paisa
//             currency: "INR",
//             receipt: `receipt_${Date.now()}`,
//             payment_capture: 1, // Auto-capture payment
//         };

//         const order = await razorpay.orders.create(options);

//         // Save order in the database
//         const newOrder = new Order({
//             user: userId,
//             car: carId,
//             rentalDays,
//             totalAmount,
//             pickupDate,
//             returnDate,
//             razorpayOrderId: order.id,
//             paymentStatus: "pending",
//         });

//         await newOrder.save();

//         res.json({ orderId: order.id, amount: totalAmount, currency: "INR" });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// // ✅ **Verify Payment & Confirm Order**
// export async function verifyPayment(req, res) {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         // Fetch the order from the database
//         const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

//         if (!order) return res.status(404).json({ error: "Order not found" });

//         // Verify payment signature
//         const generated_signature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_SECRET)
//             .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//             .digest("hex");

//         if (generated_signature !== razorpay_signature) {
//             return res.status(400).json({ error: "Payment verification failed" });
//         }

//         // Update order status
//         order.razorpayPaymentId = razorpay_payment_id;
//         order.paymentStatus = "paid";
//         order.status = "confirmed";
//         await order.save();

//         res.json({ message: "Payment verified and order confirmed", order });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// // ❌ **Cancel Order**
// export async function cancelOrder(req, res) {
//     try {
//         const { id } = req.params;
//         const order = await Order.findById(id);

//         if (!order) return res.status(404).json({ error: "Order not found" });

//         order.status = "cancelled";
//         await order.save();

//         res.status(200).json({ message: "Order cancelled", order });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// // 📄 **Get Order Details**
// export async function getOrderDetails(req, res) {
//     try {
//         const order = await Order.findById(req.params.id).populate("car user");

//         if (!order) return res.status(404).json({ error: "Order not found" });

//         res.status(200).json({ order });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }
