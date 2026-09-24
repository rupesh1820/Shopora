import Cart from "../Model/Cart.js";

// ================= GET CART =================

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        products: [],
      });
    }

    // IMPORTANT: Product data populate
    await cart.populate({
      path: "products.productId",
    });

    console.log(
      "CART RESPONSE:",
      JSON.stringify(cart, null, 2)
    );

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
};


// ================= ADD TO CART =================

export const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      productId,
      quantity,
      selectedSize,
      selectedColor,
    } = req.body;

    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot add products to cart",
      });
    }

    if (req.user.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    if (!productId || !selectedSize || !selectedColor) {
      return res.status(400).json({
        success: false,
        message: "Product, size and color are required",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
      });
    }

    const existingItem = cart.products.find(
      (item) =>
        item.productId?.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity) || 1;
    } else {
      cart.products.push({
        productId,
        quantity: Number(quantity) || 1,
        selectedSize,
        selectedColor,
      });
    }

    await cart.save();

    await cart.populate("products.productId");

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to cart",
    });
  }
};


// ================= UPDATE QUANTITY =================

export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const {
      quantity,
      selectedSize,
      selectedColor,
    } = req.body;

    if (req.user.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.products.find(
      (item) =>
        item.productId?.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity = Number(quantity);

    await cart.save();

    await cart.populate("products.productId");

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart",
    });
  }
};


// ================= REMOVE ITEM =================

export const removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const {
      selectedSize,
      selectedColor,
    } = req.body;

    if (req.user.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const oldLength = cart.products.length;

    cart.products = cart.products.filter(
      (item) =>
        !(
          item.productId?.toString() === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );

    if (cart.products.length === oldLength) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await cart.save();

    await cart.populate("products.productId");

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove cart item",
    });
  }
};


// ================= CLEAR CART =================

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.products = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};