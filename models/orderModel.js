import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    rentalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
    },
    paymentMethodId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    customerDetails: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
