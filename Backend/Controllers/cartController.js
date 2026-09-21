import Cart from "../Model/Cart.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check user ownership
    if (req.user.userId.toString() !== userId) {
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

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      productId,
      quantity,
      selectedSize,
      selectedColor,
    } = req.body;

    // Check user ownership
    if (req.user.userId.toString() !== userId) {
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
        item.productId.toString() === productId &&
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

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const {
      quantity,
      selectedSize,
      selectedColor,
    } = req.body;

    // Check user ownership
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own cart",
      });
    }

    if (!quantity || quantity < 1) {
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
        item.productId.toString() === productId &&
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

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// Remove cart item
export const removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const {
      selectedSize,
      selectedColor,
    } = req.body;

    // Check user ownership
    if (req.user.userId.toString() !== userId) {
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
          item.productId.toString() === productId &&
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

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check user ownership
    if (req.user.userId.toString() !== userId) {
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

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};