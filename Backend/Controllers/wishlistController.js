import Wishlist from "../Model/Wishlist.js";

// Get user's Wishlist
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // User apni hi wishlist access kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own wishlist",
      });
    }

    let wishlist = await Wishlist.findOne({ userId }).populate("products");

    // Wishlist nahi hai to create karo
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    // User apni hi wishlist modify kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own wishlist",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [],
      });
    }

    const alreadyExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    wishlist.products.push(productId);

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // User apni hi wishlist modify kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own wishlist",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const oldLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    if (wishlist.products.length === oldLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // User apni hi wishlist clear kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own wishlist",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};