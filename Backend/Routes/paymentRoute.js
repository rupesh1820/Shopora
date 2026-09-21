import express from "express"

import { createRazorpayOrder, refundPayment, verifyRazorpayPayment } from "../Controllers/paymentController.js"

import requireAuth from "../Middleware/requireAuth.js"
import requireAdmin from "../Middleware/requireAdmin.js"

const paymentRouter = express.Router()

paymentRouter.post("/create-order", requireAuth, createRazorpayOrder)
paymentRouter.post("/verify", requireAuth, verifyRazorpayPayment)

paymentRouter.post("/refund/:orderId", requireAuth,requireAdmin, refundPayment)

export default paymentRouter;