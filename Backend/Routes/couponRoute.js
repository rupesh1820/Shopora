import express from "express";
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import {
  createCoupon,
  getCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
} from "../Controllers/couponController.js";

const couponRouter = express.Router();

// Get all coupons
couponRouter.get("/", getCoupons);

// Get coupon by code
couponRouter.get("/code/:code", getCouponByCode);

// Create coupon
couponRouter.post("/create",requireAuth,requireAdmin, createCoupon);

// Update coupon
couponRouter.put("/update/:id",requireAuth,requireAdmin, updateCoupon);

// Delete coupon
couponRouter.delete("/delete/:id",requireAuth,requireAdmin, deleteCoupon);

export default couponRouter;