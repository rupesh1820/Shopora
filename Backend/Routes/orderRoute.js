import express from "express";
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import {
  getAllOrders,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../Controllers/orderController.js";

const orderRouter = express.Router();
orderRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  getAllOrders
);
// Create order
orderRouter.post("/:userId/create",requireAuth, createOrder);

// Get user's orders
orderRouter.get("/:userId",requireAuth, getUserOrders);

// Get single order
orderRouter.get("/single/:orderId",requireAuth, getOrderById);

// Cancel order
orderRouter.patch("/:userId/cancel/:orderId", requireAuth, cancelOrder);

// Update order status - Admin
orderRouter.patch("/status/:orderId",requireAuth,requireAdmin, updateOrderStatus);


export default orderRouter;