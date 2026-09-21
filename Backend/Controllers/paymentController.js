import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../Config/razorpay.js";
import Order from "../Model/Order.js";
import Product from "../Model/Product.js";


// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.userId.toString() !== order.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own order",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Duplicate Razorpay order protection
    if (order.razorpayOrderId) {
      return res.json({
        success: true,
        order: {
          id: order.razorpayOrderId,
          amount: Math.round(order.totalAmount * 100),
          currency: "INR",
        },
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Create Razorpay order:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};


// VERIFY RAZORPAY PAYMENT
export const verifyRazorpayPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing",
      });
    }

    // Find order
    const existingOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.userId.toString() !==
      existingOrder.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized payment",
      });
    }

    // Duplicate payment protection
    if (existingOrder.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // Signature verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Verify payment from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order mismatch",
      });
    }

    if (
      payment.amount !==
      Math.round(existingOrder.totalAmount * 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured",
      });
    }

    // MongoDB transaction
    session.startTransaction();

    const order = await Order.findById(existingOrder._id).session(
      session
    );

    if (!order) {
      throw new Error("Order not found");
    }

    // Re-check duplicate payment inside transaction
    if (order.paymentStatus === "PAID") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // Stock check + decrease
    for (const item of order.products) {
      const result = await Product.updateOne(
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
        { session }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          `Insufficient stock for ${item.title}`
        );
      }
    }

    // Update order
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";

    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Verify Razorpay payment:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  } finally {
    await session.endSession();
  }
};

// Refund 

export const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded",
      });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment not found",
      });
    }

    const refund = await razorpay.payments.refund(
      order.razorpayPaymentId,
      {
        amount: Math.round(order.totalAmount * 100),
        notes: {
          orderId: order._id.toString(),
        },
      }
    );

    order.paymentStatus = "REFUNDED";
    order.orderStatus = "CANCELLED";

    await order.save();

    res.json({
      success: true,
      message: "Payment refunded successfully",
      refund,
    });
  } catch (error) {
    console.error("Refund error:", error);

    res.status(500).json({
      success: false,
      message: "Refund failed",
    });
  }
};