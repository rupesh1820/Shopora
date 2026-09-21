import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDb from "./Config/db.js";
import authRouter from "./Routes/authRoutes.js";
import productRouter from "./Routes/productRoute.js";
import categoryRouter from "./Routes/categoryRoute.js";
import cartRouter from "./Routes/cartRoute.js";
import wishlistRouter from "./Routes/wishlistRoute.js";
import addressRouter from "./Routes/adressRoute.js";
import orderRouter from "./Routes/orderRoute.js";
import couponRouter from "./Routes/couponRoute.js";
import reviewRouter from "./Routes/reviewRoute.js";
import analyticsRouter from "./Routes/anaylyticsRoute.js";
import userRouter from "./Routes/userRoute.js";
import paymentRouter from "./Routes/paymentRoute.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Shopara Server is Live");
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/address", addressRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/users", userRouter);
app.use("/api/payment", paymentRouter);

const Port = process.env.PORT || 5000;

app.listen(Port, () => {
  console.log(
    `Shopara server running on port http://localhost:${Port}`
  );

  connectDb();
});