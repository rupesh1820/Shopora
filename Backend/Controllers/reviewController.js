import Review from "../Model/Review.js";
import Product from "../Model/Product.js";

// Update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ productId });

  const count = reviews.length;

  const rating = count
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(rating.toFixed(1)),
    reviews: count,
  });
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment: comment.trim(),
    });

    await updateProductRating(productId);

    await review.populate(
      "userId",
      "fullName profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      userId: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      rating !== undefined &&
      (rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (rating !== undefined) review.rating = rating;

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty",
        });
      }

      review.comment = comment.trim();
    }

    await review.save();

    await updateProductRating(review.productId);

    await review.populate(
      "userId",
      "fullName profileImage"
    );

    res.json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await updateProductRating(review.productId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};