import Order from "../models/orderModel.js";
import Car from "../models/carModel.js";
import Stripe from "stripe";
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🚗 **Checkout & Create Order**
export async function checkout(req, res) {
  try {
    const { carId, rentalDays, pickupDate, returnDate, paymentMethodId, name, email, pickupLocation, dropoffLocation } = req.body;

    //const userId = req.user.id; // Authenticated user

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });


    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: "Car not found" });

    const totalAmount = rentalDays * car.pricePerDay;

    // Create payment intent in Stripe
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Create order in DB
    const order = new Order({
      user: userId,
      car: carId,
      rentalDays,
      totalAmount,
      pickupDate,
      returnDate,
      name,
      email,
      pickupLocation,
      dropoffLocation,
      paymentIntentId: paymentIntent.id,
      paymentStatus: "paid",
      status: "confirmed",
    });

    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

// 📄 **Get Order Details**
export async function getOrderDetails(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate("car user");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ❌ **Cancel Order**
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Refund logic (if applicable)
    if (order.paymentStatus === "paid") {
      await stripeInstance.refunds.create({
        payment_intent: order.paymentIntentId,
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// POST /api/payment/create-payment-intent
export async function payment(req, res) {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}


// POST /api/orders
export async function bookingStatus(req, res) {
  try {
    const userId = req.user?.id || req.body.user; // Use from token if authenticated

    const newOrder = new Order({
      ...req.body,
      user: userId,
    });

    await newOrder.save();
    res.status(201).json({ message: "Booking saved", order: newOrder });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).send("Error saving booking");



  }
}


