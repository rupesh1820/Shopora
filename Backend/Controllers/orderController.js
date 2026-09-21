import Order from "../Model/Order.js";
import Product from "../Model/Product.js";
import Coupon from "../Model/Coupon.js";
import mongoose from "mongoose";

// Get all orders - Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "fullName email")
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
    });
  }
};

// Create Order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { userId } = req.params;

    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only create order for your own account",
      });
    }

    const {
      products,
      shippingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (
      !products ||
      products.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Required order details are missing",
      });
    }

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    session.startTransaction();

    const orderProducts = [];
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!product) {
        throw new Error(
          `Product unavailable or insufficient stock`
        );
      }

      const itemTotal = product.price * item.quantity;

      totalAmount += itemTotal;

      orderProducts.push({
        productId: product._id,
        title: product.title,
        image: product.images[0] || "",
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        price: product.price,
      });
    }

    // Coupon
    let discountAmount = 0;
    let appliedCoupon = "";

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      }).session(session);

      if (!coupon) {
        throw new Error("Invalid coupon code");
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        throw new Error("Coupon has expired");
      }

      if (totalAmount < coupon.minOrder) {
        throw new Error(
          `Minimum order value is ₹${coupon.minOrder}`
        );
      }

      if (coupon.discountType === "percentage") {
        discountAmount =
          (totalAmount * coupon.discount) / 100;

        if (
          coupon.maxDiscount > 0 &&
          discountAmount > coupon.maxDiscount
        ) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === "fixed") {
        discountAmount = coupon.discount;
      }

      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }

      appliedCoupon = coupon.code;
    }

    const finalAmount = totalAmount - discountAmount;

    const order = await Order.create(
      [
        {
          userId,
          products: orderProducts,
          shippingAddress,
          totalAmount: finalAmount,
          paymentMethod,
          couponCode: appliedCoupon,
          discountAmount,
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order[0],
      priceDetails: {
        subtotal: totalAmount,
        discount: discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create order error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};
// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // User sirf apne orders dekh sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own orders",
      });
    }

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "products.productId"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // User sirf apna order dekh sakta hai
    if (req.user.userId.toString() !== order.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// Cancel order


export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { userId, orderId } = req.params;

    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own order",
      });
    }

    const existingOrder = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      [
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ].includes(existingOrder.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled now",
      });
    }

    // Razorpay refund first
    if (existingOrder.paymentStatus === "PAID") {
      if (!existingOrder.razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Razorpay payment ID not found",
        });
      }

      await razorpay.payments.refund(
        existingOrder.razorpayPaymentId,
        {
          amount: Math.round(
            existingOrder.totalAmount * 100
          ),
          notes: {
            orderId: existingOrder._id.toString(),
          },
        }
      );
    }

    // Database transaction
    session.startTransaction();

    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.orderStatus === "CANCELLED") {
      throw new Error("Order is already cancelled");
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        },
        { session }
      );
    }

    order.orderStatus = "CANCELLED";

    if (order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUNDED";
    }

    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message:
        existingOrder.paymentStatus === "PAID"
          ? "Order cancelled and refund initiated successfully"
          : "Order cancelled successfully",
      order,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Cancel order error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Unable to cancel order",
    });
  } finally {
    await session.endSession();
  }
};

// Update order status - Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const allowedStatus = [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

