import Order from "../models/orderModel.js";
import Car from "../models/carModel.js";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Checkout and payment
export async function checkout(req, res) {
  try {
    const {
      carId,
      pickupDate,
      returnDate,
      paymentMethodId,
      name,
      email,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!carId || !pickupDate || !returnDate || !paymentMethodId) {
      return res.status(400).json({ error: "Missing required booking details" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: "Car not found" });

    const price = Number(car.priceperday);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid car price" });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid pickup or return date" });
    }

    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (rentalDays <= 0) {
      return res.status(400).json({ error: "Invalid rental period" });
    }

    const totalAmount = rentalDays * price;
    const amountInCents = Math.round(totalAmount * 100);

    let paymentIntent;
    try {
      paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        payment_method: paymentMethodId,
        payment_method_types: ["card"],
        confirm: true,
      });
    } catch (stripeErr) {
      console.error("Stripe error:", stripeErr);
      return res.status(500).json({ error: stripeErr.message || "Stripe payment failed" });
    }

    const order = new Order({
      user: userId,
      car: carId,
      rentalDays,
      totalAmount,
      pickupDate,
      returnDate,
      pickupLocation,
      dropoffLocation,
      paymentIntentId: paymentIntent.id,
      paymentMethodId,
      paymentStatus: "paid",
      status: "confirmed",
      customerDetails: {
        fullName: name,
        email,
        phoneNumber: "N/A", // You can update if collecting phone number
      },
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

// 📄 Get Order Details
export async function getOrderDetails(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate("car user");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ❌ Cancel Order
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus === "paid") {
      try {
        await stripeInstance.refunds.create({
          payment_intent: order.paymentIntentId,
        });
      } catch (refundErr) {
        console.error("Refund error:", refundErr);
        return res.status(500).json({ error: "Failed to process refund" });
      }
    }

    order.status = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 🧾 Payment Intent (optional flow)
export async function payment(req, res) {
  const { amount } = req.body;

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return res.status(400).send({ error: "Invalid amount" });
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Create payment intent error:", err);
    res.status(500).send({ error: err.message });
  }
}

// 🗂️ Create Order without payment (admin/manual flow)
export async function bookingStatus(req, res) {
  try {
    const userId = req.user?.id || req.body.user;

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

// 📋 Get all bookings for current user
// export async function getMyBookings(req, res) {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ error: "Unauthorized" });

//     const bookings = await Order.find({ user: userId }).populate("car");

//     res.status(200).json({ bookings });
//   } catch (error) {
//     console.error("Get user bookings error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

export async function getMyBookings(req, res) {
  try {
    console.log("Decoded user:", req.user); // 👈 check if user is available

    const userId = req.user?.id;
    if (!userId) {
      console.log("No userId found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bookings = await Order.find({ user: userId }).populate("car");
    console.log("Fetched bookings:", bookings);

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

