import express from "express";

import requireAuth from "../Middleware/requireAuth.js";

import {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} from "../Controllers/reviewController.js";

const reviewRouter = express.Router();

// Get product reviews
reviewRouter.get(
  "/product/:productId",
  getProductReviews
);

// Add review
reviewRouter.post(
  "/:productId",
  requireAuth,
  addReview
);

// Update review
reviewRouter.put(
  "/update/:reviewId",
  requireAuth,
  updateReview
);

// Delete review
reviewRouter.delete(
  "/delete/:reviewId",
  requireAuth,
  deleteReview
);

export default reviewRouter;