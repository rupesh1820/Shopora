import express from "express";
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import { getAnalytics } from "../Controllers/analyticsController.js";

const analyticsRouter = express.Router();

// Get analytics
analyticsRouter.get("/dashboard",requireAuth,requireAdmin, getAnalytics);

export default analyticsRouter;