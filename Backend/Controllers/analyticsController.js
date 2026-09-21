import Order from "../Model/Order.js";
import User from "../Model/User.js";
import Product from "../Model/Product.js";

// Get dashboard analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "user",
    });

    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalSales = salesData[0]?.totalSales || 0;

    const averageOrderValue =
      totalOrders > 0 ? totalSales / totalOrders : 0;

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email");

    res.status(200).json({
      success: true,
      analytics: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        monthlySales,
        orderStatus,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};