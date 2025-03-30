import  Car from "../models/carModel.js";
import { Review } from "../models/reviewModel.js";

export const addReview = async (req, res, next) => {
    try {
        const { carId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validate if the course exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }

        //const userOrder= Order.findOne({userId,courseId})
        // if(userOrder.paymentStatus !== "success" || userOrder.deliveryStatus !=="delivered" ){
        //      return res.status(404).json({ message: "user have no permission to add review" });
        //  }

        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a proper rating" });
        }

        // Create or update the review
        const review = await Review.findOneAndUpdate({ userId, carId }, { rating, comment }, { new: true, upsert: true });

        // Optionally, you can update the course's average rating here

        res.status(201).json({ data: review, message: "Review addedd" });
    } catch (error) {
        // next(error)

        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getCarReviews = async (req, res) => {
    try {
        const { carId } = req.params;

        const reviews = await Review.find({ carId }).populate("userId", "name").sort({ createdAt: -1 });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this course" });
        }

        res.status(200).json({ data: reviews, message: "course reviews fetched" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        console.log("Deleting review:", { reviewId, userId });

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await Review.deleteOne({ _id: reviewId });

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


export const getAverageRating = async (req, res) => {
    try {
        const { carId } = req.params;

        const reviews = await Review.find({ carId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this car" });
        }

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        res.status(200).json({ data: averageRating, message: "Average rating fetched" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};